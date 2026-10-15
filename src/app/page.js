'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { playBeep } from '@/lib/sound';

export default function LandingPage() {
    const router = useRouter();
    const [manualArtists, setManualArtists] = useState('');
    const [loading, setLoading] = useState(false);

    const [activeTab, setActiveTab] = useState('spotify'); // 'spotify' or 'manual'
    const [showDevConfig, setShowDevConfig] = useState(false);
    const [soundMuted, setSoundMuted] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.localStorage) {
            setSoundMuted(window.localStorage.getItem('sound_muted') === 'true');
        }
    }, []);

    const toggleSound = () => {
        const nextState = !soundMuted;
        setSoundMuted(nextState);
        if (typeof window !== 'undefined' && window.localStorage) {
            window.localStorage.setItem('sound_muted', String(nextState));
        }
    };

    // Keyboard support (Point 22)
    useEffect(() => {
        // Emit standby status on mount
        window.dispatchEvent(new CustomEvent('roast-status', { detail: 'standby' }));

        const handleKeyDown = (e) => {
            if (document.activeElement && document.activeElement.tagName === 'INPUT') {
                return; // Do not hijack when typing artists
            }
            if (e.key === '1') {
                e.preventDefault();
                playBeep('success');
                if (activeTab === 'spotify') {
                    window.dispatchEvent(new CustomEvent('roast-status', { detail: 'connecting' }));
                    window.location.href = '/api/auth/login';
                } else {
                    const submitBtn = document.getElementById('manual-submit-btn');
                    if (submitBtn) submitBtn.click();
                }
            } else if (e.key === '2') {
                e.preventDefault();
                playBeep('click');
                setActiveTab((prev) => (prev === 'spotify' ? 'manual' : 'spotify'));
            } else if (e.key === '3') {
                e.preventDefault();
                playBeep('click');
                setShowDevConfig((prev) => !prev);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [activeTab]);

    const handleManualRoast = async (e) => {
        e.preventDefault();
        if (!manualArtists.trim()) {
            alert('Please enter at least one artist!');
            return;
        }

        try {
            setLoading(true);
            const res = await fetch('/api/roast', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    is_manual: true,
                    manual_artists: manualArtists,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to generate manual roast');
            }

            const data = await res.json();
            router.push(`/results?id=${data.id}`);
        } catch (err) {
            console.error(err);
            alert('Roast engine failed. Try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 relative select-none">
            {/* Main Nokia Screen Casing */}
            <main className="retro-screen pixel-grid rounded-lg p-5 sm:p-6 flex flex-col gap-2">
                
                {/* Nokia Screen Status Bar */}
                <div className="flex justify-between items-center text-[8px] sm:text-[9px] font-pixel border-b-3 border-retro-dark pb-1.5 mb-1 select-none">
                    <div className="flex items-center gap-1">
                        <span className="lg:hidden font-bold">📶▄▆█░</span>
                        <span className="hidden lg:inline">📶</span>
                        <span>GSM-900</span>
                    </div>
                    <span className="font-bold tracking-widest">
                        {loading ? 'CONNECTING...' : 'STANDBY'}
                    </span>
                    <div className="flex items-center gap-1">
                        <span>100%</span>
                        <span className="lg:hidden font-bold">🔋[█████]</span>
                        <span className="hidden lg:inline">🔋</span>
                    </div>
                </div>

                {/* Title & Headline */}
                <header className="text-center flex flex-col gap-1.5 py-1">
                    <h1 className="font-heading font-normal text-4xl sm:text-5xl tracking-wide uppercase leading-none">
                        SPOTIFY_ROASTER
                    </h1>
                    <p className="bg-retro-dark text-retro-green font-pixel text-[8px] uppercase px-2 py-0.5 self-center tracking-wide font-bold">
                        WE JUDGE YOUR MUSIC. YOU'LL PROBABLY REGRET CONNECTING.
                    </p>
                </header>

                {/* Simulated Style Preview Box (Point 3) */}
                <section className="font-mono text-left text-xs border-3 border-retro-dark py-1 px-3 bg-retro-dark text-retro-green flex flex-col gap-0">
                    {activeTab === 'spotify' ? (
                        <>
                            <div>&gt; ROAST ENGINE: READY</div>
                            <div>&gt; SCANNING FREQUENCY: 900MHZ</div>
                            <div className="animate-pulse">&gt; VERDICT: PENDING USER CONNECTION...</div>
                        </>
                    ) : (
                        <>
                            <div>&gt; BYPASSING SPOTIFY LINK...</div>
                            <div>&gt; MANUAL AUX INPUT: ACTIVE</div>
                            <div className="animate-pulse">&gt; VERDICT: PENDING ARTIST DATA ENTRY...</div>
                        </>
                    )}
                </section>

                {/* Primary Content (Automatic Spotify Mode / Manual Aux Mode) */}
                <section className="flex flex-col items-center gap-2 text-center w-full">
                    {activeTab === 'spotify' ? (
                        <div className="flex flex-col gap-2 items-center w-full max-w-md">
                            <a 
                                href="/api/auth/login" 
                                className="retro-button-primary px-6 py-3 w-full text-center text-xs font-black tracking-wider transition-all block"
                                onMouseEnter={() => playBeep('click')}
                                onClick={() => {
                                    playBeep('success');
                                    window.dispatchEvent(new CustomEvent('roast-status', { detail: 'connecting' }));
                                }}
                            >
                                [1] CONNECT SPOTIFY
                            </a>
                            <div className="flex flex-col gap-0.5 text-center select-none">
                                <span className="font-pixel text-[8px] uppercase tracking-wide opacity-80 font-bold">
                                    AUTO ANALYSIS
                                </span>
                                <span className="font-pixel text-[8px] uppercase tracking-wide opacity-80 font-bold">
                                    USES CONNECTED SPOTIFY DATA
                                </span>
                            </div>
                        </div>
                    ) : (
                        <form 
                            onSubmit={(e) => {
                                playBeep('success');
                                window.dispatchEvent(new CustomEvent('roast-status', { detail: 'roasting' }));
                                handleManualRoast(e);
                            }} 
                            className="flex flex-col gap-2 items-center w-full max-w-md"
                        >
                            <div className="w-full flex flex-col sm:flex-row gap-2">
                                <input 
                                    type="text"
                                    placeholder="TAYLOR SWIFT, KANYE WEST, METALLICA..."
                                    value={manualArtists}
                                    onChange={(e) => setManualArtists(e.target.value)}
                                    className="retro-input flex-1 text-xs text-center uppercase placeholder-retro-dark/50 py-2.5"
                                    disabled={loading}
                                />
                                <button 
                                    id="manual-submit-btn"
                                    type="submit"
                                    className="retro-button-primary px-5 py-2.5 font-black text-xs shrink-0"
                                    disabled={loading}
                                >
                                    [1] JUDGE TASTE
                                </button>
                            </div>
                            <div className="flex flex-col gap-0.5 text-center select-none">
                                <span className="font-pixel text-[8px] uppercase tracking-wide opacity-80 font-bold">
                                    MANUAL INPUT
                                </span>
                                <span className="font-pixel text-[8px] uppercase tracking-wide opacity-80 font-bold">
                                    NO SPOTIFY CONNECTION REQUIRED
                                </span>
                            </div>
                        </form>
                    )}
                </section>

                {/* Optional Configuration switches below CTA (Point 2) */}
                <div className="flex justify-center border-t border-dashed border-retro-dark/20 pt-3 text-[8px] font-pixel select-none">
                    {activeTab === 'spotify' ? (
                        <button 
                            onClick={() => { playBeep('click'); setActiveTab('manual'); }}
                            className="text-retro-dark hover:underline font-bold"
                        >
                            [2] CHANGE MODE TO BROKE AUX (MANUAL INPUT) →
                        </button>
                    ) : (
                        <button 
                            onClick={() => { playBeep('click'); setActiveTab('spotify'); }}
                            className="text-retro-dark hover:underline font-bold"
                        >
                            [2] CHANGE MODE TO AUTOMATIC (SPOTIFY LINK) →
                        </button>
                    )}
                </div>

                <div className="retro-divider" />

                {/* Collapsible System Details */}
                <div className="flex flex-col gap-1.5">
                    <button 
                        onClick={() => {
                            playBeep('click');
                            setShowDevConfig(!showDevConfig);
                        }}
                        className="retro-button px-2.5 py-1 self-start text-[7px]"
                    >
                        {showDevConfig ? '[-] HIDE NERD MODE CONFIG' : '[3] USE ADVANCED NERD MODE'}
                    </button>

                    {showDevConfig && (
                        <section className="border-2 border-retro-dark border-dashed p-3 text-[9px] font-mono leading-relaxed bg-retro-dark/5 text-retro-dark/80 animate-fade-in flex flex-col gap-2">
                            <div>
                                <span className="font-bold block mb-0.5">🔧 LOCAL DEV CONFIG:</span>
                                <p className="font-sans font-bold">
                                    Verify redirect URI matches loopback IP in your Spotify Developer console:
                                    <br />
                                    <code className="bg-retro-dark/10 px-1 font-bold text-[8px] font-mono">http://127.0.0.1:3000/api/auth/callback</code>
                                </p>
                            </div>
                            <div className="border-t border-dashed border-retro-dark/20 pt-1.5 flex justify-between items-center select-none">
                                <span className="font-bold">🔊 CHIPTUNE INTERACTION AUDIO:</span>
                                <button 
                                    onClick={() => {
                                        toggleSound();
                                        if (soundMuted) {
                                            setTimeout(() => playBeep('success'), 50);
                                        }
                                    }}
                                    className="retro-button px-2 py-0.5 text-[8px]"
                                >
                                    {soundMuted ? 'UNMUTE SOUNDS' : 'MUTE SOUNDS'}
                                </button>
                            </div>
                        </section>
                    )}
                </div>
            </main>

            {/* Footer with keyboard shortcuts */}
            <footer className="flex flex-col gap-0.5 items-center text-slate-500 font-pixel text-[7px] uppercase tracking-widest py-1">
                <p>Nokia 3310 UI • Built with standard CSS controls</p>
                <p className="text-retro-dark/70 font-bold mt-0.5 select-none">
                    [1] START ACTION   [2] TOGGLE MODE   [3] NERD CONFIG
                </p>
            </footer>
        </div>
    );
}
