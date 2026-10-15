import { getRoastById } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const roast = await getRoastById(id);

        if (!roast) {
            return NextResponse.json({ error: 'Roast not found' }, { status: 404 });
        }

        return NextResponse.json(roast);
    } catch (error) {
        console.error('Error fetching shared roast:', error);
        return NextResponse.json({ error: 'Failed to fetch roast' }, { status: 500 });
    }
}
