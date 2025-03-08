"use client"

import { useState, useEffect } from "react"  // Add useEffect
import Layout from "../components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface Alert {
  id: string
  industry_code: string
  industry_name: string
  industry_type: string
  parameter: string
  current_value: number
  threshold_value: number
  alert_datetime: Date  // Changed from created_at to match database
}


export default function NotificationsPage() {
  const [timeFilter, setTimeFilter] = useState("all")
  const [sectorFilter, setSectorFilter] = useState("all")
  const [industryFilter, setIndustryFilter] = useState("all")
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [sectors, setSectors] = useState<string[]>([])

  // Fetch alerts from API
  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch('/api/alerts')
        const data = await response.json()
        console.log('Fetched data:', data)
        
        // Handle alerts
        if (data.alerts) {
          const typedAlerts = data.alerts.map((alert: any) => ({
            ...alert,
            alert_datetime: new Date(alert.alert_datetime)
          }))
          setAlerts(typedAlerts)
        }

        // Handle sectors from the sectors array
        if (data.sectors) {
          const sectorNames = data.sectors.map((sector: any) => sector.sector_name)
          setSectors(sectorNames)
        }
      } catch (error) {
        console.error('Error fetching alerts:', error)
      }
    }

    fetchAlerts()
  }, [])

  // Update getIndustriesForSector to match sector_name
  const getFilteredIndustriesForSector = (sector: string) => {
    return [
      ...new Set(
        alerts.filter((alert) => 
          sector === "all" || alert.industry_type.trim() === sector.trim()
        ).map((alert) => alert.industry_name)
      ),
    ]
  }

  const filteredAlerts = alerts.filter((alert) => {
    // Filter by sector
    if (sectorFilter !== "all" && alert.industry_type.trim() !== sectorFilter.trim()) {
      return false
    }

    // Filter by industry
    if (industryFilter !== "all" && alert.industry_name.trim() !== industryFilter.trim()) {
      return false
    }

    // Filter by time
    const now = new Date()
    const alertTime = alert.alert_datetime
    const timeDiff = now.getTime() - alertTime.getTime()

    switch (timeFilter) {
      case "24h":
        return timeDiff <= 24 * 60 * 60 * 1000 // 24 hours in milliseconds
      case "7d":
        return timeDiff <= 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
      case "30d":
        return timeDiff <= 30 * 24 * 60 * 60 * 1000 // 30 days in milliseconds
      default:
        return true // Show all for "all" option
    }
  })

  // Update getIndustriesForSector to be more precise
  const getIndustriesForSector = (sector: string) => {
    return [
      ...new Set(
        alerts.filter((alert) => 
          sector === "all" || alert.industry_type.trim() === sector.trim()
        ).map((alert) => alert.industry_name)
      ),
    ]
  }

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
                <CardTitle>{alert.industry_name}</CardTitle>
                <CardDescription>
                  {alert.industry_type} • {alert.alert_datetime.toLocaleString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-red-600 font-bold">{alert.parameter} Threshold Crossed</p>
                <p className="text-sm">Current: {alert.current_value}</p>
                <p className="text-sm">Threshold: {alert.threshold_value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  )
}

