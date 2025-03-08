import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  const supabase = createServerComponentClient({ cookies });
  const newIndustry = await request.json();

  // Ensure the date is in the correct format
  const lastAuditDate = newIndustry.last_environmental_audit_date ? new Date(newIndustry.last_environmental_audit_date).toISOString().split('T')[0] : null;

  // Insert the new industry and return the inserted data
  const { data: insertData, error: insertError } = await supabase
    .from('industries')
    .insert([{
      name: newIndustry.name,
      industry_code: newIndustry.industry_code,
      industry_type: newIndustry.industry_type,
      owner_id: newIndustry.owner_id,
      created_at: newIndustry.created_at,
      location: newIndustry.location,
      phone_number: newIndustry.phone_number,
      description: newIndustry.description,
      registration_number: newIndustry.registration_number,
      water_source: newIndustry.water_source,
      daily_water_consumption: newIndustry.daily_water_consumption,
      wastewater_generation: newIndustry.wastewater_generation,
      wastewater_treatment_methods: newIndustry.wastewater_treatment_methods,
      treated_water_reuse: newIndustry.treated_water_reuse,
      discharge_points: newIndustry.discharge_points,
      environmental_clearance_certificate: newIndustry.environmental_clearance_certificate,
      pcb_approval_status: newIndustry.pcb_approval_status,
      last_environmental_audit_date: lastAuditDate,
      violations_reported: newIndustry.violations_reported,
      fine_or_legal_actions_taken: newIndustry.fine_or_legal_actions_taken,
    }])
    .select(); // Ensure to select the inserted data

  if (insertError) {
    console.error("Error adding industry:", insertError);
    return NextResponse.json({ success: false, error: insertError.message }, { status: 400 });
  }

  // Check if insertData is null or empty
  if (!insertData || insertData.length === 0) {
    return NextResponse.json({ success: false, error: "No data returned after insertion." }, { status: 400 });
  }

  // Fetch the current count for the specific sector_name
  const { data: sectorData, error: fetchError } = await supabase
    .from('sectors')
    .select('count')
    .eq('sector_name', newIndustry.industry_type)
    .single(); // Fetch a single record

  if (fetchError) {
    console.error("Error fetching sector count:", fetchError);
    return NextResponse.json({ success: false, error: fetchError.message }, { status: 400 });
  }

  // Increment the count
  const newCount = (sectorData?.count || 0) + 1;

  const { error: updateError } = await supabase
    .from('sectors')
    .update({ count: newCount }) // Set the new count
    .eq('sector_name', newIndustry.industry_type); // Match the sector_name

  if (updateError) {
    console.error("Error updating sector count:", updateError);
    return NextResponse.json({ success: false, error: updateError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, data: { ...insertData[0], id: insertData[0].id } }); // Ensure the ID is returned
} 