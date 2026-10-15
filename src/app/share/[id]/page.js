import React from 'react';
import { getRoastById } from '@/lib/db';
import Link from 'next/link';

export async function generateMetadata({ params }) {
    const { id } = await params;
    const roast = await getRoastById(id);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    if (!roast) {
        return {
            title: 'Spotify Roaster - Roast Card Missing',
        };
    }

    return {
        title: `Spotify Roaster - ${roast.spotify_user || 'Music Lover'} is "${roast.title}"`,
        description: roast.roast_text,
        openGraph: {
            title: `Spotify Roaster - ${roast.spotify_user || 'Music Lover'} is "${roast.title}"`,
            description: roast.roast_text,
            type: 'music.playlist',
            images: [{
                url: `${baseUrl}/api/og/${id}`,
                width: 600,
                height: 400,
                alt: roast.title
            }],
        },
        twitter: {
            card: 'summary_large_image',
            title: `Spotify Roaster - "${roast.title}"`,
            description: roast.roast_text,
            images: [`${baseUrl}/api/og/${id}`],
        }
    };
}

function RoastOMeter({ score }) {
    const strokeDasharray = 219.9;
    const percentage = score / 100;
    const strokeDashoffset = strokeDasharray * (1 - percentage);

    return (
        <div className="flex flex-col items-center justify-center p-3 relative select-none">
            <svg className="w-40 h-22" viewBox="0 0 100 50">
                <path 
                    d="M 15 45 A 35 35 0 0 1 85 45" 
                    fill="none" 
                    stroke="rgba(255,255,255,0.05)" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                />
                <path 
                    d="M 15 45 A 35 35 0 0 1 85 45" 
                    fill="none" 
                    stroke="url(#meterGradient)" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                />
                <defs>
                    <linearGradient id="meterGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#1DB954" />
                        <stop offset="50%" stopColor="#af40ff" />
                        <stop offset="100%" stopColor="#ff007f" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute bottom-2 flex flex-col items-center">
                <span className="text-2xl font-black font-heading text-white tracking-tight">{score}%</span>
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-extrabold">Mainstream Index</span>
            </div>
        </div>
    );
}

function VibeProgress({ label, value, minText, maxText }) {
    const barsCount = 10;
    const filledCount = Math.round(value * barsCount);
    const meterStr = `[${'█'.repeat(filledCount)}${'░'.repeat(barsCount - filledCount)}]`;

    return (
        <div className="flex flex-col gap-1 w-full text-xs">
            <div className="flex justify-between font-bold">
                <span className="uppercase">{label}</span>
                <span>{Math.round(value * 100)}%</span>
            </div>
            <div className="font-mono text-base tracking-widest">{meterStr}</div>
            <div className="flex justify-between text-[9px] uppercase font-bold tracking-wider opacity-85 mt-0.5">
                <span>{minText}</span>
                <span>{maxText}</span>
            </div>
        </div>
    );
}

