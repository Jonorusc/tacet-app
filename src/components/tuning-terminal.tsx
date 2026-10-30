"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Send, Terminal } from "lucide-react";

type Message = {
    id: string;
    sender: "user" | "tacet";
    text: string;
};

const INITIAL_MESSAGES: Message[] = [
    { id: "1", sender: "tacet", text: "Tacet Local Intelligence [v2.4.1] online." },
    { id: "2", sender: "tacet", text: "I am listening to system notification channels. How should I filter new signals?" },
];

export function TuningTerminal() {
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMsg: Message = { id: Date.now().toString(), sender: "user", text: input };
        setMessages((prev) => [...prev, userMsg]);
        setInput("");
        setIsTyping(true);

        // Simulate AI processing delay
        setTimeout(() => {
            const responses = [
                `Understood. I have updated the filter weights for "${userMsg.text}".`,
                "Rule added to local database. Confidence score: 98%.",
                "Acknowledged. I will allow this pattern through the shield.",
                "Configuration updated. Exceptions applied to current session.",
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];

            setMessages((prev) => [
                ...prev,
                { id: (Date.now() + 1).toString(), sender: "tacet", text: randomResponse },
            ]);
            setIsTyping(false);
        }, 1500);
    };

    return (
        <div className="flex flex-col h-full border border-grid-line bg-void/50 backdrop-blur-md rounded-lg overflow-hidden relative">
            {/* Header */}
            <div className="h-10 border-b border-grid-line bg-void/80 flex items-center px-4 gap-2">
                <Terminal className="w-4 h-4 text-starlight/50" />
                <span className="font-mono text-xs text-starlight/50 uppercase">tacet_tuning_cli</span>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm" ref={scrollRef}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] p-3 rounded border ${msg.sender === "user"
                            ? "bg-starlight/5 border-starlight/20 text-starlight"
                            : "bg-void border-grid-line text-signal-allow/80"
                            }`}>
                            <div className="text-[10px] opacity-50 mb-1 uppercase tracking-wider">
                                {msg.sender === "user" ? "USER_COMMAND" : "TACET_CORE"}
                            </div>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-void border border-grid-line p-3 rounded">
                            <span className="animate-pulse text-signal-allow">_ PROCESSING...</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-grid-line bg-void/80">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSend()}
                        placeholder="Type a rule (e.g., 'Block all slack messages unless from @CTO')"
                        className="flex-1 bg-transparent border-none outline-none font-mono text-sm text-starlight placeholder:text-starlight/20"
                    />
                    <button onClick={handleSend} className="text-starlight/50 hover:text-starlight transition-colors">
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
