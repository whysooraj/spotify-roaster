// Self-contained Web Audio API synthesizer for retro Nokia monophonic beeps
export function playBeep(type) {
    if (typeof window === 'undefined') return;
    if (window.localStorage && window.localStorage.getItem('sound_muted') === 'true') {
        return;
    }
    try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextClass) return;
        const ctx = new AudioContextClass();
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.type = 'square'; // Authentic retro chiptune sound
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        if (type === 'click') {
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            gain.gain.setValueAtTime(0.05, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
            osc.start();
            osc.stop(ctx.currentTime + 0.04);
        } else if (type === 'beep') {
            osc.frequency.setValueAtTime(440, ctx.currentTime);
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
            osc.start();
            osc.stop(ctx.currentTime + 0.08);
        } else if (type === 'success') {
            // Nokia chime (double beep)
            osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
            gain.gain.setValueAtTime(0.08, ctx.currentTime);
            gain.gain.setValueAtTime(0.08, ctx.currentTime + 0.08);
            osc.frequency.setValueAtTime(880, ctx.currentTime + 0.08); // A5
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.22);
            osc.start();
            osc.stop(ctx.currentTime + 0.22);
        } else if (type === 'error') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            gain.gain.setValueAtTime(0.12, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
            osc.start();
            osc.stop(ctx.currentTime + 0.25);
        }
    } catch (e) {
        console.warn('Web Audio failed:', e);
    }
}
