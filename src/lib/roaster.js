import { saveRoast } from './db';

// Offline fallback roast generator
export function generateOfflineRoast(signals) {
    const { popularity, genres, vibe, artistNames, trackNames, recentlyPlayed } = signals;

    if (signals.isEmptyAccount) {
        return {
            title: "Ghost Account",
            roast: "You haven't listened to enough music for us to roast you. Go listen to something other than the voices in your head.",
            level: "NO DATA FOUND",
            isOffline: true
        };
    }

    let popularityRoast = "";
    let roastLevel = "MILDLY COOKED";
    if (popularity > 75) {
        popularityRoast = "Your taste is basic. Like, exceptionally basic. Your playlist is the human equivalent of a department store layout.";
        roastLevel = "FULLY BAKED (BASIC)";
    } else if (popularity < 40) {
        popularityRoast = "Hipster alert. You actively skip tracks if they get more than 10,000 plays. You listen to music that sounds like a broken radiator to feel superior.";
        roastLevel = "PRETENTIOUS HIPSTER";
    } else {
        popularityRoast = "Your music taste has no identity. You are stuck in the middle, too scared to be basic but too lazy to find actual underground music.";
        roastLevel = "MEDIOCRE & BORING";
    }

    let genreRoast = "Your top genres are a disjointed mess.";
    if (genres && genres.length > 0) {
        const topGenre = genres[0];
        const genreJokes = {
            pop: 'Basic. You listen to whatever the algorithms spoon-feed you on TikTok. You probably describe your music taste as "anything except country."',
            rap: 'You try too hard to pass the aux, but deep down, everybody in the car wishes you would just let the playlist finish in silence.',
            'hip hop': 'Your personality is 80% bass booster and 20% pretending you understand complex street politics.',
            indie: 'You think you are incredibly unique and underground, but your entire playlist is just standard background music for an overpriced coffee shop.',
            rock: 'You live in the wrong decade. Let it go. The guitar solo ended in 1989.',
            metal: 'You translate your emotional instability into blast beats. We get it, you are angry.',
            edm: 'Your ears must be permanently damaged by build-ups that lead to absolutely nothing. You probably think flashing lights count as a personality trait.',
            techno: 'You enjoy listening to a washing machine on spin cycle for 9 minutes straight.',
            classical: 'You either study 16 hours a day or you are currently plotting a supervillain monologue in your bedroom.',
            jazz: 'You love to nod your head out of sync to make people think you understand complex time signatures.',
            'k-pop': 'Stan Twitter is your primary address. You spend more time voting on music show apps than actually listening to songs.',
            country: 'Your playlist is just a collection of songs about trucks, beer, and a girl leaving. Very original.',
        };

        const key = Object.keys(genreJokes).find(k => topGenre.toLowerCase().includes(k));
        if (key) {
            genreRoast = `Your obsession with "${topGenre}" says a lot: ${genreJokes[key]}`;
        } else {
            genreRoast = `Your top genre is "${topGenre}". It's a vibe, but mostly a warning sign to others.`;
        }
    }

    let vibeRoast = "";
    if (vibe) {
        if (vibe.valence < 0.35) {
            vibeRoast = "With an average valence (happiness score) of " + Math.round(vibe.valence * 100) + "%, who hurt you? Please look into therapy, or at least open a window.";
        } else if (vibe.valence > 0.70) {
            vibeRoast = "Your average valence is " + Math.round(vibe.valence * 100) + "%. You are annoyingly happy. It's exhausting.";
        } else if (vibe.energy > 0.75) {
            vibeRoast = "Your playlist energy is through the roof. It feels like a panic attack set to a beat.";
        } else if (vibe.energy < 0.40) {
            vibeRoast = "Your playlist energy is close to zero. Are you alive, or just sleeping with your eyes open?";
        }
    }

    let artistRoast = "";
    if (artistNames && artistNames.length > 0) {
        artistRoast = `You spend way too much time listening to ${artistNames[0]} and ${artistNames[1] || 'other questionable choices'}. Please expand your horizons.`;
    }

    let recentRoast = "";
    if (recentlyPlayed && recentlyPlayed.length > 0) {
        const recentTrack = recentlyPlayed[0].split(' by ')[0] || 'random loop';
        recentRoast = `Lately, you've been looping "${recentTrack}", meaning your current mood is just as questionable as your general taste.`;
    }

    const finalRoast = `${popularityRoast} ${genreRoast} ${vibeRoast} ${artistRoast} ${recentRoast} Do yourself and your friends a favor: let someone else control the music.`;

    const titles = [
        "The AUX Offender",
        "TikTok Algorithmic NPC",
        "Pretentious Coffee Shop Dweller",
        "The Emotionally Fragile Listener",
        "Stuck in the High School Era",
        "The Chaotic Mashup of Regrets"
    ];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];

    return {
        title: randomTitle,
        roast: finalRoast,
        level: roastLevel,
        isOffline: true
    };
}

export async function generateAIRoast(signals) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        // Return fallback if key not configured
        return generateOfflineRoast(signals);
    }

    const { popularity, genres, vibe, artistNames, trackNames, recentlyPlayed } = signals;

    const topArtistsStr = artistNames.slice(0, 6).join(', ');
    const topTracksStr = trackNames.slice(0, 6).join(', ');
    const topGenresStr = genres.slice(0, 3).join(', ');
    const recentlyPlayedStr = recentlyPlayed && recentlyPlayed.length > 0 ? recentlyPlayed.slice(0, 5).join(', ') : 'None';

    const isEmpty = signals.isEmptyAccount;
    const prompt = `You are a brutal, witty, sarcastic AI stand-up comedian. 
Analyze the user's Spotify music taste and write a savage but funny roast of their personality and life choices.
Keep it strictly under 120 words. Format it as a single paragraph. Make it sound modern, using internet humor and slang, but very sharp.
${isEmpty ? `IMPORTANT: The user has literally no music history. Roast them for having an empty account, being a ghost, or not knowing how to use Spotify.` : `Contrast their general top habits with what they've been listening to recently to comment on their current mental state/mood.`}

Top Artists: ${topArtistsStr}
Top Tracks: ${topTracksStr}
Top Genres: ${topGenresStr}
Recently Played: ${recentlyPlayedStr}
Average Track Popularity (0-100, where 100 is billboard mainstream): ${popularity}
Audio Vibe Details:
- Happiness (valence) from 0 to 1: ${vibe ? vibe.valence.toFixed(2) : 'unknown'}
- Energy from 0 to 1: ${vibe ? vibe.energy.toFixed(2) : 'unknown'}
- Danceability from 0 to 1: ${vibe ? vibe.danceability.toFixed(2) : 'unknown'}

Provide your response in JSON format with these exact keys:
"title": a short witty title/label describing their taste (e.g. "TikTok Algorithmic NPC")
"roast": the brutal roast text (paragraph)
"level": a custom roast level label (e.g. "PRETENTIOUS HIPSTER", "EXTREMELY BASIC")

Response MUST be valid JSON. Begin JSON directly with { and end with }. Do not include markdown code block formatting in your response.`;

    try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    responseMimeType: "application/json"
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Gemini API Error Details:", errorText);
            throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        const jsonText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (jsonText) {
            const result = JSON.parse(jsonText.trim());
            return {
                title: result.title,
                roast: result.roast,
                level: result.level,
                isOffline: false
            };
        } else {
            throw new Error('Empty response from Gemini');
        }
    } catch (err) {
        console.error('AI Roasting failed, using offline fallback:', err);
        return generateOfflineRoast(signals);
    }
}
