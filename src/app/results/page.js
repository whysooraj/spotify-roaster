'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { playBeep } from '@/lib/sound';

function TypewriterText({ text }) {
    const [displayedText, setDisplayedText] = useState('');
    
    useEffect(() => {
        if (!text) return;
        let index = 0;
        const interval = setInterval(() => {
            setDisplayedText((prev) => prev + text.charAt(index));
            index += 1;
            if (index >= text.length) {
                clearInterval(interval);
            }
        }, 15);
        
        return () => clearInterval(interval);
    }, [text]);

    return <span>{displayedText}</span>;
}

function RoastOMeter({ score }) {
    // Score is popularity. Basic = high popularity, Hipster = low popularity.
    const strokeDasharray = 219.9; // Circumference of radius 35 half circle (2 * PI * 35 / 2)
    const percentage = score / 100;
    const strokeDashoffset = strokeDasharray * (1 - percentage);

    return (
        <div className="flex flex-col items-center justify-center p-3 relative select-none">
            <svg className="w-40 h-22" viewBox="0 0 100 50">
                {/* Background arc */}
                <path 
                    d="M 15 45 A 35 35 0 0 1 85 45" 
                    fill="none" 
                    stroke="rgba(255,255,255,0.05)" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                />
                {/* Active gradient arc */}
                <path 
                    d="M 15 45 A 35 35 0 0 1 85 45" 
                    fill="none" 
                    stroke="url(#meterGradient)" 
                    strokeWidth="8" 
                    strokeLinecap="round" 
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
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

function VibeBar({ label, value, colorClass, minText, maxText }) {
    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400">{label}</span>
                <span className="font-heading font-extrabold text-xs text-white">{Math.round(value * 100)}%</span>
            </div>
            <div className="w-full h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/5 relative p-0.5">
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
                    style={{ width: `${value * 100}%` }}
                />
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 font-semibold italic mt-0.5">
                <span>{minText}</span>
                <span>{maxText}</span>
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

function ResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const roastId = searchParams.get('id');

    const [loading, setLoading] = useState(true);
    const [roastData, setRoastData] = useState(null);
    const [apiKey, setApiKey] = useState('');
    const [regenerating, setRegenerating] = useState(false);
    const [error, setError] = useState('');
    const [loadingStage, setLoadingStage] = useState(0);
    const [showEvidence, setShowEvidence] = useState(false);
    const [showNerdMode, setShowNerdMode] = useState(false);
    const [revealStep, setRevealStep] = useState(0);

    const formatPunchlines = (text) => {
        if (!text) return "";
        return text
            .split(/(?<=[.!?])\s+/)
            .map(s => s.trim().toUpperCase())
            .filter(s => s.length > 0)
            .join('\n\n');
    };

    useEffect(() => {
        if (!roastId) {
            router.push('/');
            return;
        }

        async function fetchRoast() {
            try {
                const res = await fetch(`/api/share/${roastId}`);
                if (!res.ok) {
                    throw new Error('Roast not found or server error');
                }
                const data = await res.json();
                setRoastData(data);
                
                // Dispatch initial state linking
                window.dispatchEvent(new CustomEvent('roast-status', { detail: 'connecting' }));

                // Progressive reveal stages
                let stage = 0;
                const interval = setInterval(() => {
                    stage += 1;
                    setLoadingStage(stage);
                    if (stage < 4) {
                        playBeep('beep');
                        if (stage === 1) {
                            window.dispatchEvent(new CustomEvent('roast-status', { detail: 'connecting' }));
                        } else if (stage === 2 || stage === 3) {
                            window.dispatchEvent(new CustomEvent('roast-status', { detail: 'transferring' }));
                        }
                    } else {
                        clearInterval(interval);
                        playBeep('success');
                        window.dispatchEvent(new CustomEvent('roast-status', { detail: 'completed' }));
                        setLoading(false);
                    }
                }, 800);
            } catch (err) {
                console.error(err);
                setError(err.message);
                playBeep('error');
                setLoading(false);
            }
        }

        fetchRoast();
    }, [roastId, router]);

    // Staged reveal sequence (Point 15, 20)
    useEffect(() => {
        if (!loading && roastData) {
            let step = 0;
            const revealInterval = setInterval(() => {
                step += 1;
                setRevealStep(step);
                if (step === 3) {
                    playBeep('success');
                } else if (step <= 4) {
                    playBeep('click');
                } else {
                    clearInterval(revealInterval);
                }
            }, 600);
            return () => clearInterval(revealInterval);
        }
    }, [loading, roastData]);

    // Tactile Keyboard Hotkeys (Point 16)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (loading || !roastData || revealStep < 4) return;
            if (document.activeElement && document.activeElement.tagName === 'INPUT') {
                return;
            }
            if (e.key === '1') {
                e.preventDefault();
                playBeep('click');
                handleDownloadImage();
            } else if (e.key === '2') {
                e.preventDefault();
                playBeep('click');
                handleShare();
            } else if (e.key === '3') {
                e.preventDefault();
                playBeep('click');
                setShowEvidence(prev => !prev);
            } else if (e.key === '4') {
                e.preventDefault();
                playBeep('click');
                setShowNerdMode(prev => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [loading, roastData, revealStep]);

    const handleAIRoast = async () => {
        if (!apiKey.trim()) {
            alert('Please enter a Gemini API Key.');
            return;
        }

        try {
            setRegenerating(true);
            const res = await fetch('/api/roast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: roastId,
                    gemini_key: apiKey.trim()
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || 'Failed to regenerate roast');
            }

            const updatedData = await res.json();
            setRoastData(updatedData);
            alert('Roast updated with custom AI brutality!');
        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setRegenerating(false);
        }
    };

    const handleShare = () => {
        if (!roastData) return;
        
        const shareUrl = `${window.location.origin}/share/${roastId}`;
        const text = `🔥 SpotifyRoaster judged my music taste and called me "${roastData.title}"!\n\n"${roastData.roast_text}"\n\nSee how cooked your taste is at: ${shareUrl}`;

        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                alert('Roast link copied to clipboard! Share on social media.');
            }).catch(err => {
                console.error('Failed to copy: ', err);
                alert(`Copy this link to share: ${shareUrl}`);
            });
        } else {
            alert(`Copy this link to share: ${shareUrl}`);
        }
    };

    const handleDownloadImage = () => {
        if (!roastData) return;
        const link = document.createElement('a');
        link.href = `/api/og/${roastId}`;
        link.download = `spotify-roast-${roastId}.png`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        const stagesText = [
            "CONNECTING TO CENTRAL AUX ENGINE...",
            "ACQUIRING TASTE PROFILE...",
            "CALCULATING MAINSTREAM LEVEL AND METERING GENRES...",
            "GENERATING MUSIC CRIMINAL DOSSIER..."
        ];
        const progressBars = [
            "[██░░░░░░░░] 20%",
            "[█████░░░░░] 50%",
            "[████████░░] 80%",
            "[██████████] 100%"
        ];

        let statusBarText = "CONNECTING...";
        let batteryLevelText = "98% LIFE";
        if (loadingStage === 1) {
            statusBarText = "ANALYZING...";
            batteryLevelText = "95% LIFE";
        } else if (loadingStage === 2) {
            statusBarText = "PROCESSING...";
            batteryLevelText = "93% LIFE";
        } else if (loadingStage >= 3) {
            statusBarText = "DOSSIER BUILD...";
            batteryLevelText = "91% LIFE";
        }

        return (
            <div className="flex flex-col gap-4 relative select-none">
                <main className="retro-screen pixel-grid rounded-lg p-6 sm:p-8 flex flex-col gap-4">
                    {/* Nokia Screen Status Bar */}
                    <div className="flex justify-between items-center text-[8px] sm:text-[10px] font-pixel border-b-3 border-retro-dark pb-2 select-none">
                        <div className="flex items-center gap-1.5">
                            <span className="lg:hidden font-bold">📶▄▆█░</span>
                            <span className="hidden lg:inline">📶</span>
                            <span>GSM-900</span>
                        </div>
                        <span className="font-bold tracking-widest">{statusBarText}</span>
                        <div className="flex items-center gap-1.5">
                            <span>{batteryLevelText}</span>
                            <span className="lg:hidden font-bold">🔋[█████]</span>
                            <span className="hidden lg:inline">🔋</span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-6 text-center select-none py-16">
                        <div className="font-pixel text-[8px] animate-pulse">⚡ NOKIA 3310 SCANNER</div>
                        <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
                            <span className="font-mono text-xs uppercase block font-bold text-retro-dark">
                                {stagesText[loadingStage] || "COMPILING..."}
                            </span>
                            <span className="font-mono text-base tracking-widest block text-retro-dark font-black">
                                {progressBars[loadingStage] || "[░░░░░░░░░░] 0%"}
                            </span>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="retro-screen pixel-grid rounded-lg p-10 flex flex-col items-center justify-center text-center gap-6">
                <span className="font-pixel text-4xl">⚠️</span>
                <h2 className="font-heading text-4xl uppercase text-red-700">EXECUTION FAILED</h2>
                <p className="text-sm font-bold max-w-sm">{error}</p>
                <button 
                    onClick={() => router.push('/')} 
                    className="retro-button px-6 py-2 text-xs"
                >
                    GO BACK HOME
                </button>
            </div>
        );
    }

    const { spotify_user, user_avatar, signals, title, roast_text, level, is_offline, top_artists, top_tracks, is_premium_restricted } = roastData;
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
        <div className="flex flex-col gap-4 relative select-none">
            <main className="retro-screen pixel-grid rounded-lg p-6 sm:p-8 flex flex-col gap-4">
                
                {/* Nokia Screen Status Bar */}
                <div className="flex justify-between items-center text-[8px] sm:text-[10px] font-pixel border-b-3 border-retro-dark pb-2 select-none">
                    <div className="flex items-center gap-1.5">
                        <span className="lg:hidden font-bold">📶▄▆█░</span>
                        <span className="hidden lg:inline">📶</span>
                        <span>GSM-900</span>
                    </div>
                    <span className="font-bold tracking-widest">ROAST COMPLETE</span>
                    <div className="flex items-center gap-1.5">
                        <span>91% LIFE</span>
                        <span className="lg:hidden font-bold">🔋[█████]</span>
                        <span className="hidden lg:inline">🔋</span>
                    </div>
                </div>

                <div className="flex justify-between items-center text-[7px] font-pixel border border-dashed border-retro-dark/30 px-2 py-1 bg-retro-dark/5 select-none animate-pulse">
                    <span>⚠️ ATTENTION: ANALYSIS CONSUMED 9% BATTERY LIFE</span>
                    <span>MUTED: {typeof window !== 'undefined' && localStorage.getItem('sound_muted') === 'true' ? 'YES' : 'NO'}</span>
                </div>

                {/* Profile Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b-3 border-retro-dark pb-4 mt-1">
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
                    <button 
                        onClick={() => { playBeep('click'); router.push('/'); }}
                        onMouseEnter={() => playBeep('click')}
                        className="retro-button px-4 py-2 text-[8px]"
                    >
                        DISCONNECT
                    </button>
                </div>

                {/* Visual Peaks sequence (Identity -> Score -> Judgment -> Share) */}
                <div className="flex flex-col gap-2">
                    
                    {/* Visual Peak 1: IDENTITY CARD (Archetype & Rarity Class) */}
                    {revealStep >= 1 && (
                        <section className="border-3 border-retro-dark py-4 px-5 text-left bg-retro-green/10 flex flex-col gap-1 animate-fade-in">
                            <span className="bg-retro-dark text-retro-green font-pixel text-[8px] uppercase px-1.5 py-0.5 self-start tracking-wider font-bold">
                                TASTE ARCHETYPE
                            </span>
                            <h2 className="font-heading text-5xl sm:text-6xl uppercase leading-none font-black mt-0.5">
                                {archetype}
                            </h2>
                            <div className="flex gap-2 font-mono text-[10px] text-retro-dark/85 mt-0.5 uppercase font-black">
                                <span>{rarity} OF USERS</span>
                                <span>·</span>
                                <span>{rarityClass}</span>
                            </div>
                        </section>
                    )}

                    {/* Visual Peak 2: TASTE SCORE (Hero Metric, reduced vertically by 35%) */}
                    {revealStep >= 2 && (
                        <section className="border-3 border-retro-dark py-2 px-5 text-center bg-retro-green/15 flex flex-col items-center animate-fade-in">
                            <span className="bg-retro-dark text-retro-green font-pixel text-[8px] uppercase px-1.5 py-0.5 tracking-wider font-bold">
                                TASTE SCORE
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="font-heading text-6xl sm:text-7xl leading-none font-black tracking-tighter">
                                    {tasteScore}
                                </span>
                                <span className="font-heading text-base font-black text-retro-dark/50 leading-none">
                                    / 100
                                </span>
                            </div>
                            <span className="font-mono text-xs tracking-widest">{scoreMeter}</span>
                        </section>
                    )}

                    {/* Visual Peak 3: THE JUDGMENT (Terminal Window UI) */}
                    {revealStep >= 3 && (
                        <section className="border-3 border-retro-dark flex flex-col bg-retro-dark text-retro-green font-mono select-none overflow-hidden mt-2 animate-fade-in">
                            <div className="bg-retro-dark text-retro-green px-3 py-1 flex justify-between items-center border-b-3 border-retro-dark font-pixel text-[7px] sm:text-[8px]">
                                <span>┌ JUDGMENT ─────────────────┐</span>
                                <span>NOKIA</span>
                            </div>
                            
                            <div className="p-4 flex flex-col gap-3 text-left">
                                <div className="text-[9px] opacity-75 font-bold">
                                    &gt; LOADING HUMILIATION ENGINE...<br />
                                    &gt; RESULT:
                                </div>
                                
                                <p className="text-retro-green text-lg sm:text-xl tracking-wide border-t border-retro-green/20 pt-4 whitespace-pre-line leading-[1.4] font-black max-w-[85%] sm:max-w-[75%]">
                                    <TypewriterText text={formatPunchlines(roast_text)} />
                                </p>
                            </div>
                            <div className="bg-retro-dark py-1 text-[7px] font-pixel border-t-3 border-retro-dark text-center opacity-60">
                                └─────────────────────────┘
                            </div>
                        </section>
                    )}

                    {/* Visual Peak 4: SHARE YOUR FAILURE */}
                    {revealStep >= 4 && (
                        <section className="border-3 border-retro-dark p-6 flex flex-col items-center gap-4 text-center bg-retro-green/10 mt-2 animate-fade-in">
                            <div className="flex flex-col items-center gap-1 mb-1">
                                <span className="font-heading text-2xl uppercase tracking-wider">SEND THIS FAILURE TO SOMEONE.</span>
                                <span className="text-xs font-bold uppercase text-retro-dark/70">LET THEM JUDGE YOUR TASTE.</span>
                            </div>
                            <div className="flex flex-col items-center gap-3 w-full justify-center">
                                <button 
                                    onClick={() => { playBeep('click'); handleDownloadImage(); }}
                                    onMouseEnter={() => playBeep('click')}
                                    className="bg-retro-dark text-retro-green border-3 border-retro-dark hover:bg-retro-green hover:text-retro-dark px-8 py-5 w-full text-center font-heading text-2xl sm:text-3xl uppercase transition-colors"
                                >
                                    [1] DOWNLOAD ROAST CARD
                                </button>
                                <button 
                                    onClick={() => { playBeep('click'); handleShare(); }}
                                    onMouseEnter={() => playBeep('click')}
                                    className="text-retro-dark hover:underline font-bold text-xs uppercase tracking-wider"
                                >
                                    [2] COPY ROAST LINK →
                                </button>
                            </div>
                        </section>
                    )}
                </div>

                {/* Collapsible Evidence Section */}
                {revealStep >= 4 && (
                    <div className="flex flex-col gap-2 w-full mt-4 animate-fade-in">
                        <button
                            onClick={() => { playBeep('click'); setShowEvidence(!showEvidence); }}
                            onMouseEnter={() => playBeep('click')}
                            className="retro-button w-full text-center py-3.5 font-pixel text-[9px]"
                        >
                            {showEvidence ? '[-] HIDE EVIDENCE DATA' : '[3] SHOW THE EVIDENCE'}
                        </button>

                        {showEvidence && (
                            <div className="border-3 border-retro-dark p-5 bg-retro-green/5 flex flex-col gap-6 animate-fade-in text-left">
                                <span className="bg-retro-dark text-retro-green font-pixel text-[8px] uppercase px-1.5 py-0.5 self-start tracking-wider font-bold">
                                    🗂️ MUSIC ANALYTICS DATA
                                </span>

                                {/* Mainstream & Primary Genre */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="border-3 border-retro-dark p-4 flex flex-col justify-between bg-retro-green/10">
                                        <span className="text-[9px] font-pixel uppercase font-bold text-retro-dark/80">MAINSTREAM LEVEL</span>
                                        <span className="font-mono text-base tracking-widest mt-1.5">{popularityMeter}</span>
                                        <span className="text-xs font-bold mt-1 uppercase">
                                            {popularity}% POPULAR
                                        </span>
                                    </div>

                                    <div className="border-3 border-retro-dark p-4 flex flex-col justify-between bg-retro-green/10">
                                        <span className="text-[9px] font-pixel uppercase font-bold text-retro-dark/80">PRIMARY GENRE</span>
                                        <span className="font-heading text-2xl uppercase tracking-wider truncate mt-1">
                                            {genres?.[0] || 'N/A'}
                                        </span>
                                        <span className="text-[9px] font-pixel uppercase opacity-75 mt-1">Comfort Zone</span>
                                    </div>
                                </div>

                                {/* Vibe Progress Indicators */}
                                {vibe && (
                                    <div className="border-3 border-retro-dark p-4 flex flex-col gap-5 bg-retro-green/10">
                                        <VibeProgress 
                                            label="Mood" 
                                            value={vibe.valence} 
                                            minText="MELANCHOLY" 
                                            maxText="EUPHORIC" 
                                        />
                                        <VibeProgress 
                                            label="Energy" 
                                            value={vibe.energy} 
                                            minText="NPC" 
                                            maxText="UNHINGED" 
                                        />
                                    </div>
                                )}

                                {/* Music Lists: Taste Enablers & Guilty Pleasures */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-dashed border-retro-dark/30 pt-6">
                                    {top_artists && top_artists.length > 0 && (
                                        <div className="flex flex-col gap-3">
                                            <h3 className="font-heading text-2xl uppercase border-b-2 border-retro-dark pb-1">
                                                WHAT MADE YOU THIS WAY
                                            </h3>
                                            <ul className="flex flex-col gap-1">
                                                {top_artists.map((artist, idx) => (
                                                    <li key={idx} className="flex items-center gap-3 text-xs font-bold py-2 border-b border-dashed border-retro-dark/25">
                                                        <span className="font-mono text-[9px] bg-retro-dark text-retro-green px-1.5 py-0.5 min-w-[24px] text-center font-bold">
                                                            {String(idx + 1).padStart(2, '0')}
                                                        </span>
                                                        <span className="uppercase truncate">{artist.name}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {top_tracks && top_tracks.length > 0 && (
                                        <div className="flex flex-col gap-3">
                                            <h3 className="font-heading text-2xl uppercase border-b-2 border-retro-dark pb-1">
                                                YOUR MUSICAL CRIMES
                                            </h3>
                                            <ul className="flex flex-col gap-1">
                                                {top_tracks.map((track, idx) => (
                                                    <li key={idx} className="flex items-center gap-3 text-xs font-bold py-2 border-b border-dashed border-retro-dark/25">
                                                        <span className="font-mono text-[9px] bg-retro-dark text-retro-green px-1.5 py-0.5 min-w-[24px] text-center font-bold">
                                                            {String(idx + 1).padStart(2, '0')}
                                                        </span>
                                                        <span className="uppercase truncate">{track.name}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Collapsible Nerd Mode Section */}
                {revealStep >= 4 && (
                    <div className="flex flex-col gap-2 w-full mt-2 select-none animate-fade-in">
                        <button
                            onClick={() => { playBeep('click'); setShowNerdMode(!showNerdMode); }}
                            onMouseEnter={() => playBeep('click')}
                            className="retro-button text-[8px] px-3 py-1.5 self-start"
                        >
                            {showNerdMode ? '[-] HIDE NERD CONFIG' : '[4] NERD CONFIG'}
                        </button>

                        {showNerdMode && (
                            <section className="border-3 border-dashed border-retro-dark p-6 flex flex-col gap-4 text-left bg-retro-dark/5 animate-fade-in">
                                <span className="bg-retro-dark text-retro-green font-pixel text-[8px] uppercase px-2 py-0.5 self-start tracking-wider font-bold">
                                    🔧 BRUTALITY ENGINE CONFIG
                                </span>

                                <div className="flex flex-col gap-1">
                                    <span className="font-bold text-[10px] text-retro-dark/80">BRUTALITY MODE:</span>
                                    <div className="text-xs font-bold">
                                        {is_offline ? 'STANDARD BRUTALITY (LOCAL ENGINE)' : 'ENHANCED BRUTALITY (GEMINI SERVER ENGINE)'}
                                    </div>
                                </div>

                                {is_offline && (
                                    <div className="flex flex-col gap-3 border-t border-dashed border-retro-dark/20 pt-3">
                                        <p className="text-xs leading-relaxed font-bold">
                                            Activate server-side AI brutality to unlock high-fidelity, merciless Gemini generated music roasts.
                                        </p>
                                        <button 
                                            onClick={() => { playBeep('click'); handleAIRoast(); }}
                                            onMouseEnter={() => playBeep('click')}
                                            disabled={regenerating}
                                            className="retro-button px-6 py-3.5 w-full"
                                        >
                                            {regenerating ? '⚡ RE-ROASTING WITH AI...' : '⚡ ACTIVATE AI BRUTALITY'}
                                        </button>

                                        <div className="flex flex-col gap-2 border-t border-retro-dark/10 pt-3">
                                            <span className="font-bold text-[9px] uppercase">CUSTOM API CONFIG</span>
                                            <input 
                                                type="password" 
                                                placeholder="ENTER GEMINI API KEY" 
                                                value={apiKey}
                                                onChange={(e) => setApiKey(e.target.value)}
                                                className="retro-input uppercase text-xs py-2"
                                            />
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}
                    </div>
                )}

                {/* Staged Tactile Shortcuts Footer */}
                {revealStep >= 4 && (
                    <div className="border-t border-dashed border-retro-dark/20 pt-4 flex flex-wrap justify-between items-center text-[7px] font-pixel select-none opacity-80 gap-2 animate-fade-in mt-2">
                        <span>KEYBOARD SHORTCUTS:</span>
                        <div className="flex gap-3">
                            <span>[1] DOWNLOAD CARD</span>
                            <span>[2] COPY LINK</span>
                            <span>[3] EVIDENCE</span>
                            <span>[4] NERD CONFIG</span>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function ResultsPage() {
    return (
        <Suspense fallback={
            <div className="retro-screen pixel-grid rounded-lg p-10 flex flex-col items-center justify-center min-h-[400px] gap-6 text-center">
                <div className="font-pixel text-xs animate-spin">⚡</div>
                <h2 className="font-heading text-4xl uppercase">LOADING DATA...</h2>
            </div>
        }>
            <ResultsContent />
        </Suspense>
    );
}


