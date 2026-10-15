import { exchangeCodeForTokens, getTopArtists, getTopTracks, getAudioFeatures, fetchSpotifyApi, getRecentlyPlayedTracks } from '@/lib/spotify';
import { generateAIRoast } from '@/lib/roaster';
import { saveRoast } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'Authorization code missing' }, { status: 400 });
    }

    try {
        // 1. Exchange authorization code for access token
        const tokens = await exchangeCodeForTokens(code);
        const accessToken = tokens.access_token;

        // 2. Fetch User Profile, Top Artists, and Top Tracks with fallback for 403 premium restrictions
        let profile = { display_name: 'Broke NPC', id: 'broke_npc', images: [] };
        let artists = [];
        let tracks = [];
        let recentlyPlayed = [];
        let isPremiumRestricted = false;

        try {
            profile = await fetchSpotifyApi('me', accessToken);
        } catch (e) {
            console.error('Failed to fetch profile:', e);
        }

        try {
            artists = await getTopArtists(accessToken, 15);
        } catch (e) {
            console.error('Failed to fetch top artists:', e);
        }

        try {
            tracks = await getTopTracks(accessToken, 15);
        } catch (e) {
            console.error('Failed to fetch top tracks:', e);
        }

        try {
            recentlyPlayed = await getRecentlyPlayedTracks(accessToken, 15);
        } catch (e) {
            console.error('Failed to fetch recently played:', e);
        }

        // Handle case where account is brand new or empty
        let isEmptyAccount = false;
        if (artists.length === 0 && tracks.length === 0) {
            isEmptyAccount = true;
        }

        // 3. Fetch Audio Features for top tracks
        const trackIds = tracks.map(t => t.id).filter(id => id);
        const audioFeatures = await getAudioFeatures(accessToken, trackIds);

        // 4. Compute Signals
        // A. Popularity
        let totalPopularity = 0;
        tracks.forEach(t => totalPopularity += t.popularity);
        const avgPopularity = tracks.length > 0 ? Math.round(totalPopularity / tracks.length) : 50;

        // B. Genres
        const genreCounts = {};
        artists.forEach(artist => {
            if (artist.genres) {
                artist.genres.forEach(g => {
                    genreCounts[g] = (genreCounts[g] || 0) + 1;
                });
            }
        });
        const sortedGenres = Object.entries(genreCounts)
            .sort((a, b) => b[1] - a[1])
            .map(([genre]) => genre);

        // C. Audio Vibe Metrics (Valence, Energy, Danceability)
        let totalValence = 0, totalEnergy = 0, totalDanceability = 0;
        let validFeaturesCount = 0;

        audioFeatures.forEach(feat => {
            if (feat) {
                totalValence += feat.valence;
                totalEnergy += feat.energy;
                totalDanceability += feat.danceability;
                validFeaturesCount++;
            }
        });

        const vibe = validFeaturesCount > 0 ? {
            valence: totalValence / validFeaturesCount,
            energy: totalEnergy / validFeaturesCount,
            danceability: totalDanceability / validFeaturesCount,
        } : {
            valence: 0.5,
            energy: 0.5,
            danceability: 0.5,
        };

        const artistNames = artists.map(a => a.name);
        const trackNames = tracks.map(t => t.name);
        const recentlyPlayedNames = recentlyPlayed.map(item => `${item.track.name} by ${item.track.artists.map(a => a.name).join(', ')}`);
 
        const signals = {
            popularity: avgPopularity,
            genres: sortedGenres,
            vibe,
            artistNames,
            trackNames,
            recentlyPlayed: recentlyPlayedNames,
            isEmptyAccount,
        };

        // 5. Generate Roast
        const roastResult = await generateAIRoast(signals);

        // 6. Save Roast to Database
        const savedRoast = await saveRoast({
            spotify_user: profile.display_name || profile.id,
            user_avatar: profile.images?.[0]?.url || null,
            signals,
            title: roastResult.title,
            roast_text: roastResult.roast,
            level: roastResult.level,
            is_premium_restricted: false,
            is_offline: roastResult.isOffline || false,
            // Store top lists for rendering on the results page
            top_artists: artists.slice(0, 5).map(a => ({
                name: a.name,
                genres: a.genres.slice(0, 2),
                image: a.images?.[0]?.url || null
            })),
            top_tracks: tracks.slice(0, 5).map(t => ({
                name: t.name,
                artist: t.artists.map(art => art.name).join(', '),
                image: t.album?.images?.[0]?.url || null
            }))
        });

        // 7. Redirect to results page
        const baseUrl = new URL(request.url).origin;
        return NextResponse.redirect(`${baseUrl}/results?id=${savedRoast.id}`);

    } catch (error) {
        console.error('Spotify OAuth Callback Error:', error);
        return NextResponse.json({ error: 'OAuth Callback failed', details: error.message }, { status: 500 });
    }
}
