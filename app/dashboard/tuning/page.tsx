'use client'
import { TuningTerminal } from "@/src/components/tuning-terminal";

export default function TuningPage() {
    return (
        <div className="h-full flex flex-col gap-6">
            <div className="flex items-end justify-between">
                <div>
                    <h1 className="font-display text-2xl text-starlight mb-1">AI Tuning</h1>
                    <p className="font-mono text-xs text-starlight/50">Teach Tacet what matters. All processing runs locally.</p>
                </div>
                <div className="flex gap-2 text-[10px] font-mono text-starlight/40 uppercase">
                    <span>Model: Llama-3-8B-Q4</span>
                    <span>|</span>
                    <span>RAM Usage: 1.2GB</span>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <TuningTerminal />
            </div>
        </div>
    );
}
