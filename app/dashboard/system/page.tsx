"use client";

import { SystemToggle } from "@/src/components/system-toggle";
import { VolumeX, EyeOff, WifiOff, Disc, Monitor, BellOff } from "lucide-react";

export default function SystemPage() {
    return (
        <div className="h-full flex flex-col gap-8 max-w-4xl mx-auto">
            <div className="flex items-end justify-between border-b border-grid-line pb-6">
                <div>
                    <h1 className="font-display text-2xl text-starlight mb-1">System Constraints</h1>
                    <p className="font-mono text-xs text-starlight/50">Hardware-level permission overrides.</p>
                </div>
                <div className="px-2 py-1 bg-signal-block/10 border border-signal-block/20 rounded text-[10px] font-mono text-signal-block">
                    ROOT ACCESS: GRANTED
                </div>
            </div>

            {/* Audio Mesh */}
            <section className="space-y-4">
                <h2 className="font-mono text-xs text-starlight/30 uppercase tracking-widest pl-1">Audio Mesh // Layer 1</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SystemToggle
                        label="Spotify Exception"
                        description="Mute all system audio but allows Spotify.exe throughput."
                        icon={Disc}
                    />
                    <SystemToggle
                        label="System UI Mute"
                        description="Suppresses error beeps, screenshot sounds, and trash emptying."
                        icon={VolumeX}
                    />
                </div>
            </section>

            {/* Visual Fog */}
            <section className="space-y-4">
                <h2 className="font-mono text-xs text-starlight/30 uppercase tracking-widest pl-1">Visual Fog // Layer 2</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SystemToggle
                        label="Dock Suppression"
                        description="Prevents icon bouncing and badges on the macOS Dock."
                        icon={BellOff}
                    />
                    <SystemToggle
                        label="Grayscale Mode"
                        description="Removes all color from the display to reduce dopamine loops."
                        icon={EyeOff}
                    />
                    <SystemToggle
                        label="Cinema Focus"
                        description="Dims all inactive windows to 30% opacity."
                        icon={Monitor}
                    />
                </div>
            </section>

            {/* Network Gap (Danger Zone) */}
            <section className="space-y-4">
                <h2 className="font-mono text-xs text-rose-500/50 uppercase tracking-widest pl-1 flex items-center gap-2">
                    Network Gap // Layer 3 <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-[8px] border border-rose-500/20">DANGER ZONE</span>
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <SystemToggle
                        label="Sinkhole Socials"
                        description="Redirects Twitter, Reddit, LinkedIn to 127.0.0.1 (Localhost)."
                        icon={WifiOff}
                        danger={true}
                    />
                </div>
            </section>
        </div>
    );
}
