"use client"

import { useState } from "react"
import Layout from "../components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Alert {
  id: string
  industryName: string
  sector: string
  parameter: string
  value: number
  threshold: number
  timestamp: Date
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    industryName: "KSR Textiles",
    sector: "Textile",
    parameter: "pH",
    value: 9.2,
    threshold: 8.5,
    timestamp: new Date("2024-02-04T10:30:00"),
  },
  {
    id: "2",
    industryName: "EcoFiber",
    sector: "Textile",
    parameter: "Turbidity",
    value: 12,
    threshold: 10,
    timestamp: new Date("2024-02-04T09:15:00"),
  },
  {
    id: "3",
    industryName: "GreenWeave",
    sector: "Textile",
    parameter: "Temperature",
    value: 35,
    threshold: 30,
    timestamp: new Date("2024-02-04T08:45:00"),
  },
  {
    id: "4",
    industryName: "AquaPure Chemicals",
    sector: "Chemical",
    parameter: "TDS",
    value: 2500,
    threshold: 2000,
    timestamp: new Date("2024-02-04T08:00:00"),
  },
  {
    id: "5",
    industryName: "PharmaCare",
    sector: "Pharmaceutical",
    parameter: "pH",
    value: 8.9,
    threshold: 8.0,
    timestamp: new Date("2024-02-04T07:30:00"),
  },
]

const sectors = ["Textile", "Chemical", "Pharmaceutical", "Food Processing", "Paper and Pulp", "Domestic"]

export default function NotificationsPage() {
  const [timeFilter, setTimeFilter] = useState("all")
  const [sectorFilter, setSectorFilter] = useState("all")
  const [industryFilter, setIndustryFilter] = useState("all")

  // Get unique industries for the selected sector
  const getIndustriesForSector = (sector: string) => {
    return [
      ...new Set(
        mockAlerts.filter((alert) => sector === "all" || alert.sector === sector).map((alert) => alert.industryName),
      ),
    ]
  }

  const filteredAlerts = mockAlerts.filter((alert) => {
    if (sectorFilter !== "all" && alert.sector !== sectorFilter) {
      return false
    }

    if (industryFilter !== "all" && alert.industryName !== industryFilter) {
      return false
    }

    const now = new Date()
    const alertTime = alert.timestamp

    switch (timeFilter) {
      case "24h":
        return now.getTime() - alertTime.getTime() <= 24 * 60 * 60 * 1000
      case "7d":
        return now.getTime() - alertTime.getTime() <= 7 * 24 * 60 * 60 * 1000
      case "30d":
        return now.getTime() - alertTime.getTime() <= 30 * 24 * 60 * 60 * 1000
      default:
        return true
    }
  })

  // Reset industry filter when sector changes
  const handleSectorChange = (value: string) => {
    setSectorFilter(value)
    setIndustryFilter("all")
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Alert History</h1>
          <div className="flex gap-4">
            <div>
              <Label htmlFor="timeFilter">Time Period</Label>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select time period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="24h">Last 24 Hours</SelectItem>
                  <SelectItem value="7d">Last 7 Days</SelectItem>
                  <SelectItem value="30d">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="sectorFilter">Sector</Label>
              <Select value={sectorFilter} onValueChange={handleSectorChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select sector" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sectors</SelectItem>
                  {sectors.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="industryFilter">Industry</Label>
              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Industries</SelectItem>
                  {getIndustriesForSector(sectorFilter).map((industry) => (
                    <SelectItem key={industry} value={industry}>
                      {industry}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <Card key={alert.id}>
              <CardHeader>
                <CardTitle>{alert.industryName}</CardTitle>
                <CardDescription>
                  {alert.sector} • {alert.timestamp.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-red-600 font-bold">{alert.parameter} Threshold Crossed</p>
                <p className="text-sm">Current: {alert.value}</p>
                <p className="text-sm">Threshold: {alert.threshold}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  )
}

