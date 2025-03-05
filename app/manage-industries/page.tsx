"use client"

import { useState } from "react"
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

interface Industry {
  id: number
  name: string
  type: string
  description?: string
  ownerName?: string
  ownerEmail?: string
  ownerPhone?: string
  registrationNumber?: string
}

const industries: Industry[] = [
  {
    id: 1,
    name: "KSR Textiles",
    type: "Textile",
    description: "Leading textile manufacturer",
    ownerName: "John Doe",
    ownerEmail: "john@ksrtextiles.com",
    ownerPhone: "555-0123",
    registrationNumber: "TX001",
  },
  {
    id: 2,
    name: "EcoFiber",
    type: "Textile",
    description: "Eco-friendly fiber processing",
    ownerName: "Jane Smith",
    ownerEmail: "jane@ecofiber.com",
    ownerPhone: "555-0124",
    registrationNumber: "TX002",
  },
  {
    id: 3,
    name: "GreenWeave",
    type: "Textile",
    description: "Sustainable textile solutions",
    ownerName: "Peter Jones",
    ownerEmail: "peter@greenweave.com",
    ownerPhone: "555-0125",
    registrationNumber: "TX003",
  },
  {
    id: 4,
    name: "PharmaCare",
    type: "Pharmaceutical",
    description: "Pharmaceutical manufacturing",
    ownerName: "Mary Brown",
    ownerEmail: "mary@pharmacare.com",
    ownerPhone: "555-0126",
    registrationNumber: "PH001",
  },
  {
    id: 5,
    name: "MediCorp",
    type: "Pharmaceutical",
    description: "Medical device manufacturer",
    ownerName: "David Lee",
    ownerEmail: "david@medicorp.com",
    ownerPhone: "555-0127",
    registrationNumber: "PH002",
  },
  {
    id: 6,
    name: "FoodTech",
    type: "Food Processing",
    description: "Food processing and packaging",
    ownerName: "Sarah Williams",
    ownerEmail: "sarah@foodtech.com",
    ownerPhone: "555-0128",
    registrationNumber: "FP001",
  },
  {
    id: 7,
    name: "NutriBlend",
    type: "Food Processing",
    description: "Nutritional supplement producer",
    ownerName: "Michael Davis",
    ownerEmail: "michael@nutriblend.com",
    ownerPhone: "555-0129",
    registrationNumber: "FP002",
  },
]

const industryTypes = ["Textile", "Paper and pulp", "Chemical", "Domestic", "Pharmaceutical", "Food processing"]
const industrySizes = ["Small", "Medium", "Large"]
const waterSources = ["River", "Groundwater", "Municipality", "Others"]
const wastewaterTreatmentMethods = ["None", "Primary", "Secondary", "Tertiary"]

