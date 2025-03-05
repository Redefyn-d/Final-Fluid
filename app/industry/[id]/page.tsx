"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Layout from "../../components/layout"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { AlertTriangle, FileText } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription as DialogContentDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { createClient } from "@supabase/supabase-js"
import { jsPDF } from "jspdf"

// Mapping parameter labels to table column names.
const parameterMapping: { [key: string]: string } = {
  "pH": "ph",
  "Turbidity": "turbidity",
  "Temperature": "temperature",
  "TDS": "tds",
}

const parameters = ["pH", "Turbidity", "Temperature", "TDS"]

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function IndustryPage() {
  const params = useParams()
  const router = useRouter()
  const industryId = params.id as string

  // State for industry, owner details, and water quality data.
  const [industryDetails, setIndustryDetails] = useState<any | null>(null)
  const [ownerDetails, setOwnerDetails] = useState<any | null>(null)
  const [waterData, setWaterData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("incoming") // "incoming", "outgoing", "combined"
  const [reportType, setReportType] = useState("")
  const [date, setDate] = useState<Date>()

  // Fetch industry details from the "industries" table.
  useEffect(() => {
    async function fetchIndustry() {
      try {
        const { data, error } = await supabase
          .from("industries")
          .select("*")
          .eq("id", industryId)
          .single()
        if (error) {
          console.error("Error fetching industry:", error)
        } else {
          console.log("Fetched industry:", data)
          setIndustryDetails(data)
        }
      } catch (err) {
        console.error("Unexpected error fetching industry:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchIndustry()
  }, [industryId, supabase])

  // Fetch owner details from the "users" table using the owner_id from industry details.
  useEffect(() => {
    if (!industryDetails?.owner_id) return
    async function fetchOwner() {
      try {
        const { data, error } = await supabase
          .from("users")
          .select("*")
          .eq("id", industryDetails.owner_id)
          .single()
        if (error) {
          console.error("Error fetching owner:", error)
        } else {
          console.log("Fetched owner:", data)
          setOwnerDetails(data)
        }
      } catch (err) {
        console.error("Unexpected error fetching owner:", err)
      }
    }
    fetchOwner()
  }, [industryDetails, supabase])

  // Fetch water quality data from the "water_quality" table.
  useEffect(() => {
    async function fetchWaterData() {
      try {
        const { data, error } = await supabase
          .from("water_quality")
          .select("*")
          .eq("industry_id", industryId)
        if (error) {
          console.error("Error fetching water data:", error)
        } else {
          setWaterData(data || [])
        }
      } catch (err) {
        console.error("Unexpected error fetching water quality data:", err)
      }
    }
    fetchWaterData()
  }, [industryId, supabase])

  // Filter water quality data by kit type.
  const incomingData = waterData.filter(
    (entry) => entry.kit_type && entry.kit_type.toLowerCase() === "incoming"
  )
  const outgoingData = waterData.filter(
    (entry) => entry.kit_type && entry.kit_type.toLowerCase() === "outgoing"
  )

  // Prepare chartData based on the active tab.
  let chartData: any[] = []
  if (activeTab === "incoming") {
    chartData = incomingData
  } else if (activeTab === "outgoing") {
    chartData = outgoingData
  } else if (activeTab === "combined") {
    const combinedDataMap: Record<string, any> = {}
    incomingData.forEach((entry) => {
      const key = entry.measured_at
      if (!combinedDataMap[key]) combinedDataMap[key] = { measured_at: entry.measured_at }
      Object.keys(parameterMapping).forEach((param) => {
        const col = parameterMapping[param]
        combinedDataMap[key][`${col}Incoming`] = entry[col]
      })
    })
    outgoingData.forEach((entry) => {
      const key = entry.measured_at
      if (!combinedDataMap[key]) combinedDataMap[key] = { measured_at: entry.measured_at }
      Object.keys(parameterMapping).forEach((param) => {
        const col = parameterMapping[param]
        combinedDataMap[key][`${col}Outgoing`] = entry[col]
      })
    })
    chartData = Object.values(combinedDataMap).sort(
      (a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime()
    )
  }

  const handleSendWarning = async () => {
    if (!industryDetails || !ownerDetails) {
      console.error("Missing industry or owner details");
      return;
    }

    // Ensure waterData exists and has at least one entry.
    if (!waterData || waterData.length === 0) {
      console.error("No water quality data available.");
      return;
    }

    // Sort waterData to get the most recent measurement.
    const sortedData = [...waterData].sort(
      (a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime()
    );
    const latestData = sortedData[0];
    if (!latestData) {
      console.error("No latest water quality data available.");
      return;
    }

    // Define safe thresholds for each parameter.
    const safeThresholds: Record<
      string,
      {
        label: string;
        safeRange: string;
        check: (value: number) => boolean;
        displayName: string;
      }
    > = {
      ph: {
        label: "Safe Range",
        safeRange: "6.5–8.5",
        check: (value: number) => value < 6.5 || value > 8.5,
        displayName: "pH Level",
      },
      turbidity: {
        label: "Safe Limit",
        safeRange: "<5 NTU",
        check: (value: number) => value >= 5,
        displayName: "Turbidity",
      },
      temperature: {
        label: "Safe Range",
        safeRange: "Not specified",
        check: (_value: number) => false, // No threshold defined
        displayName: "Temperature",
      },
      tds: {
        label: "Safe Limit",
        safeRange: "Not specified",
        check: (_value: number) => false, // No threshold defined
        displayName: "TDS",
      },
      dissolved_oxygen: {
        label: "Safe Minimum",
        safeRange: "5 mg/L",
        check: (value: number) => value < 5,
        displayName: "Dissolved Oxygen",
      },
    };

    // Build a list of exceeded parameters.
    let exceededParameters: string[] = [];
    for (const key in safeThresholds) {
      if (latestData[key] !== undefined && latestData[key] !== null) {
        const value = parseFloat(latestData[key]);
        if (isNaN(value)) continue;
        if (safeThresholds[key].check(value)) {
          exceededParameters.push(
            `• ${safeThresholds[key].displayName} – ${safeThresholds[key].label}: ${safeThresholds[key].safeRange}, Detected: ${value}`
          );
        }
      }
    }

    // If no parameters have exceeded their thresholds, stop execution.
    if (exceededParameters.length === 0) {
      console.log("No parameter exceeded safe thresholds. No warning email sent.");
      return;
    }

    // Construct the email subject and body.
    const subject = `Urgent: Water Quality Alert for ${industryDetails.name}`;
    let emailBody = `Dear ${industryDetails.name} Team,\n\n`;
    emailBody +=
      "Our monitoring system, River AI, has detected the following water quality parameter(s) exceeding safe thresholds:\n\n";
    emailBody += exceededParameters.join("\n") + "\n\n";
    emailBody +=
      "This may indicate potential contamination risks. Kindly review the details and take corrective actions as necessary.\n\n";
    emailBody += "Best Regards,\n";
    emailBody += "River AI Monitoring Team";

    // Send the email by calling the backend API endpoint.
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: ownerDetails.email,
          subject,
          body: emailBody,
        }),
      });
      if (response.ok) {
        console.log("Warning email sent successfully.");
      } else {
        const errorText = await response.text();
        console.error("Failed to send email. Response:", errorText);
      }
    } catch (error) {
      console.error("Error sending warning email:", error);
    }
  };

  const handleShowFullDetails = () => {
    router.push(`/industry/${industryId}/details`)
  }

  const handleGenerateReport = () => {
    if (!reportType) return

    let reportTitle = ""
    let reportPeriod = ""

    switch (reportType) {
      case "1-day":
        reportTitle = "Daily Report"
        reportPeriod = date
          ? date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
          : "Selected Date"
        break
      case "1-week":
        reportTitle = "Weekly Report"
        reportPeriod = "Last 7 Days"
        break
      case "1-month":
        reportTitle = "Monthly Report"
        reportPeriod = "Last 30 Days"
        break
      case "1-year":
        reportTitle = "Annual Report"
        reportPeriod = "Last 12 Months"
        break
      default:
        reportTitle = "Report"
    }

    // Create a new jsPDF instance.
    const doc = new jsPDF()

    // Set Report Title and Header
    doc.setFontSize(18)
    doc.text(reportTitle, 20, 20)

    doc.setFontSize(12)
    let yPos = 35
    doc.text(`Industry: ${industryDetails.name}`, 20, yPos)
    yPos += 7
    doc.text(`Type: ${industryDetails.industry_type || "Not specified"}`, 20, yPos)
    yPos += 7
    doc.text(`Owner Email: ${ownerDetails?.email || "Not specified"}`, 20, yPos)
    yPos += 7
    doc.text(`Address: ${industryDetails.location || "Not specified"}`, 20, yPos)
    yPos += 7
    doc.text(`Contact: ${industryDetails.phone_number || "Not specified"}`, 20, yPos)
    yPos += 7
    doc.text(`Period: ${reportPeriod}`, 20, yPos)
    yPos += 10

    // Additional note confirming that the report was generated.
    doc.text("Report generated successfully!", 20, yPos)

    // Automatically trigger the download of the PDF.
    doc.save(`${reportTitle}.pdf`)
  }

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">Loading...</div>
      </Layout>
    )
  }

  if (!industryDetails) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">No industry details found.</div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>{industryDetails.name}</CardTitle>
                <CardDescription>
                  {industryDetails.industry_type || "Industry type not specified"}
                </CardDescription>
              </div>
              <div className="flex gap-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Generate Report</DialogTitle>
                      <DialogContentDescription>
                        Select the time period for the report.
                      </DialogContentDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Select onValueChange={setReportType}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1-day">1 Day</SelectItem>
                            <SelectItem value="1-week">1 Week</SelectItem>
                            <SelectItem value="1-month">1 Month</SelectItem>
                            <SelectItem value="1-year">1 Year</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {reportType === "1-day" && (
                        <div className="grid gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn("justify-start text-left font-normal", !date && "text-muted-foreground")}
                              >
                                {date
                                  ? date.toLocaleDateString("en-US", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })
                                  : "Pick a date"}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                            </PopoverContent>
                          </Popover>
                        </div>
                      )}
                      <Button onClick={handleGenerateReport}>Generate Report</Button>
                    </div>
                  </DialogContent>
                </Dialog>
                <Button onClick={handleSendWarning} variant="destructive">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Send Manual Warning
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Owner Email:</strong> {ownerDetails?.email || "Not specified"}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Address:</strong> {industryDetails.location || "Not specified"}
            </p>
            <p className="text-sm text-gray-600 mb-2">
              <strong>Contact:</strong> {industryDetails.phone_number || "Not specified"}
            </p>
            <Button onClick={handleShowFullDetails} className="mt-4">
              Show Full Details
            </Button>
          </CardContent>
        </Card>

        <h1 className="text-3xl font-bold mb-4 text-primary-800">Water Quality Data</h1>

        <Tabs defaultValue="incoming" className="mb-8">
          <TabsList>
            <TabsTrigger value="incoming" onClick={() => setActiveTab("incoming")}>
              Incoming Water
            </TabsTrigger>
            <TabsTrigger value="outgoing" onClick={() => setActiveTab("outgoing")}>
              Outgoing Water
            </TabsTrigger>
            <TabsTrigger value="combined" onClick={() => setActiveTab("combined")}>
              Combined Graph
            </TabsTrigger>
          </TabsList>

          {/* Incoming Water Tab */}
          <TabsContent value="incoming">
            <h2 className="text-2xl font-semibold mb-4 text-primary-700">
              Incoming Water Parameters
            </h2>
            {parameters.map((param) => (
              <Card key={param} className="mb-6">
                <CardHeader>
                  <CardTitle>{param}</CardTitle>
                  <CardDescription>24-hour monitoring data</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="measured_at"
                        tickFormatter={(tick) =>
                          tick ? new Date(tick).toLocaleTimeString() : ""
                        }
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey={parameterMapping[param]} stroke="#8884d8" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Outgoing Water Tab */}
          <TabsContent value="outgoing">
            <h2 className="text-2xl font-semibold mb-4 text-primary-700">
              Outgoing Water Parameters
            </h2>
            {parameters.map((param) => (
              <Card key={param} className="mb-6">
                <CardHeader>
                  <CardTitle>{param}</CardTitle>
                  <CardDescription>24-hour monitoring data</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="measured_at"
                        tickFormatter={(tick) =>
                          tick ? new Date(tick).toLocaleTimeString() : ""
                        }
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey={parameterMapping[param]} stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Combined Tab */}
          <TabsContent value="combined">
            <h2 className="text-2xl font-semibold mb-4 text-primary-700">
              Comparison: Incoming vs Outgoing Water
            </h2>
            {parameters.map((param) => (
              <Card key={param} className="mb-6">
                <CardHeader>
                  <CardTitle>{param}</CardTitle>
                  <CardDescription>24-hour comparison data</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="measured_at"
                        tickFormatter={(tick) =>
                          tick ? new Date(tick).toLocaleTimeString() : ""
                        }
                        allowDuplicatedCategory={false}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey={`${parameterMapping[param]}Incoming`}
                        stroke="#8884d8"
                        name={`Incoming ${param}`}
                      />
                      <Line
                        type="monotone"
                        dataKey={`${parameterMapping[param]}Outgoing`}
                        stroke="#82ca9d"
                        name={`Outgoing ${param}`}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  )
}

