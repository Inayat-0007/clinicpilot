import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Perform a lightweight query to verify DB connectivity
    const { data, error } = await supabase.from('clinics').select('id').limit(1);

    if (error) {
      return NextResponse.json(
        { status: 'error', message: 'Database connection failed', error: error.message },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { status: 'ok', timestamp: new Date().toISOString() },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      { status: 'error', message: 'Internal server error' },
      { status: 500 }
    );
  }
}
