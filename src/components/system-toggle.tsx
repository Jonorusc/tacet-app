"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { LucideIcon } from "lucide-react";

type SystemToggleProps = {
    label: string;
    description: string;
    icon: LucideIcon;
    danger?: boolean;
};

export function SystemToggle({ label, description, icon: Icon, danger }: SystemToggleProps) {
    const [active, setActive] = useState(false);

    return (
        <div className="flex items-center justify-between p-4 border border-grid-line bg-void/50 backdrop-blur rounded-lg group hover:border-starlight/10 transition-colors">
            <div className="flex items-start gap-4">
                <div className={`p-2 rounded border ${active
                    ? "bg-starlight text-void border-starlight"
                    : danger
                        ? "bg-signal-block/5 text-signal-block/50 border-signal-block/20"
                        : "bg-starlight/5 text-starlight/40 border-starlight/10"
                    } transition-colors duration-300 ml-4`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div>
                    <h3 className={`font-mono text-sm uppercase tracking-wide transition-colors ${active ? "text-starlight" : "text-starlight/60"}`}>
                        {label}
                    </h3>
                    <p className="text-xs text-starlight/40 max-w-[200px] mt-1">
                        {description}
                    </p>
                </div>
            </div>

            {/* Industrial Switch */}
            <button
                onClick={() => setActive(!active)}
                className="relative w-14 h-8"
            >
                <div className={`absolute inset-0 rounded-full border transition-all duration-300 ${active
                    ? (danger ? "border-signal-block bg-signal-block/10" : "border-signal-allow bg-signal-allow/10")
                    : "border-grid-line bg-void"
                    }`} />

                <motion.div
                    animate={{ x: active ? 24 : 4 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className={`absolute top-1 bottom-1 w-6 rounded-full flex items-center justify-center transition-colors duration-300 ${active
                        ? (danger ? "bg-signal-block shadow-[0_0_10px_var(--signal-block)]" : "bg-signal-allow shadow-[0_0_10px_var(--signal-allow)]")
                        : "bg-starlight/20"
                        }`}
                >
                    <div className={`w-0.5 h-3 rounded-full ${active ? "bg-void/50" : "bg-void/20"}`} />
                </motion.div>
            </button>
        </div>
    );
}
