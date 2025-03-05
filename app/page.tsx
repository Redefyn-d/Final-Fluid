import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Droplets, Shield, Zap } from "lucide-react"
import Link from "next/link"
import Layout from "./components/layout"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// Static alerts data
const alerts = [
  { id: 1, name: "KSR Textiles", parameter: "pH", value: 9.2, threshold: 8.5 },
  { id: 2, name: "EcoFiber", parameter: "Turbidity", value: 12, threshold: 10 },
  { id: 3, name: "GreenWeave", parameter: "Temperature", value: 35, threshold: 30 },
  { id: 4, name: "AquaPure Chemicals", parameter: "Dissolved Oxygen", value: 4, threshold: 5 },
];

export default async function Home() {
  // Read Supabase configuration from environment variables.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase configuration in environment variables.");
  }

  // Create a Supabase client configured for a server component using env variables.
  const supabase = createServerComponentClient({ cookies }, { 
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  });

  // Fetch data from the "sectors" table which includes:
  // id, sector_name, count, created_at, updated_at.
  const { data: fetchedSectors, error } = await supabase.from('sectors').select('*');

  if (error) {
    console.error("Error fetching sectors:", error);
  }

  // Fallback to an empty array in case no data is returned.
  const sectors = fetchedSectors ?? [];

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Alert Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-primary-800">Alert</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {alerts.map((alert) => (
              <Link href={`/industry/${alert.id}`} key={alert.id}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{alert.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-red-600 font-bold">{alert.parameter} Threshold Crossed</p>
                    <p className="text-sm">Current: {alert.value}</p>
                    <p className="text-sm">Threshold: {alert.threshold}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Sectors / Industry Cards Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-primary-800">Industries We Serve</h2>
          <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-6">
            {sectors.map((sector: any) => (
              <Link href={`/industry-sector/${sector.id}`} key={sector.id}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="text-lg">{sector.sector_name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-primary-600">{sector.count}</p>
                    <CardDescription>Active Clients</CardDescription>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-primary-800">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Real-time Monitoring",
                icon: Zap,
                description: "Continuous analysis of water quality parameters",
              },
              {
                title: "AI-Powered Insights",
                icon: BarChart,
                description: "Advanced analytics for predictive maintenance",
              },
              { title: "Compliance Assurance", icon: Shield, description: "Ensure adherence to regulatory standards" },
              {
                title: "Eco-friendly Solutions",
                icon: Droplets,
                description: "Promote sustainable water management practices",
              },
            ].map((feature, index) => (
              <Card key={index}>
                <CardHeader>
                  <feature.icon className="h-10 w-10 text-primary-600 mb-2" />
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Statistics Section */}
        <section className="bg-primary-50 rounded-3xl p-8 mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center text-primary-800">River AI Impact</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { value: "99.9%", label: "Accuracy in Detecting Anomalies" },
              { value: "50+", label: "Industries Served" },
              { value: "1M+", label: "Gallons of Water Optimized Daily" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <p className="text-4xl font-bold text-primary-600 mb-2">{stat.value}</p>
                <p className="text-lg text-primary-700">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 mt-16">
          <p>&copy; 2025 River AI. All rights reserved.</p>
          <p>Empowering industries with intelligent water quality monitoring solutions.</p>
        </footer>
      </div>
    </Layout>
  )
}

