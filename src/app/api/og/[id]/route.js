import { ImageResponse } from 'next/og';
import { getRoastById } from '@/lib/db';

export async function GET(request, { params }) {
    try {
        const { id } = await params;
        const roast = await getRoastById(id);

        if (!roast) {
            return new Response('Roast card not found', { status: 404 });
        }

        const { spotify_user, title, roast_text, level, signals } = roast;
        const { popularity, genres, vibe } = signals;
        const topGenre = genres?.[0] || 'N/A';

        // Deterministic Archetype calculation matching pages
        let archetype = "CERTIFIED NPC";
        let rarityClass = "COMMON";
        const hasGenre = (g) => genres?.some(genre => genre.toLowerCase().includes(g)) || false;

        if (hasGenre('k-pop')) {
            archetype = "STAN TWITTER ARMY";
            rarityClass = "MYTHIC OBSESSION";
        } else if (hasGenre('metal') || hasGenre('punk')) {
            archetype = "BOOMER ROCK DEFENDER";
            rarityClass = "VINTAGE CRINGE";
        } else if (hasGenre('techno') || hasGenre('house') || hasGenre('trance') || hasGenre('edm')) {
            archetype = "PERPETUAL RAVER";
            rarityClass = "NEON VIBE";
        } else if (hasGenre('classical') || hasGenre('orchestral') || hasGenre('soundtrack')) {
            archetype = "ORCHESTRAL VILLAIN";
            rarityClass = "LEGENDARY PLOTTER";
        } else if (hasGenre('jazz') || hasGenre('blues')) {
            archetype = "JAZZ APOLOGIST";
            rarityClass = "OFF-BEAT ELITIST";
        } else if (hasGenre('lofi') || hasGenre('chill')) {
            archetype = "STUDY VIBE PROCRUSTINATOR";
            rarityClass = "STUDY NPC";
        } else if (hasGenre('country') || hasGenre('bluegrass')) {
            archetype = "BOOT SCOOTIN' AUX DRIFTER";
            rarityClass = "COUNTRY COUSIN";
        } else if (hasGenre('rap') || hasGenre('hip hop') || hasGenre('trap')) {
            archetype = "AUX CORD DICTATOR";
            rarityClass = "BASS CHASER";
        } else if (popularity < 45) {
            archetype = "INDIE POSER";
            rarityClass = "LEGENDARY SHAME";
        } else if (vibe && vibe.energy > 0.75 && vibe.valence < 0.35) {
            archetype = "MUSICALLY FERAL";
            rarityClass = "MYTHIC DANGER";
        } else if (vibe && vibe.valence < 0.35 && vibe.energy < 0.35) {
            archetype = "EMOTIONAL SUPPORT DJ";
            rarityClass = "UNCOMMON VIBE";
        } else if (genres && genres.length > 1 && genres[0]?.includes('pop') && (genres[1]?.includes('metal') || genres[1]?.includes('rock'))) {
            archetype = "GENRE WHIPLASH";
            rarityClass = "RARE WHIPLASH";
        } else if (popularity > 82) {
            archetype = "ALGORITHM'S FAVORITE CHILD";
            rarityClass = "UNCOMMON POPULAR";
        } else {
            archetype = "UNCATEGORIZABLE";
            rarityClass = "SKEPTICAL NOISE";
        }

        // Truncate roast text to fit the image dimensions cleanly
        const maxChar = 180;
        const truncatedRoast = roast_text.length > maxChar 
            ? roast_text.slice(0, maxChar) + '...' 
            : roast_text;

        return new ImageResponse(
            (
                <div
                    style={{
                        height: '100%',
                        width: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#82bc23',
                        padding: '30px',
                        fontFamily: 'monospace',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            width: '100%',
                            height: '100%',
                            border: '8px solid #050a01',
                            padding: '24px',
                            backgroundColor: '#82bc23',
                            justifyContent: 'space-between',
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                width: '100%',
                                justifyContent: 'space-between',
                                borderBottom: '3px solid #050a01',
                                paddingBottom: '6px',
                                fontSize: '12px',
                                fontWeight: 'bold',
                                color: '#050a01',
                            }}
                        >
                            <span>⚡ NOKIA_ROAST</span>
                            <span>[🔋]</span>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                flexGrow: 1,
                                justifyContent: 'center',
                                gap: '10px',
                                padding: '10px 0',
                            }}
                        >
                            <div
                                style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                }}
                            >
                                <h2
                                    style={{
                                        fontSize: '28px',
                                        fontWeight: '900',
                                        color: '#050a01',
                                        margin: 0,
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    {archetype}
                                </h2>
                                <span
                                    style={{
                                        fontSize: '11px',
                                        fontWeight: 'bold',
                                        color: '#82bc23',
                                        backgroundColor: '#050a01',
                                        padding: '2px 8px',
                                        textTransform: 'uppercase',
                                    }}
                                >
                                    {rarityClass}
                                </span>
                            </div>
                            <div
                                style={{
                                    display: 'flex',
                                    fontSize: '14px',
                                    lineHeight: '1.5',
                                    color: '#050a01',
                                    fontWeight: 'bold',
                                    border: '3px solid #050a01',
                                    padding: '12px',
                                }}
                            >
                                "{truncatedRoast}"
                            </div>
                        </div>

                        <div
                            style={{
                                display: 'flex',
                                width: '100%',
                                gap: '15px',
                                borderTop: '3px dashed #050a01',
                                paddingTop: '10px',
                            }}
                        >
                            <div
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: '3px solid #050a01',
                                    padding: '8px',
                                }}
                            >
                                <span style={{ display: 'flex', fontSize: '9px', color: '#050a01', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                    MAINSTREAM INDEX
                                </span>
                                <span style={{ display: 'flex', fontSize: '18px', color: '#050a01', fontWeight: 'extrabold', marginTop: '2px' }}>
                                    {popularity}% Popular
                                </span>
                            </div>
                            
                            <div
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    border: '3px solid #050a01',
                                    padding: '8px',
                                }}
                            >
                                <span style={{ display: 'flex', fontSize: '9px', color: '#050a01', textTransform: 'uppercase', fontWeight: 'bold' }}>
                                    PRIMARY GENRE
                                </span>
                                <span style={{ display: 'flex', fontSize: '16px', color: '#050a01', fontWeight: 'bold', marginTop: '2px', textTransform: 'uppercase' }}>
                                    {topGenre}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            ),
            {
                width: 600,
                height: 400,
            }
        );
    } catch (error) {
        console.error('Error generating OG image:', error);
        return new Response('Failed to generate sharing image', { status: 500 });
    }
}
