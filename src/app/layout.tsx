import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner"
import { Providers } from "@/components/Providers";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "MandeBem - Apps Inteligentes",
    description: "A solução inteligente para organizar seu churrasco sem desperdícios.",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Calculadora de Churrasco",
    },
    formatDetection: {
        telephone: false,
    },
    icons: {
        icon: '/icon-192.png',
        apple: '/icon-192.png',
    }
};

export const viewport = {
    themeColor: "#e53935",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body suppressHydrationWarning
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <Providers>
                    {children}
                    <Toaster position="bottom-right" richColors />
                </Providers>
            </body>
        </html>
    );
}
