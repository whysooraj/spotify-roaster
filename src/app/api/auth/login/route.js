import { getAuthUrl } from '@/lib/spotify';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const authUrl = getAuthUrl();
        return NextResponse.redirect(authUrl);
    } catch (error) {
        console.error('Error redirecting to Spotify login:', error);
        return NextResponse.json({ error: 'Failed to initiate login flow' }, { status: 500 });
    }
}
