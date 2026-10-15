import { getRoastById, updateRoast, saveRoast } from '@/lib/db';
import { generateAIRoast } from '@/lib/roaster';
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        
        // Handle manual roast creation (No Spotify API required)
        if (body.is_manual) {
            const { manual_artists } = body;
            if (!manual_artists || !manual_artists.trim()) {
                return NextResponse.json({ error: 'Artists are required for manual roast' }, { status: 400 });
            }

            const artists = manual_artists.split(',').map(s => s.trim()).filter(Boolean);
            const signals = {
                popularity: 50,
                genres: ['manual taste'],
                vibe: { valence: 0.5, energy: 0.5, danceability: 0.5 },
                artistNames: artists,
                trackNames: [],
                recentlyPlayed: [],
                isManual: true
            };

            const roastResult = await generateAIRoast(signals);
            const savedRoast = await saveRoast({
                spotify_user: 'Broke AUX User',
                user_avatar: null,
                signals,
                title: roastResult.title,
                roast_text: roastResult.roast,
                level: roastResult.level,
                is_offline: roastResult.isOffline || false,
                top_artists: artists.map(name => ({ name, genres: [], image: null })),
                top_tracks: []
            });

            return NextResponse.json(savedRoast);
        }

        const { id, gemini_key } = body;

        if (!id) {
            return NextResponse.json({ error: 'Roast ID is required' }, { status: 400 });
        }

        const roast = await getRoastById(id);
        if (!roast) {
            return NextResponse.json({ error: 'Roast not found' }, { status: 404 });
        }

        // Save original key to restore later
        const originalApiKey = process.env.GEMINI_API_KEY;
        
        if (gemini_key) {
            process.env.GEMINI_API_KEY = gemini_key;
        }

        try {
            // Generate updated AI roast using stored signals
            const aiResult = await generateAIRoast(roast.signals);

            if (aiResult.isOffline && gemini_key) {
                // If it returned offline fallback despite key being provided, key might be invalid
                return NextResponse.json({ error: 'Failed to generate AI roast. Please check your Gemini API key.' }, { status: 400 });
            }

            const updatedRoast = await updateRoast(id, {
                title: aiResult.title,
                roast_text: aiResult.roast,
                level: aiResult.level,
                is_offline: aiResult.isOffline
            });

            return NextResponse.json(updatedRoast);
        } finally {
            // Restore original key
            if (originalApiKey) {
                process.env.GEMINI_API_KEY = originalApiKey;
            } else {
                delete process.env.GEMINI_API_KEY;
            }
        }
    } catch (error) {
        console.error('Error regenerating roast:', error);
        return NextResponse.json({ error: 'Failed to regenerate roast' }, { status: 500 });
    }
}
