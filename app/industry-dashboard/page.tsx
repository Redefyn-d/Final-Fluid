"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/hooks/useauth"
import Layout from "../components/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function IndustryDashboard() {
  const router = useRouter()
  const { user, loading, isIndustryOwner } = useAuth()

  useEffect(() => {
    if (!loading && !isIndustryOwner) {
      router.push("/login")
    }
  }, [loading, isIndustryOwner, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!isIndustryOwner) {
    return null
  }

  return (
    <Layout
      navigation={[
        {
          title: "Dashboard",
          href: "/industry-dashboard",
          icon: "dashboard",
        },
        {
          title: "Manage Notifications",
          href: "/notifications",
          icon: "bell",
        },
      ]}
    >
      <div className="container mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Industry Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Water Quality Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Monitor your water quality parameters in real-time</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Notifications</CardTitle>
            </CardHeader>
            <CardContent>
              <p>View your latest alerts and notifications</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Track your environmental compliance metrics</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  )
}