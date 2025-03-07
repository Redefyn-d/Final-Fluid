import { NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createServerComponentClient({ cookies });

  const { data, error } = await supabase
    .from('industries')
    .select('*'); // Fetch all industries

  if (error) {
    console.error("Error fetching industries:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, industries: data });
} 