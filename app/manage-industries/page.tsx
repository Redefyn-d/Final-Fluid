"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Pencil, Plus } from "lucide-react"
import Layout from "../components/layout"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"

// Export the Industry interface with all required fields
export interface Industry {
  id: number
  name: string
  industry_code: string
  industry_type: string
  owner_id: string
  created_at: string
  location: string
  phone_number: string
  description?: string
  registration_number: string
  water_source: string
  daily_water_consumption: string
  wastewater_generation: string
  wastewater_treatment_methods: string
  treated_water_reuse: boolean
  discharge_points: string
  environmental_clearance_certificate: boolean
  pcb_approval_status: "approved" | "not approved"
  last_environmental_audit_date: string
  violations_reported: string
  fine_or_legal_actions_taken: string
}

interface ManageIndustriesProps {
  industries: Industry[]; // Accept industries as a prop
}

const industryTypes = ["Textile", "Paper and pulp", "Chemical", "Domestic", "Pharmaceutical", "Food processing"]
const industrySizes = ["Small", "Medium", "Large"]
const waterSources = ["River", "Groundwater", "Municipality", "Others"]
const wastewaterTreatmentMethods = ["None", "Primary", "Secondary", "Tertiary"]

export default function ManageIndustries({ industries = [] }: ManageIndustriesProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newIndustry, setNewIndustry] = useState<Industry>({
    id: 0,
    name: "",
    industry_code: "",
    industry_type: "",
    owner_id: "",
    created_at: new Date().toISOString(), // Set current date as default
    location: "",
    phone_number: "",
    description: "",
    registration_number: "",
    water_source: "",
    daily_water_consumption: "",
    wastewater_generation: "",
    wastewater_treatment_methods: "",
    treated_water_reuse: false,
    discharge_points: "",
    environmental_clearance_certificate: false,
    pcb_approval_status: "not approved",
    last_environmental_audit_date: "",
    violations_reported: "",
    fine_or_legal_actions_taken: "",
  })
  const [industriesList, setIndustriesList] = useState<Industry[]>(industries)
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null)
  const [sectorCounts, setSectorCounts] = useState<Record<string, number>>({})

  // Fetch sector counts when the component mounts
  useEffect(() => {
    const fetchSectorCounts = async () => {
      const response = await fetch('/api/getSectorCounts'); // Create an API route to get counts
      const data = await response.json();
      if (data.success) {
        setSectorCounts(data.counts); // Assuming the API returns counts in the format { "industry_type": count }
      }
    };
    fetchSectorCounts();
  }, []);

  // Function to fetch industries
  const fetchIndustries = async () => {
    const response = await fetch('/api/getIndustries'); // Create an API route to get industries
    const data = await response.json();
    if (data.success) {
      setIndustriesList(data.industries); // Assuming the API returns industries in the format { success: true, industries: [...] }
    } else {
      console.error("Failed to fetch industries:", data.error);
    }
  }

  // Call fetchIndustries when the component mounts
  useEffect(() => {
    fetchIndustries();
  }, []);

  const handleAddIndustry = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Attempting to add industry:", newIndustry);

    try {
        const response = await fetch('/api/addIndustry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newIndustry),
        });

        if (!response.ok) {
            const errorData = await response.json(); // Get the error response as JSON
            console.error("Failed to add industry:", errorData.error);
            return; // Exit the function if there's an error
        }

        const result = await response.json();

        if (result.success) {
            await fetchIndustries(); // Fetch industries again to show the updated list
            setShowAddForm(false); // Optionally close the form after submission
        } else {
            console.error("Failed to add industry:", result.error);
        }
    } catch (error) {
        console.error("An error occurred while adding the industry:", error);
    }
  }

  const handleEdit = (industry: Industry) => {
    setEditingIndustry(industry)
  }

  const handleUpdateIndustry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingIndustry) return;

    try {
        const response = await fetch(`/api/updateIndustry/${editingIndustry.id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(editingIndustry),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Failed to update industry:", errorData.error);
            return;
        }

        const result = await response.json();

        if (result.success) {
            await fetchIndustries(); // Fetch industries again to show the updated list
            setEditingIndustry(null); // Close the edit form
        } else {
            console.error("Failed to update industry:", result.error);
        }
    } catch (error) {
        console.error("An error occurred while updating the industry:", error);
    }
  }

  const groupedIndustries = industriesList.reduce((acc, industry) => {
    if (!acc[industry.industry_type]) {
      acc[industry.industry_type] = [];
    }
    acc[industry.industry_type].push(industry);
    return acc;
  }, {} as Record<string, Industry[]>);

  return (
    <Layout>
      <div className="container mx-auto pl-10 py-8">
        <h1 className="text-3xl font-bold mb-8">Manage Industries</h1>

        <Button onClick={() => setShowAddForm(!showAddForm)} className="mb-8">
          <Plus className="mr-2 h-4 w-4" /> {showAddForm ? "Close Form" : "Add Industry"}
        </Button>

        {showAddForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Add New Industry</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddIndustry} className="space-y-4">
                <div>
                  <Label htmlFor="industryName">Industry Name</Label>
                  <Input
                    id="industryName"
                    value={newIndustry.name}
                    onChange={(e) => setNewIndustry({ ...newIndustry, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="industryCode">Industry Code</Label>
                  <Input
                    id="industryCode"
                    value={newIndustry.industry_code}
                    onChange={(e) => setNewIndustry({ ...newIndustry, industry_code: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="industryType">Industry Type</Label>
                  <Select
                    value={newIndustry.industry_type}
                    onValueChange={(value: string) => setNewIndustry({ ...newIndustry, industry_type: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Industry Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {industryTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="ownerId">Owner ID</Label>
                  <Input
                    id="ownerId"
                    value={newIndustry.owner_id}
                    onChange={(e) => setNewIndustry({ ...newIndustry, owner_id: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phoneNumber">Phone Number</Label>
                  <Input
                    id="phoneNumber"
                    type="tel"
                    value={newIndustry.phone_number}
                    onChange={(e) => setNewIndustry({ ...newIndustry, phone_number: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newIndustry.description}
                    onChange={(e) => setNewIndustry({ ...newIndustry, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="registrationNumber">Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={newIndustry.registration_number}
                    onChange={(e) => setNewIndustry({ ...newIndustry, registration_number: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="waterSource">Water Source</Label>
                  <Input
                    id="waterSource"
                    value={newIndustry.water_source}
                    onChange={(e) => setNewIndustry({ ...newIndustry, water_source: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dailyWaterConsumption">Daily Water Consumption</Label>
                  <Input
                    id="dailyWaterConsumption"
                    value={newIndustry.daily_water_consumption}
                    onChange={(e) => setNewIndustry({ ...newIndustry, daily_water_consumption: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="wastewaterGeneration">Wastewater Generation</Label>
                  <Input
                    id="wastewaterGeneration"
                    value={newIndustry.wastewater_generation}
                    onChange={(e) => setNewIndustry({ ...newIndustry, wastewater_generation: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="wastewaterTreatmentMethods">Wastewater Treatment Methods</Label>
                  <Input
                    id="wastewaterTreatmentMethods"
                    value={newIndustry.wastewater_treatment_methods}
                    onChange={(e) => setNewIndustry({ ...newIndustry, wastewater_treatment_methods: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="treatedWaterReuse">Treated Water Reuse</Label>
                  <Select
                    value={newIndustry.treated_water_reuse ? "yes" : "no"}
                    onValueChange={(value: string) => setNewIndustry({ ...newIndustry, treated_water_reuse: value === "yes" })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dischargePoints">Discharge Points</Label>
                  <Input
                    id="dischargePoints"
                    value={newIndustry.discharge_points}
                    onChange={(e) => setNewIndustry({ ...newIndustry, discharge_points: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="environmentalClearanceCertificate">Environmental Clearance Certificate</Label>
                  <Select
                    value={newIndustry.environmental_clearance_certificate ? "yes" : "no"}
                    onValueChange={(value: string) => setNewIndustry({ ...newIndustry, environmental_clearance_certificate: value === "yes" })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="pcbApprovalStatus">PCB Approval Status</Label>
                  <Select
                    value={newIndustry.pcb_approval_status}
                    onValueChange={(value: "approved" | "not approved") => setNewIndustry({ ...newIndustry, pcb_approval_status: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="not approved">Not Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lastEnvironmentAuditDate">Last Environmental Audit Date</Label>
                  <Input
                    id="lastEnvironmentAuditDate"
                    type="date"
                    value={newIndustry.last_environmental_audit_date}
                    onChange={(e) => setNewIndustry({ ...newIndustry, last_environmental_audit_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="violationsReported">Violations Reported</Label>
                  <Input
                    id="violationsReported"
                    value={newIndustry.violations_reported}
                    onChange={(e) => setNewIndustry({ ...newIndustry, violations_reported: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="fineOrLegalActionsTaken">Fine or Legal Actions Taken</Label>
                  <Input
                    id="fineOrLegalActionsTaken"
                    value={newIndustry.fine_or_legal_actions_taken}
                    onChange={(e) => setNewIndustry({ ...newIndustry, fine_or_legal_actions_taken: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newIndustry.location}
                    onChange={(e) => setNewIndustry({ ...newIndustry, location: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit">Add Industry</Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Edit Industry Dialog */}
        <Dialog open={!!editingIndustry} onOpenChange={(open) => !open && setEditingIndustry(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Industry</DialogTitle>
              <DialogDescription>Update the industry details below.</DialogDescription>
            </DialogHeader>
            {editingIndustry && (
              <form onSubmit={handleUpdateIndustry} className="space-y-4 max-h-[500px] overflow-y-auto">
                <div>
                  <Label htmlFor="editName">Industry Name</Label>
                  <Input
                    id="editName"
                    value={editingIndustry.name}
                    onChange={(e) => setEditingIndustry({ ...editingIndustry, name: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editIndustryCode">Industry Code</Label>
                  <Input
                    id="editIndustryCode"
                    value={editingIndustry.industry_code}
                    onChange={(e) => setEditingIndustry({ ...editingIndustry, industry_code: e.target.value })}
                    required
                  />
                </div>
                {/* Display industry type and owner ID as read-only text */}
                <div>
                  <Label>Industry Type</Label>
                  <p className="text-sm text-gray-500 mt-1">{editingIndustry.industry_type}</p>
                </div>
                <div>
                  <Label>Owner ID</Label>
                  <p className="text-sm text-gray-500 mt-1">{editingIndustry.owner_id}</p>
                </div>
                <div>
                  <Label htmlFor="editLocation">Location</Label>
                  <Input
                    id="editLocation"
                    value={editingIndustry.location}
                    onChange={(e) => setEditingIndustry({ ...editingIndustry, location: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editPhoneNumber">Phone Number</Label>
                  <Input
                    id="editPhoneNumber"
                    type="tel"
                    value={editingIndustry.phone_number}
                    onChange={(e) => setEditingIndustry({ ...editingIndustry, phone_number: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editDescription">Description</Label>
                  <Textarea
                    id="editDescription"
                    value={editingIndustry.description}
                    onChange={(e) => setEditingIndustry({ ...editingIndustry, description: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editRegistrationNumber">Registration Number</Label>
                  <Input
                    id="editRegistrationNumber"
                    value={editingIndustry.registration_number}
                    onChange={(e) => setEditingIndustry({ ...editingIndustry, registration_number: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editWaterSource">Water Source</Label>
                  <Input
                    id="editWaterSource"
                    value={editingIndustry.water_source}
                    onChange={(e) => setEditingIndustry({ ...editingIndustry, water_source: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editDailyWaterConsumption">Daily Water Consumption</Label>
                  <Input
                    id="editDailyWaterConsumption"
                    value={editingIndustry.daily_water_consumption}
                    onChange={(e) => setEditingIndustry({ ...editingIndustry, daily_water_consumption: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editWastewaterGeneration">Wastewater Generation</Label>
                  <Input
                    id="editWastewaterGeneration"
                    value={editingIndustry.wastewater_generation}
                    onChange={(e) => setEditingIndustry({ ...editingIndustry, wastewater_generation: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editWastewaterTreatmentMethods">Wastewater Treatment Methods</Label>
                  <Input
                    id="editWastewaterTreatmentMethods"
                    value={editingIndustry.wastewater_treatment_methods}
                    onChange={(e) => setEditingIndustry({ ...editingIndustry, wastewater_treatment_methods: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editTreatedWaterReuse">Treated Water Reuse</Label>
                  <Select
                    value={editingIndustry.treated_water_reuse ? "yes" : "no"}
                    onValueChange={(value: string) => setEditingIndustry({ ...editingIndustry, treated_water_reuse: value === "yes" })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editDischargePoints">Discharge Points</Label>
                  <Input
                    id="editDischargePoints"
                    value={editingIndustry.discharge_points}
                    onChange={(e) => setEditingIndustry({ ...editingIndustry, discharge_points: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editEnvironmentalClearanceCertificate">Environmental Clearance Certificate</Label>
                  <Select
                    value={editingIndustry.environmental_clearance_certificate ? "yes" : "no"}
                    onValueChange={(value: string) => setEditingIndustry({ ...editingIndustry, environmental_clearance_certificate: value === "yes" })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes</SelectItem>
                      <SelectItem value="no">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editPcbApprovalStatus">PCB Approval Status</Label>
                  <Select
                    value={editingIndustry.pcb_approval_status}
                    onValueChange={(value: "approved" | "not approved") => setEditingIndustry({ ...editingIndustry, pcb_approval_status: value })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="not approved">Not Approved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="editLastEnvironmentAuditDate">Last Environmental Audit Date</Label>
                  <Input
                    id="editLastEnvironmentAuditDate"
                    type="date"
                    value={editingIndustry.last_environmental_audit_date}
                    onChange={(e) => setEditingIndustry({ ...editingIndustry, last_environmental_audit_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editViolationsReported">Violations Reported</Label>
                  <Input
                    id="editViolationsReported"
                    value={editingIndustry.violations_reported}
                    onChange={(e) => setEditingIndustry({ ...editingIndustry, violations_reported: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="editFineOrLegalActionsTaken">Fine or Legal Actions Taken</Label>
                  <Input
                    id="editFineOrLegalActionsTaken"
                    value={editingIndustry.fine_or_legal_actions_taken}
                    onChange={(e) => setEditingIndustry({ ...editingIndustry, fine_or_legal_actions_taken: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit">Save Changes</Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Display existing industries */}
        {Object.entries(groupedIndustries).map(([type, industries]) => (
          <Card key={type} className="mb-8 w-[calc(100%-16px)]">
            <CardHeader>
              <CardTitle>{type}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {industries.map((industry) => (
                  <Card key={industry.id} className="w-[calc(100%-16px)]">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{industry.name}</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(industry)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{industry.description}</p>
                      <p className="text-sm text-gray-600 mt-1">Reg. No: {industry.registration_number}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </Layout>
  )
}