export default function ManageIndustries() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newIndustry, setNewIndustry] = useState({
    name: "",
    type: [],
    size: [],
    ownerName: "",
    ownerEmail: "",
    ownerPhone: "",
    latitude: "",
    longitude: "",
    registrationNumber: "",
    waterSource: [],
    waterConsumption: "",
    wastewaterGeneration: "",
    wastewaterTreatment: [],
    waterReuse: "",
    dischargePoints: "",
    environmentalClearance: "",
    pcbStatus: "",
    lastAuditDate: "",
    violations: "",
    legalActions: "",
    reportFrequency: "",
  })
  const [editingIndustry, setEditingIndustry] = useState<Industry | null>(null)

  const handleAddIndustry = (e: React.FormEvent) => {
    e.preventDefault()
    // Add new industry logic here
    console.log("New industry:", newIndustry)
    setNewIndustry({
      name: "",
      type: [],
      size: [],
      ownerName: "",
      ownerEmail: "",
      ownerPhone: "",
      latitude: "",
      longitude: "",
      registrationNumber: "",
      waterSource: [],
      waterConsumption: "",
      wastewaterGeneration: "",
      wastewaterTreatment: [],
      waterReuse: "",
      dischargePoints: "",
      environmentalClearance: "",
      pcbStatus: "",
      lastAuditDate: "",
      violations: "",
      legalActions: "",
      reportFrequency: "",
    })
    setShowAddForm(false)
  }

  const handleEdit = (industry: Industry) => {
    setEditingIndustry(industry)
  }

  const handleUpdateIndustry = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle update logic here
    console.log("Updated industry:", editingIndustry)
    setEditingIndustry(null)
  }

  const groupedIndustries = industries.reduce(
    (acc, industry) => {
      if (!acc[industry.type]) {
        acc[industry.type] = []
      }
      acc[industry.type].push(industry)
      return acc
    },
    {} as Record<string, typeof industries>,
  )

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Manage Industries</h1>

        <Button onClick={() => setShowAddForm(true)} className="mb-8">
          <Plus className="mr-2 h-4 w-4" /> Add Industry
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
                  <Label>Industry Type</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {industryTypes.map((type) => (
                      <div key={type} className="flex items-center space-x-2">
                        <Checkbox
                          id={`type-${type}`}
                          checked={newIndustry.type.includes(type)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewIndustry({ ...newIndustry, type: [...newIndustry.type, type] })
                            } else {
                              setNewIndustry({ ...newIndustry, type: newIndustry.type.filter((t) => t !== type) })
                            }
                          }}
                        />
                        <Label htmlFor={`type-${type}`}>{type}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Industry Size</Label>
                  <div className="flex space-x-4">
                    {industrySizes.map((size) => (
                      <div key={size} className="flex items-center space-x-2">
                        <Checkbox
                          id={`size-${size}`}
                          checked={newIndustry.size.includes(size)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewIndustry({ ...newIndustry, size: [...newIndustry.size, size] })
                            } else {
                              setNewIndustry({ ...newIndustry, size: newIndustry.size.filter((s) => s !== size) })
                            }
                          }}
                        />
                        <Label htmlFor={`size-${size}`}>{size}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="ownerName">Owner/Manager Name</Label>
                  <Input
                    id="ownerName"
                    value={newIndustry.ownerName}
                    onChange={(e) => setNewIndustry({ ...newIndustry, ownerName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="ownerEmail">Owner Email</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={newIndustry.ownerEmail}
                    onChange={(e) => setNewIndustry({ ...newIndustry, ownerEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="ownerPhone">Owner Phone Number</Label>
                  <Input
                    id="ownerPhone"
                    type="tel"
                    value={newIndustry.ownerPhone}
                    onChange={(e) => setNewIndustry({ ...newIndustry, ownerPhone: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      value={newIndustry.latitude}
                      onChange={(e) => setNewIndustry({ ...newIndustry, latitude: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      value={newIndustry.longitude}
                      onChange={(e) => setNewIndustry({ ...newIndustry, longitude: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="registrationNumber">Industry Registration Number</Label>
                  <Input
                    id="registrationNumber"
                    value={newIndustry.registrationNumber}
                    onChange={(e) => setNewIndustry({ ...newIndustry, registrationNumber: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Water Source</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {waterSources.map((source) => (
                      <div key={source} className="flex items-center space-x-2">
                        <Checkbox
                          id={`source-${source}`}
                          checked={newIndustry.waterSource.includes(source)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewIndustry({ ...newIndustry, waterSource: [...newIndustry.waterSource, source] })
                            } else {
                              setNewIndustry({
                                ...newIndustry,
                                waterSource: newIndustry.waterSource.filter((s) => s !== source),
                              })
                            }
                          }}
                        />
                        <Label htmlFor={`source-${source}`}>{source}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="waterConsumption">Daily Water Consumption (Liters/Day)</Label>
                  <Input
                    id="waterConsumption"
                    type="number"
                    value={newIndustry.waterConsumption}
                    onChange={(e) => setNewIndustry({ ...newIndustry, waterConsumption: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="wastewaterGeneration">Wastewater Generation (Liters/Day)</Label>
                  <Input
                    id="wastewaterGeneration"
                    type="number"
                    value={newIndustry.wastewaterGeneration}
                    onChange={(e) => setNewIndustry({ ...newIndustry, wastewaterGeneration: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Wastewater Treatment Methods Used</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {wastewaterTreatmentMethods.map((method) => (
                      <div key={method} className="flex items-center space-x-2">
                        <Checkbox
                          id={`treatment-${method}`}
                          checked={newIndustry.wastewaterTreatment.includes(method)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewIndustry({
                                ...newIndustry,
                                wastewaterTreatment: [...newIndustry.wastewaterTreatment, method],
                              })
                            } else {
                              setNewIndustry({
                                ...newIndustry,
                                wastewaterTreatment: newIndustry.wastewaterTreatment.filter((m) => m !== method),
                              })
                            }
                          }}
                        />
                        <Label htmlFor={`treatment-${method}`}>{method}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>Treated Water Reuse?</Label>
                  <RadioGroup
                    value={newIndustry.waterReuse}
                    onValueChange={(value) => setNewIndustry({ ...newIndustry, waterReuse: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="waterReuseYes" />
                      <Label htmlFor="waterReuseYes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="waterReuseNo" />
                      <Label htmlFor="waterReuseNo">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="dischargePoints">Discharge Points & GPS Location</Label>
                  <Input
                    id="dischargePoints"
                    value={newIndustry.dischargePoints}
                    onChange={(e) => setNewIndustry({ ...newIndustry, dischargePoints: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Environmental Clearance Certificate</Label>
                  <RadioGroup
                    value={newIndustry.environmentalClearance}
                    onValueChange={(value) => setNewIndustry({ ...newIndustry, environmentalClearance: value })}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="Yes" id="clearanceYes" />
                      <Label htmlFor="clearanceYes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="No" id="clearanceNo" />
                      <Label htmlFor="clearanceNo">No</Label>
                    </div>
                  </RadioGroup>
                </div>
                <div>
                  <Label htmlFor="pcbStatus">PCB Approval Status</Label>
                  <Select
                    value={newIndustry.pcbStatus}
                    onValueChange={(value) => setNewIndustry({ ...newIndustry, pcbStatus: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="lastAuditDate">Last Environmental Audit Date</Label>
                  <Input
                    id="lastAuditDate"
                    type="date"
                    value={newIndustry.lastAuditDate}
                    onChange={(e) => setNewIndustry({ ...newIndustry, lastAuditDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="violations">Violations Reported</Label>
                  <Textarea
                    id="violations"
                    value={newIndustry.violations}
                    onChange={(e) => setNewIndustry({ ...newIndustry, violations: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="legalActions">Fine or Legal Actions Taken</Label>
                  <Textarea
                    id="legalActions"
                    value={newIndustry.legalActions}
                    onChange={(e) => setNewIndustry({ ...newIndustry, legalActions: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="reportFrequency">Frequency of Pollution Reports Submitted</Label>
                  <Select
                    value={newIndustry.reportFrequency}
                    onValueChange={(value) => setNewIndustry({ ...newIndustry, reportFrequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Monthly">Monthly</SelectItem>
                      <SelectItem value="Quarterly">Quarterly</SelectItem>
                      <SelectItem value="Annually">Annually</SelectItem>
                    </SelectContent>
                  </Select>
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
              <form onSubmit={handleUpdateIndustry} className="space-y-4">
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
                  <Label htmlFor="editType">Industry Type</Label>
                  <Select
                    value={editingIndustry.type}
                    onValueChange={(value) => setEditingIndustry({ ...editingIndustry, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
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
                  <Label htmlFor="editDescription">Description</Label>
                  <Textarea
                    id="editDescription"
                    value={editingIndustry.description || ""}
                    onChange={(e) => setEditingIndustry({ ...editingIndustry, description: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editOwnerName">Owner Name</Label>
                  <Input
                    id="editOwnerName"
                    value={editingIndustry.ownerName || ""}
                    onChange={(e) => setEditingIndustry({ ...editingIndustry, ownerName: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editOwnerEmail">Owner Email</Label>
                  <Input
                    id="editOwnerEmail"
                    type="email"
                    value={editingIndustry.ownerEmail || ""}
                    onChange={(e) => setEditingIndustry({ ...editingIndustry, ownerEmail: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editOwnerPhone">Owner Phone</Label>
                  <Input
                    id="editOwnerPhone"
                    value={editingIndustry.ownerPhone || ""}
                    onChange={(e) => setEditingIndustry({ ...editingIndustry, ownerPhone: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="editRegistrationNumber">Registration Number</Label>
                  <Input
                    id="editRegistrationNumber"
                    value={editingIndustry.registrationNumber || ""}
                    onChange={(e) => setEditingIndustry({ ...editingIndustry, registrationNumber: e.target.value })}
                  />
                </div>
                <Button type="submit">Update Industry</Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {Object.entries(groupedIndustries).map(([type, industries]) => (
          <Card key={type} className="mb-8">
            <CardHeader>
              <CardTitle>{type}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {industries.map((industry) => (
                  <Card key={industry.id}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{industry.name}</CardTitle>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(industry)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600">{industry.description}</p>
                      <p className="text-sm text-gray-600 mt-1">Reg. No: {industry.registrationNumber}</p>
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

