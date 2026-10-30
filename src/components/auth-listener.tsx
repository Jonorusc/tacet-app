"use client";

import { useEffect } from "react";
import { useClerk } from "@clerk/clerk-react";
import { onOpenUrl, isRegistered, register } from "@tauri-apps/plugin-deep-link";
import { useAuthStore } from "../store/auth-store";

export function AuthListener() {
    const { setActive, client } = useClerk();
    const { setAuthStatus, setErrorMessage } = useAuthStore();

    useEffect(() => {
        if (!isRegistered("tacet")) {
            console.log("Deep link not registered");
            register("tacet");
        }

        const unlisten = onOpenUrl(async (urls) => {
            console.log("Deep link received:", urls);
            for (const urlStr of urls) {
                try {
                    const url = new URL(urlStr);
                    // Check for ticket (used by tacet-web)
                    console.log("URL:", url);
                    const ticket = url.searchParams.get("ticket");

                    if (ticket && client) {
                        console.log("Ticket found, attempting sign in...");
                        setAuthStatus("loading");
                        setErrorMessage(null);

                        try {
                            const signInResource = await client.signIn.create({
                                strategy: "ticket",
                                ticket,
                            });

                            if (signInResource.status === "complete") {
                                await setActive({ session: signInResource.createdSessionId });
                                console.log("Sign in successful!");

                                // Get the session token to sync user to database
                                try {
                                    const session = client.sessions.find(
                                        (s: any) => s.id === signInResource.createdSessionId
                                    );

                                    if (session) {
                                        const token = await session.getToken();

                                        // Sync user to local database
                                        const { verifyToken } = useAuthStore.getState();
                                        await verifyToken(token);
                                        console.log("✅ User synced to local database");
                                    }
                                } catch (syncError) {
                                    console.error("Failed to sync user to database:", syncError);
                                    // Don't fail the auth flow, just log the error
                                }

                                setAuthStatus("success");
                            } else {
                                console.log("Sign in incomplete", signInResource);
                                setAuthStatus("error");
                                setErrorMessage("Sign in incomplete. Please try again.");
                            }
                        } catch (err: any) {
                            console.error("Sign in failed:", err);
                            setAuthStatus("error");
                            let msg = "Authentication failed.";
                            // Clerk error structure
                            if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
                                msg = err.errors[0].longMessage || err.errors[0].message || msg;
                            } else if (err.message) {
                                msg = err.message;
                            }
                            setErrorMessage(msg);
                        }
                    }
                } catch (e) {
                    console.error("Failed to parse URL:", e);
                    setAuthStatus("error");
                    setErrorMessage("Invalid login link.");
                }
            }
        });
        console.log("AuthListener mounted");

        return () => {
            unlisten.then(f => f());
        }
    }, [setActive, client, setAuthStatus, setErrorMessage]);

    return null
}
