"use client";

import { motion, AnimatePresence } from "framer-motion";
import { UserProfileModule } from "./UserProfileModule";
import { X } from "lucide-react";

interface UserProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function UserProfileModal({ isOpen, onClose }: UserProfileModalProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[60] bg-void/80 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none"
                    >
                        <div className="bg-void border border-white/10 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto w-full max-w-md mx-4 relative">
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 text-white/20 hover:text-white hover:bg-white/5 rounded-full transition-colors z-10"
                            >
                                <X className="w-4 h-4" />
                            </button>

                            <UserProfileModule />
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