export default async function SharePage({ params }) {
    const { id } = await params;
    const roastData = await getRoastById(id);

    if (!roastData) {
        return (
            <div className="retro-screen pixel-grid rounded-lg p-10 flex flex-col items-center justify-center text-center gap-6">
                <span className="font-pixel text-4xl">⚠️</span>
                <h2 className="font-heading text-4xl uppercase text-red-700">ROAST CARD MISSING</h2>
                <p className="text-sm font-bold max-w-sm font-sans">This roast card does not exist or has been deleted.</p>
                <Link href="/" className="retro-button px-6 py-3">
                    CREATE YOUR OWN
                </Link>
            </div>
        );
    }

    const { spotify_user, user_avatar, signals, title, roast_text, level, is_premium_restricted } = roastData;
    const { popularity, genres, vibe } = signals;

    // Deterministic Taste Score
    const tasteScore = Math.max(12, Math.min(99, Math.round(100 - (popularity * 0.85) - (vibe ? vibe.energy * 8 : 0))));
    const filledScore = Math.round(tasteScore / 10);
    const scoreMeter = `[${'█'.repeat(filledScore)}${'░'.repeat(10 - filledScore)}]`;

    // Deterministic Archetype & Rarity
    let archetype = "CERTIFIED NPC";
    let rarity = "12.5%";
    let rarityClass = "COMMON";

    const hasGenre = (g) => genres?.some(genre => genre.toLowerCase().includes(g)) || false;

    if (hasGenre('k-pop')) {
        archetype = "STAN TWITTER ARMY";
        rarity = "1.5%";
        rarityClass = "MYTHIC OBSESSION";
    } else if (hasGenre('metal') || hasGenre('punk')) {
        archetype = "BOOMER ROCK DEFENDER";
        rarity = "3.8%";
        rarityClass = "VINTAGE CRINGE";
    } else if (hasGenre('techno') || hasGenre('house') || hasGenre('trance') || hasGenre('edm')) {
        archetype = "PERPETUAL RAVER";
        rarity = "2.9%";
        rarityClass = "NEON VIBE";
    } else if (hasGenre('classical') || hasGenre('orchestral') || hasGenre('soundtrack')) {
        archetype = "ORCHESTRAL VILLAIN";
        rarity = "1.2%";
        rarityClass = "LEGENDARY PLOTTER";
    } else if (hasGenre('jazz') || hasGenre('blues')) {
        archetype = "JAZZ APOLOGIST";
        rarity = "2.3%";
        rarityClass = "OFF-BEAT ELITIST";
    } else if (hasGenre('lofi') || hasGenre('chill')) {
        archetype = "STUDY VIBE PROCRUSTINATOR";
        rarity = "4.7%";
        rarityClass = "STUDY NPC";
    } else if (hasGenre('country') || hasGenre('bluegrass')) {
        archetype = "BOOT SCOOTIN' AUX DRIFTER";
        rarity = "3.1%";
        rarityClass = "COUNTRY COUSIN";
    } else if (hasGenre('rap') || hasGenre('hip hop') || hasGenre('trap')) {
        archetype = "AUX CORD DICTATOR";
        rarity = "5.2%";
        rarityClass = "BASS CHASER";
    } else if (popularity < 45) {
        archetype = "INDIE POSER";
        rarity = "4.2%";
        rarityClass = "LEGENDARY SHAME";
    } else if (vibe && vibe.energy > 0.75 && vibe.valence < 0.35) {
        archetype = "MUSICALLY FERAL";
        rarity = "1.8%";
        rarityClass = "MYTHIC DANGER";
    } else if (vibe && vibe.valence < 0.35 && vibe.energy < 0.35) {
        archetype = "EMOTIONAL SUPPORT DJ";
        rarity = "3.5%";
        rarityClass = "UNCOMMON VIBE";
    } else if (genres && genres.length > 1 && genres[0]?.includes('pop') && (genres[1]?.includes('metal') || genres[1]?.includes('rock'))) {
        archetype = "GENRE WHIPLASH";
        rarity = "2.1%";
        rarityClass = "RARE WHIPLASH";
    } else if (popularity > 82) {
        archetype = "ALGORITHM'S FAVORITE CHILD";
        rarity = "8.4%";
        rarityClass = "UNCOMMON POPULAR";
    } else {
        archetype = "UNCATEGORIZABLE";
        rarity = "5.6%";
        rarityClass = "SKEPTICAL NOISE";
    }

    // Computed bars for popularity
    const filledPopularity = Math.round(popularity / 10);
    const popularityMeter = `[${'█'.repeat(filledPopularity)}${'░'.repeat(10 - filledPopularity)}]`;

    return (
        <div className="flex flex-col gap-6 relative select-none">
            <main className="retro-screen pixel-grid rounded-lg p-6 sm:p-8 flex flex-col gap-6">
                
                {/* Nokia Screen Status Bar (Rich details on mobile, matches desktop sidebar icons) */}
                <div className="flex justify-between items-center text-[8px] sm:text-[10px] font-pixel border-b-3 border-retro-dark pb-2 mb-2 select-none">
                    <div className="flex items-center gap-1.5">
                        <span className="lg:hidden font-bold">📶▄▆█░</span>
                        <span className="hidden lg:inline">📶</span>
                        <span>GSM-900</span>
                    </div>
                    <span className="font-bold tracking-widest">SHARED ROAST</span>
                    <div className="flex items-center gap-1.5">
                        <span>91% LIFE</span>
                        <span className="lg:hidden font-bold">🔋[█████]</span>
                        <span className="hidden lg:inline">🔋</span>
                    </div>
                </div>

                {is_premium_restricted && (
                    <div className="border-3 border-retro-dark p-3 text-xs leading-normal bg-retro-dark/5 font-bold mb-2">
                        ⚠️ SPOTIFY API RESTRICTION: Free account detected. Standard charts loaded as fallback.
                    </div>
                )}

                {/* Profile Header */}
                <div className="flex items-center justify-between border-b-3 border-retro-dark pb-4">
                    <div className="flex items-center gap-4">
                        {user_avatar ? (
                            <img src={user_avatar} alt="Avatar" className="w-12 h-12 rounded-none border-3 border-retro-dark object-cover" />
                        ) : (
                            <div className="w-12 h-12 border-3 border-retro-dark flex items-center justify-center font-heading text-3xl font-black retro-inverse">
                                {spotify_user ? spotify_user[0].toUpperCase() : 'U'}
                            </div>
                        )}
                        <div className="flex flex-col text-left">
                            <span className="font-heading text-3xl font-normal leading-none uppercase">{spotify_user || 'Music Lover'}</span>
                            <span className="text-[10px] uppercase font-pixel tracking-wide mt-1">
                                TASTE STATUS: TRAGIC
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-2 items-center">
                        <span className="bg-retro-dark text-retro-green font-pixel text-[9px] uppercase px-2 py-0.5 tracking-wider font-bold">
                            💀 LEVEL: {level}
                        </span>
                    </div>
                </div>

                {/* Visual Peaks sequence (Identity -> Score -> Judgment) */}
                <div className="flex flex-col gap-6">
                    
                    {/* Visual Peak 1: IDENTITY CARD (Archetype & Rarity Class) */}
                    <section className="border-3 border-retro-dark p-6 text-left bg-retro-green/10 flex flex-col gap-1.5">
                        <span className="bg-retro-dark text-retro-green font-pixel text-[8px] uppercase px-1.5 py-0.5 self-start tracking-wider font-bold">
                            TASTE ARCHETYPE
                        </span>
                        <h2 className="font-heading text-4xl sm:text-5xl uppercase leading-none font-black mt-1">
                            {archetype}
                        </h2>
                        <div className="flex gap-4 font-mono text-[9px] text-retro-dark/85 mt-2 uppercase font-black">
                            <span>RARITY CLASS: {rarityClass}</span>
                            <span>({rarity} OF USERS)</span>
                        </div>
                    </section>

                    {/* Visual Peak 2: TASTE SCORE (Hero Metric Score, Big layout visual) */}
                    <section className="border-3 border-retro-dark p-6 text-center bg-retro-green/15 flex flex-col items-center gap-2">
                        <span className="bg-retro-dark text-retro-green font-pixel text-[8px] uppercase px-1.5 py-0.5 tracking-wider font-bold">
                            TASTE SCORE
                        </span>
                        <div className="flex flex-col items-center mt-2.5">
                            <span className="font-heading text-7xl sm:text-8xl leading-none font-black tracking-tighter">
                                {tasteScore}
                            </span>
                            <span className="font-heading text-lg font-black text-retro-dark/50 leading-none">
                                / 100
                            </span>
                        </div>
                        <span className="font-mono text-sm tracking-widest mt-2">{scoreMeter}</span>
                    </section>

                    {/* Visual Peak 3: THE JUDGMENT (Terminal Window UI, overpower visual card 20% larger) */}
                    <section className="border-3 border-retro-dark flex flex-col bg-retro-dark text-retro-green font-mono select-none overflow-hidden mt-2">
                        <div className="bg-retro-dark text-retro-green px-4 py-2 flex justify-between items-center border-b-3 border-retro-dark font-pixel text-[8px] sm:text-[9px]">
                            <span>┌ THE JUDGMENT ──────────────────────┐</span>
                            <span>NOKIA V1.0</span>
                        </div>
                        
                        <div className="p-6 flex flex-col gap-4 text-left leading-relaxed text-xs sm:text-sm font-bold min-h-[220px]">
                            <div className="text-[9px] opacity-75">
                                &gt; ANALYSIS COMPLETE.<br />
                                &gt; CROSS-REFERENCING MUSIC DATA...<br />
                                &gt; LOADING HUMILIATION ENGINE...<br />
                                &gt; RESULT:
                            </div>
                            
                            <p className="text-retro-green text-sm sm:text-base tracking-wide border-t border-retro-green/20 pt-3 whitespace-pre-line leading-relaxed font-bold">
                                "{roast_text}"
                            </p>
                        </div>
                        <div className="bg-retro-dark py-1 text-[8px] font-pixel border-t-3 border-retro-dark text-center opacity-60">
                            └────────────────────────────────────┘
                        </div>
                    </section>
                </div>

                {/* CTA - Loudest Amber Button */}
                <div className="flex flex-col items-center gap-4 mt-4 border-t-3 border-retro-dark pt-4">
                    <Link 
                        href="/"
                        className="retro-button-primary px-8 py-3.5 w-full sm:w-auto text-center"
                    >
                        🔥 GET YOUR MUSIC ROASTED
                    </Link>
                </div>
            </main>
        </div>
    );
}

