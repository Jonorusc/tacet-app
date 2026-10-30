// Utility deleted


interface StatCardProps {
    label: string;
    value: string | number;
    valueColor?: string;
    className?: string;
}

export function StatCard({ label, value, valueColor = "text-starlight", className }: StatCardProps) {
    return (
        <div className={`p-4 border border-grid-line bg-void/40 backdrop-blur rounded flex flex-col gap-1 ${className || ""}`}>
            <span className="font-mono text-[10px] text-starlight/40 uppercase">{label}</span>
            <span className={`font-display text-2xl ${valueColor}`}>{value}</span>
        </div>
    );
}
