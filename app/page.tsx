
"use client";

import { ShieldAlert, Activity, WifiOff } from "lucide-react";
import { useUser } from "@clerk/clerk-react";
import { useAuthStore } from "../src/store/auth-store";
import { openUrl } from '@tauri-apps/plugin-opener';
import { WindowFrame } from "../src/components/shell/WindowFrame";
import { UserProfileModule } from "../src/components/user/UserProfileModule";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";


export default function Home() {
  const { user, isLoaded } = useUser();
  const { authStatus, errorMessage } = useAuthStore();
  const [isOnline, setIsOnline] = useState(true);
  const router = useRouter();

  // Connectivity Check
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial check
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    }
  }, []);

  // Auth Redirect
  useEffect(() => {
    if (isLoaded && user) {
      router.push('/dashboard');
    }
  }, [isLoaded, user, router]);

  const handleLogin = async () => {
    const url = process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://tacet.pro';
    try {
      await openUrl(url);
    } catch (e) {
      console.error("Failed to open login url", e);
    }
  };

  if (!isLoaded) return <LoadingView />;

  // 1. Offline View
  if (!isOnline) {
    return (
      <WindowFrame>
        <div className="flex flex-col items-center justify-center h-full gap-6 text-center p-8">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center animate-pulse">
            <WifiOff className="w-8 h-8 text-red-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-display font-medium text-starlight">Connection Lost</h1>
            <p className="text-white/40 max-w-md mx-auto">
              The Tacet Protocol requires an active neural link (internet connection). Retrying sequence...
            </p>
          </div>
        </div>
      </WindowFrame>
    )
  }

  // 2. Authenticated View (Redirecting...)
  if (user) {
    return (
      <div className="h-screen w-screen bg-void flex items-center justify-center">
        <Activity className="w-6 h-6 text-starlight animate-spin" />
        <span className="ml-3 text-starlight/50 font-mono text-xs">INITIALIZING DASHBOARD...</span>
      </div>
    );
  }

  // 3. Guest/Auth View (Signal Lost)
  return (
    <WindowFrame>
      <div className="flex flex-col items-center justify-center h-full p-8">

        {/* Auth Error Toast */}
        {authStatus === 'error' && (
          <div className="absolute top-16 z-50 p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-3 backdrop-blur-md animate-in slide-in-from-top-2">
            <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
            <div className="space-y-0.5">
              <p className="text-sm font-medium text-red-200">Authentication Error</p>
              <p className="text-xs text-red-200/60">{errorMessage}</p>
            </div>
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center gap-8 text-center max-w-md">
          <div className="space-y-4">
            <h1 className="text-3xl font-display font-bold tracking-tighter text-rose-500/90">
              Signal Lost
            </h1>
            <p className="text-white/60 leading-relaxed font-body">
              Authentication signature required. Please initiate the handshake sequence from the web portal.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-500/10 border border-slate-500/20 flex items-start gap-3 text-left w-full justify-between items-center group hover:bg-slate-500/20 transition-colors">
            <div className="flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-slate-200">Protocol Lockdown</p>
                <p className="text-xs text-slate-200/60">
                  Local access restricted.
                </p>
              </div>
            </div>
            <button
              onClick={handleLogin}
              className="px-4 py-2 bg-slate-500/10 text-slate-200 border border-white/20 text-xs font-bold rounded-md hover:bg-slate-500/30 transition-colors"
            >
              Connect
            </button>
          </div>
        </div>
      </div>
    </WindowFrame>
  );
}

function LoadingView() {
  return (
    <div className="h-screen w-screen bg-void flex items-center justify-center">
      <Activity className="w-6 h-6 text-starlight animate-spin" />
    </div>
  )
}
