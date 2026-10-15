const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/api/auth/callback';

export function getAuthUrl() {
    const scope = 'user-top-read user-read-private user-read-recently-played';
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: CLIENT_ID,
        scope: scope,
        redirect_uri: REDIRECT_URI,
    });
    return `https://accounts.spotify.com/authorize?${params.toString()}`;
}

export async function exchangeCodeForTokens(code) {
    const authHeader = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`);
    const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${authHeader}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Spotify token exchange failed: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function fetchSpotifyApi(endpoint, token) {
    const response = await fetch(`https://api.spotify.com/v1/${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Spotify API error on ${endpoint}: ${response.status} ${errorText}`);
    }

    return response.json();
}

export async function getTopArtists(token, limit = 15) {
    const data = await fetchSpotifyApi(`me/top/artists?limit=${limit}&time_range=medium_term`, token);
    return data.items || [];
}

export async function getTopTracks(token, limit = 15) {
    const data = await fetchSpotifyApi(`me/top/tracks?limit=${limit}&time_range=medium_term`, token);
    return data.items || [];
}

export async function getAudioFeatures(token, trackIds) {
    if (!trackIds || trackIds.length === 0) return [];
    try {
        const ids = trackIds.slice(0, 100).join(',');
        const data = await fetchSpotifyApi(`audio-features?ids=${ids}`, token);
        return data.audio_features || [];
    } catch (e) {
        console.error('Failed to fetch audio features, Spotify app might not have permission:', e);
        return [];
    }
}

export async function getRecentlyPlayedTracks(token, limit = 15) {
    const data = await fetchSpotifyApi(`me/player/recently-played?limit=${limit}`, token);
    return data.items || [];
}
