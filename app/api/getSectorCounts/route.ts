import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createServerComponentClient({ cookies });

  // Fetch the counts of industries grouped by sector_name
  const { data, error } = await supabase
    .from('sectors')
    .select('sector_name, count');

  if (error) {
    console.error("Error fetching sector counts:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  // Transform the data into a more usable format
  const counts = data.reduce((acc: Record<string, number>, sector: { sector_name: string; count: number }) => {
    acc[sector.sector_name] = sector.count;
    return acc;
  }, {});

  return NextResponse.json({ success: true, counts });
} 