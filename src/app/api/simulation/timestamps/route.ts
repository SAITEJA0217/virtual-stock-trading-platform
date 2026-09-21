import { NextResponse } from 'next/server';
import { getAvailableTimestamps } from '@/lib/market-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getAvailableTimestamps();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error in /api/simulation/timestamps:', error);
    return NextResponse.json({ error: 'Failed to fetch simulation timestamps' }, { status: 500 });
  }
}
