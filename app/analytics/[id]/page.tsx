"use client"

import { useParams } from "next/navigation"
import Layout from "../../components/layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

const mockData = {
  incoming: [
    { name: "Jan", pH: 7.2, turbidity: 5, temperature: 20, tds: 250, dissolvedOxygen: 8 },
    { name: "Feb", pH: 7.1, turbidity: 6, temperature: 22, tds: 260, dissolvedOxygen: 7.8 },
    { name: "Mar", pH: 7.3, turbidity: 4, temperature: 21, tds: 240, dissolvedOxygen: 8.2 },
    { name: "Apr", pH: 7.0, turbidity: 7, temperature: 23, tds: 270, dissolvedOxygen: 7.5 },
  ],
  outgoing: [
    { name: "Jan", pH: 7.0, turbidity: 3, temperature: 21, tds: 220, dissolvedOxygen: 8.5 },
    { name: "Feb", pH: 7.2, turbidity: 4, temperature: 23, tds: 230, dissolvedOxygen: 8.3 },
    { name: "Mar", pH: 7.1, turbidity: 2, temperature: 22, tds: 210, dissolvedOxygen: 8.7 },
    { name: "Apr", pH: 7.3, turbidity: 5, temperature: 24, tds: 240, dissolvedOxygen: 8.1 },
  ],
}

const parameters = ["pH", "turbidity", "temperature", "tds", "dissolvedOxygen"]

const ChartComponent = ({ data, dataKey }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey={dataKey} stroke="#8884d8" activeDot={{ r: 8 }} />
    </LineChart>
  </ResponsiveContainer>
)

export default function AnalyticsPage() {
  const params = useParams()
  const industryId = params.id

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Analytics for Industry {industryId}</h1>

        <Tabs defaultValue="incoming">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="incoming">Incoming Water</TabsTrigger>
            <TabsTrigger value="outgoing">Outgoing Water</TabsTrigger>
          </TabsList>
          <TabsContent value="incoming">
            <Card>
              <CardHeader>
                <CardTitle>Incoming Water Analytics</CardTitle>
                <CardDescription>Water quality parameters for incoming water</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {parameters.map((param) => (
                  <Card key={param}>
                    <CardHeader>
                      <CardTitle>{param.charAt(0).toUpperCase() + param.slice(1)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartComponent data={mockData.incoming} dataKey={param} />
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="outgoing">
            <Card>
              <CardHeader>
                <CardTitle>Outgoing Water Analytics</CardTitle>
                <CardDescription>Water quality parameters for outgoing water</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {parameters.map((param) => (
                  <Card key={param}>
                    <CardHeader>
                      <CardTitle>{param.charAt(0).toUpperCase() + param.slice(1)}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartComponent data={mockData.outgoing} dataKey={param} />
                    </CardContent>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Combined Analytics</CardTitle>
            <CardDescription>Comparison of incoming and outgoing water parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {parameters.map((param) => (
              <Card key={param}>
                <CardHeader>
                  <CardTitle>{param.charAt(0).toUpperCase() + param.slice(1)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey={param} data={mockData.incoming} name="Incoming" stroke="#8884d8" />
                      <Line type="monotone" dataKey={param} data={mockData.outgoing} name="Outgoing" stroke="#82ca9d" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </div>
    </Layout>
  )
}

