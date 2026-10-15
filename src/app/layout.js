import { VT323, Press_Start_2P, Share_Tech_Mono } from "next/font/google";
import "./globals.css";
import { LeftSidebar, RightSidebar } from "@/components/NokiaSidebars";

const vt323 = VT323({
    subsets: ["latin"],
    variable: "--font-heading",
    weight: "400",
});

const pressStart2P = Press_Start_2P({
    subsets: ["latin"],
    variable: "--font-pixel",
    weight: "400",
});

const shareTechMono = Share_Tech_Mono({
    subsets: ["latin"],
    variable: "--font-plus-jakarta",
    weight: "400",
});

export const metadata = {
    title: "Spotify Roaster - Nokia 3310 Edition",
    description: "Get a brutal, pixelated roast based on your Spotify music taste. Nokia screen style.",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${vt323.variable} ${pressStart2P.variable} ${shareTechMono.variable} h-full`}>
            <body className="bg-retro-green text-retro-dark font-sans min-h-full selection:bg-retro-dark selection:text-retro-green">
                <div className="relative min-h-screen flex flex-col items-center justify-start overflow-x-hidden p-4">
                    {/* Retro CRT Scanlines & Screen Texture */}
                    <div className="fixed inset-0 pointer-events-none scanlines z-50" />
                    
                    <div className="relative z-10 w-full max-w-[1400px] py-8 flex items-start justify-center gap-12 scale-[1.1] md:scale-[1.15] origin-top my-6">
                        {/* Left Sidebar: Retro Signal Tower Indicator */}
                        <LeftSidebar />

                        {/* Central Main Content */}
                        <div className="w-full max-w-[900px] flex flex-col gap-8 shrink">
                            {children}
                        </div>

                        {/* Right Sidebar: Retro Battery Level Indicator */}
                        <RightSidebar />
                    </div>
                </div>
            </body>
        </html>
    );
}
