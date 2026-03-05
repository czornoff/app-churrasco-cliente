'use client'
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <SessionProvider basePath={`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/auth`}>
                {children}
            </SessionProvider>
        </ThemeProvider>
    );
}