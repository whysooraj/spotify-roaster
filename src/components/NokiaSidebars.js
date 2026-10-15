"use client";

import React, { useState, useEffect } from 'react';

export function LeftSidebar() {
    const [status, setStatus] = useState('idle'); // idle, connecting, roasting, completed

    useEffect(() => {
        const handleStatus = (e) => {
            setStatus(e.detail);
        };
        window.addEventListener('roast-status', handleStatus);
        return () => window.removeEventListener('roast-status', handleStatus);
    }, []);

    let title = "LINK";
    let meter = ["[█████]", "[█████]", "[█████]", "[█████]", "[░░░░░]"];
    let sub = "STANDBY";

    if (status === 'connecting') {
        title = "LINK";
        meter = ["[█████]", "[█████]", "[░░░░░]", "[░░░░░]", "[░░░░░]"];
        sub = "CONNECTING";
    } else if (status === 'roasting') {
        title = "LINK";
        meter = ["[█████]", "[█████]", "[█████]", "[█████]", "[█████]"];
        sub = "TRANSFERRING";
    } else if (status === 'completed') {
        title = "LINK";
        meter = ["[█████]", "[█████]", "[█████]", "[█████]", "[█████]"];
        sub = "ANALYZED";
    }

    return (
        <aside className="hidden lg:flex flex-col gap-5 w-40 border-4 border-retro-dark p-6 bg-retro-green font-pixel text-center select-none mt-16 shrink-0 items-center">
            <span className="bg-retro-dark text-retro-green text-[11px] uppercase px-3 py-1 tracking-wider font-bold">{title}</span>
            <span className="text-[28px] leading-none">📶</span>
            <div className="flex flex-col gap-1.5 mt-2 text-sm">
                {meter.map((bar, idx) => <div key={idx}>{bar}</div>)}
            </div>
            <span className="bg-retro-dark text-retro-green text-[8px] tracking-wide mt-3 uppercase px-2 py-1">{sub}</span>
        </aside>
    );
}

export function RightSidebar() {
    const [status, setStatus] = useState('idle');

    useEffect(() => {
        const handleStatus = (e) => {
            setStatus(e.detail);
        };
        window.addEventListener('roast-status', handleStatus);
        return () => window.removeEventListener('roast-status', handleStatus);
    }, []);

    let title = "DEVICE";
    let meter = ["[█████]", "[█████]", "[█████]", "[█████]", "[█████]"];
    let sub = "READY";

    if (status === 'connecting') {
        title = "DEVICE";
        meter = ["[█████]", "[█████]", "[█████]", "[░░░░░]", "[░░░░░]"];
        sub = "COMPUTING";
    } else if (status === 'roasting') {
        title = "DEVICE";
        meter = ["[█████]", "[█████]", "[░░░░░]", "[░░░░░]", "[░░░░░]"];
        sub = "ROASTING";
    } else if (status === 'completed') {
        title = "DEVICE";
        meter = ["[█████]", "[█████]", "[█████]", "[█████]", "[█████]"];
        sub = "ACTIVE";
    }

    return (
        <aside className="hidden lg:flex flex-col gap-5 w-40 border-4 border-retro-dark p-6 bg-retro-green font-pixel text-center select-none mt-16 shrink-0 items-center">
            <span className="bg-retro-dark text-retro-green text-[11px] uppercase px-3 py-1 tracking-wider font-bold">{title}</span>
            <span className="text-[28px] leading-none">🔋</span>
            <div className="flex flex-col gap-1.5 mt-2 text-sm">
                {meter.map((bar, idx) => <div key={idx}>{bar}</div>)}
            </div>
            <span className="bg-retro-dark text-retro-green text-[8px] tracking-wide mt-3 uppercase px-2 py-1">{sub}</span>
        </aside>
    );
}
