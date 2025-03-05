import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import Layout from "@/app/components/layout"
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

interface Params {
  params: {
    id: string
  }
}

export default async function IndustrySectorPage({ params }: Params) {
  const sectorId = params.id

  // Read Supabase configuration from environment variables.
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase configuration in environment variables.")
  }

  // Create a Supabase client for server components.
  const supabase = createServerComponentClient({ cookies }, { 
    supabaseUrl,
    supabaseKey: supabaseAnonKey,
  })

  // 1. Fetch the specific sector details from the "sectors" table.
  const { data: sector, error: sectorError } = await supabase
    .from('sectors')
    .select('*')
    .eq('id', sectorId)
    .single()

  if (sectorError || !sector) {
    console.error("Error fetching sector:", sectorError)
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <p>Error fetching sector data.</p>
        </div>
      </Layout>
    )
  }

  // 2. Fetch the industries where the industry's industry_type matches the sector's name.
  const { data: fetchedIndustries, error: industriesError } = await supabase
    .from('industries')
    .select('*')
    .eq('industry_type', sector.sector_name)

  if (industriesError) {
    console.error("Error fetching industries:", industriesError)
  }
  
  // Fallback to an empty array in case no industries are found.
  const industries = fetchedIndustries ?? []

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Display the sector name rather than its id */}
        <h1 className="text-3xl font-bold mb-8 text-primary-800">
          Industries in Sector {sector.sector_name}
        </h1>

        {/* Render the industries cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {industries.map((industry: any) => (
            <Link href={`/industry/${industry.id}`} key={industry.id}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <CardTitle className="text-lg">{industry.name}</CardTitle>
                  <CardDescription>{industry.industry_code}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-2">Location: {industry.location}</p>
                  <p className="text-sm font-semibold">
                    Contact: {industry["phone_number"]}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  )
}

