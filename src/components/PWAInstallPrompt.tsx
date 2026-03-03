'use client';

import React, { useEffect, useState } from 'react';
import { Share, Download, X, PlusSquare } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}

export const PWAInstallPrompt = () => {
    const [showPrompt, setShowPrompt] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [platform, setPlatform] = useState<'ios' | 'android' | 'desktop' | null>(null);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

    useEffect(() => {
        // Platform detection
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIos = /iphone|ipad|ipod/.test(userAgent);
        const isAndroid = /android/.test(userAgent);
        const platformType = isIos ? 'ios' : isAndroid ? 'android' : 'desktop';
        setPlatform(platformType);

        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone
            || document.referrer.includes('android-app://');

        // Check if user has dismissed previously
        const isDismissed = localStorage.getItem('pwa-prompt-dismissed');

        console.log('[PWA] Debug Status:', {
            platform: platformType,
            isStandalone,
            isDismissed,
            userAgent: userAgent.slice(0, 50) + '...'
        });

        if (isStandalone || isDismissed) return;

        // Capture beforeinstallprompt for Android/Desktop
        const handler = (e: any) => {
            console.log('[PWA] beforeinstallprompt event captured!');
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Show prompt after a delay
            setTimeout(() => {
                setShowPrompt(true);
                setTimeout(() => setIsVisible(true), 100);
            }, 3000);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // For iOS, we show it after a delay
        if (isIos) {
            console.log('[PWA] iOS detected, setting timeout for prompt');
            setTimeout(() => {
                setShowPrompt(true);
                setTimeout(() => setIsVisible(true), 100);
            }, 5000);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setIsVisible(false);
            setTimeout(() => setShowPrompt(false), 300);
        }
    };

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(() => setShowPrompt(false), 300);
        localStorage.setItem('pwa-prompt-dismissed', 'true');
    };

    if (!showPrompt) return null;

    return (
        <div
            className={`fixed bottom-4 left-4 right-4 z-[9999] md:left-auto md:right-8 md:bottom-8 md:max-w-md transition-all duration-300 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
        >
            <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-2xl dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                {/* Decorative background gradient */}
                <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-red-500/10 blur-3xl" />
                <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-orange-500/10 blur-3xl" />

                <button
                    onClick={handleDismiss}
                    className="absolute right-4 top-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                >
                    <X size={20} />
                </button>

                <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-orange-500 text-white shadow-lg">
                        <Download size={24} />
                    </div>

                    <div className="flex-1 pr-6">
                        <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                            Instalar App
                        </h3>
                        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                            {platform === 'ios'
                                ? 'Adicione à tela de início para uma experiência completa.'
                                : 'Tenha acesso rápido ao app direto da sua tela inicial.'}
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex flex-col gap-3">
                    {platform === 'ios' ? (
                        <div className="rounded-xl bg-zinc-50 p-4 dark:bg-zinc-800/50">
                            <ol className="space-y-3 text-sm text-zinc-600 dark:text-zinc-300">
                                <li className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold dark:bg-zinc-700">1</span>
                                    <span className="flex items-center gap-1.5">
                                        Toque no ícone de compartilhar <Share size={16} className="text-blue-500" />
                                    </span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-200 text-xs font-bold dark:bg-zinc-700">2</span>
                                    <span className="flex items-center gap-1.5">
                                        Selecione <PlusSquare size={16} /> <b>Adicionar à Tela de Início</b>
                                    </span>
                                </li>
                            </ol>
                        </div>
                    ) : (
                        <button
                            onClick={handleInstallClick}
                            disabled={!deferredPrompt}
                            className="w-full rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                        >
                            Instalar Agora
                        </button>
                    )}

                    <button
                        onClick={handleDismiss}
                        className="text-xs text-zinc-400 hover:text-zinc-500 underline-offset-4 hover:underline"
                    >
                        Talvez mais tarde
                    </button>
                </div>
            </div>
        </div>
    );
};
