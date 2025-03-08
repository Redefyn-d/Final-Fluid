import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
    try {
        // Fetch alerts from the alerts table
        const { data: alerts, error: alertsError } = await supabase
            .from('alerts')
            .select('*')
            .order('alert_datetime', { ascending: false });

        // Fetch sectors with counts
        const { data: sectors, error: sectorsError } = await supabase
            .from('sectors')
            .select('*');

        if (alertsError || sectorsError) {
            return NextResponse.json(
                { error: 'Failed to fetch data' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            alerts: alerts || [],
            sectors: sectors || []
        });

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function fetchAlertsAndSectors() {
    const supabaseClient = createServerComponentClient({ cookies });

    // Fetch alerts
    const { data: alerts, error: alertsError } = await supabaseClient
        .from('alerts')
        .select('*');

    if (alertsError) {
        console.error("Error fetching alerts:", alertsError);
        return NextResponse.json({ alerts: [], sectors: [], error: alertsError.message });
    }

    // Fetch sectors
    const { data: fetchedSectors, error: sectorsError } = await supabaseClient
        .from('sectors')
        .select('*');

    if (sectorsError) {
        console.error("Error fetching sectors:", sectorsError);
        return NextResponse.json({ alerts, sectors: [], error: sectorsError.message });
    }

    return NextResponse.json({ alerts, sectors: fetchedSectors, error: null });
}
