import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const id = params.id;
    const body = await req.json();

    const { name, industry_code, industry_type, owner_id, location, phone_number, description, registration_number, water_source, daily_water_consumption, wastewater_generation, wastewater_treatment_methods, treated_water_reuse, discharge_points, environmental_clearance_certificate, pcb_approval_status, last_environment_audit_date, violations_reported, fine_or_legal_actions_taken } = body;

    const { data, error } = await supabase
        .from('industries')
        .update({
            name,
            industry_code,
            industry_type,
            owner_id,
            location,
            phone_number,
            description,
            registration_number,
            water_source,
            daily_water_consumption,
            wastewater_generation,
            wastewater_treatment_methods,
            treated_water_reuse,
            discharge_points,
            environmental_clearance_certificate,
            pcb_approval_status,
            last_environment_audit_date,
            violations_reported,
            fine_or_legal_actions_taken,
        })
        .eq('id', id);

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
}
