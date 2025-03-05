"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Head from "next/head";
import Layout from "../../../components/layout";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client using environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function IndustryDetailsPage() {
  // Use the "id" parameter from the URL as industryId
  const params = useParams();
  const industryId = params.id as string;

  const [industryDetails, setIndustryDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>("");

  // Fetch industry details from the "industries" table using the primary key "id".
  useEffect(() => {
    async function fetchIndustry() {
      if (!industryId) {
        setErrorMsg("No industry ID provided in URL.");
        setLoading(false);
        return;
      }
      try {
        // Query using the "id" column (not "industry_code")
        const { data, error } = await supabase
          .from("industries")
          .select("*")
          .eq("id", industryId)
          .single();

        if (error) {
          console.error("Error fetching industry:", error);
          setErrorMsg("Error fetching industry details.");
        } else if (!data) {
          console.error("Data returned:", data);
          setErrorMsg("Industry details not found.");
        } else {
          setIndustryDetails(data);
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setErrorMsg("Unexpected error occurred while fetching industry details.");
      } finally {
        setLoading(false);
      }
    }
    fetchIndustry();
  }, [industryId]);

  // Poll the water quality data at regular intervals. If the latest sample crosses the threshold,
  // insert an alert unless one already exists for that water quality measurement (using measured_at).
  useEffect(() => {
    if (!industryDetails) return;

    async function checkAndInsertAlert() {
      // Query the latest water quality record from the "water_quality" table using industry_id.
      const { data: waterData, error: waterError } = await supabase
        .from("water_quality")
        .select("*")
        .eq("industry_id", industryId)
        .order("measured_at", { ascending: false })
        .limit(1);

      if (waterError) {
        console.error("Error fetching water quality data:", waterError);
        return;
      }
      if (!waterData || waterData.length === 0) return;

      const sample = waterData[0];
      let alertData = null;

      // Check for pH threshold breach (safe range assumed as 6.5–8.5)
      if (typeof sample.ph === "number") {
        if (sample.ph > 8.5) {
          alertData = {
            industry_code: industryDetails.industry_code,
            industry_name: industryDetails.name,
            industry_type: industryDetails.industry_type,
            alert_datetime: new Date().toISOString(),
            parameter: "pH Threshold Crossed",
            current_value: sample.ph,
            threshold_value: 8.5,
            water_quality_measured_at: sample.measured_at,
          };
        } else if (sample.ph < 6.5) {
          alertData = {
            industry_code: industryDetails.industry_code,
            industry_name: industryDetails.name,
            industry_type: industryDetails.industry_type,
            alert_datetime: new Date().toISOString(),
            parameter: "pH Threshold Crossed",
            current_value: sample.ph,
            threshold_value: 6.5,
            water_quality_measured_at: sample.measured_at,
          };
        }
      }

      if (alertData) {
        // Check if an alert for this sample (using water_quality_measured_at) and parameter already exists.
        const { data: existingAlerts, error: existingError } = await supabase
          .from("alerts")
          .select("*")
          .eq("industry_code", industryDetails.industry_code)
          .eq("parameter", alertData.parameter)
          .eq("water_quality_measured_at", sample.measured_at);

        if (existingError) {
          console.error("Error checking existing alerts:", existingError);
          return;
        }

        if (existingAlerts && existingAlerts.length > 0) {
          console.log("Alert already exists for this water quality measurement.");
          return;
        } else {
          // Insert the alert into the alerts table.
          const { data: insertedAlert, error: insertError } = await supabase
            .from("alerts")
            .insert(alertData);
          if (insertError) {
            console.error("Error inserting alert:", insertError);
          } else {
            console.log("Alert inserted:", insertedAlert);
          }
        }
      }
    }

    // Run an immediate check once and then poll every 60 seconds.
    checkAndInsertAlert();
    const interval = setInterval(() => {
      checkAndInsertAlert();
    }, 60000); // 60000 ms = 1 minute

    return () => clearInterval(interval);
  }, [industryDetails, industryId]);

  if (loading) return <div className="p-4">Loading...</div>;
  if (errorMsg) return <div className="p-4 text-red-500">{errorMsg}</div>;

  return (
    <>
      <Head>
        <title>River ai - Industry Details: {industryDetails.name}</title>
      </Head>
      <Layout>
        <div className="container mx-auto p-4">
          <h1 className="text-3xl font-bold mb-6">
            River ai Dashboard: {industryDetails.name}
          </h1>

          {/* Basic Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <strong>Industry Code:</strong>
                  <p>{industryDetails.industry_code}</p>
                </div>
                <div>
                  <strong>Name:</strong>
                  <p>{industryDetails.name}</p>
                </div>
                <div>
                  <strong>Industry Type:</strong>
                  <p>{industryDetails.industry_type}</p>
                </div>
                <div>
                  <strong>Owner ID:</strong>
                  <p>{industryDetails.owner_id}</p>
                </div>
                <div>
                  <strong>Phone Number:</strong>
                  <p>{industryDetails.phone_number}</p>
                </div>
                <div>
                  <strong>Registration Number:</strong>
                  <p>{industryDetails.registration_number}</p>
                </div>
                <div>
                  <strong>Created At:</strong>
                  <p>
                    {industryDetails.created_at
                      ? new Date(industryDetails.created_at).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <strong>Location:</strong>
                  <p>{industryDetails.location}</p>
                </div>
                <div className="sm:col-span-2">
                  <strong>Description:</strong>
                  <p>{industryDetails.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Water Usage and Discharge Details */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Water Usage and Discharge Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <strong>Water Source:</strong>
                  <p>
                    {Array.isArray(industryDetails.water_source)
                      ? industryDetails.water_source.join(", ")
                      : industryDetails.water_source || "N/A"}
                  </p>
                </div>
                <div>
                  <strong>Daily Water Consumption:</strong>
                  <p>{industryDetails.daily_water_consumption || "N/A"}</p>
                </div>
                <div>
                  <strong>Wastewater Generation:</strong>
                  <p>{industryDetails.wastewater_generation || "N/A"}</p>
                </div>
                <div>
                  <strong>Wastewater Treatment Methods:</strong>
                  <p>
                    {Array.isArray(industryDetails.wastewater_treatment_methods)
                      ? industryDetails.wastewater_treatment_methods.join(", ")
                      : industryDetails.wastewater_treatment_methods || "N/A"}
                  </p>
                </div>
                <div>
                  <strong>Treated Water Reuse:</strong>
                  <p>
                    {typeof industryDetails.treated_water_reuse === "boolean"
                      ? (industryDetails.treated_water_reuse ? "Yes" : "No")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <strong>Discharge Points:</strong>
                  <p>{industryDetails.discharge_points || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance & Regulatory Data */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Compliance & Regulatory Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <strong>Environmental Clearance Certificate:</strong>
                  <p>
                    {typeof industryDetails.environmental_clearance_certificate === "boolean"
                      ? (industryDetails.environmental_clearance_certificate ? "Yes" : "No")
                      : "N/A"}
                  </p>
                </div>
                <div>
                  <strong>PCB Approval Status:</strong>
                  <p>{industryDetails.pcb_approval_status || "N/A"}</p>
                </div>
                <div>
                  <strong>Violations Reported:</strong>
                  <p>{industryDetails.violations_reported || "N/A"}</p>
                </div>
                <div>
                  <strong>Fine or Legal Actions Taken:</strong>
                  <p>{industryDetails.fine_or_legal_actions_taken || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    </>
  );
}