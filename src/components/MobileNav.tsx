'use client'

import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarContent } from "./SidebarContent";
import { cn } from "@/lib/utils";

export function MobileNav() {
    const [isOpen, setIsOpen] = useState(false);

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    return (
        <div className="mobile-only">
            <Button
                variant="ghost"
                size="icon"
                className="text-neutral-600 dark:text-zinc-400 hover:bg-neutral-100 dark:hover:bg-zinc-800/50 active:scale-95"
                onClick={() => setIsOpen(true)}
            >
                <Menu size={26} />
                <span className="sr-only">Menu</span>
            </Button>

            {/* Backdrop / Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm z-[100] animate-in fade-in duration-300 md:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Slide-out Sheet */}
            {isOpen && (
                <div className={cn(
                    "fixed top-0 left-0 bottom-0 w-[300px] bg-white dark:bg-zinc-900 z-[101] transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) shadow-2xl flex flex-col border-r border-neutral-200 dark:border-zinc-800 md:hidden",
                    "translate-x-0"
                )}>
                    <div className="h-16 flex items-center justify-between px-6 border-b border-neutral-100 dark:border-zinc-800/50">
                        <span className="text-xs font-black text-neutral-400 dark:text-zinc-600 uppercase tracking-[0.2em]">Navegação</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-neutral-400 dark:text-zinc-600 hover:text-red-500"
                            onClick={() => setIsOpen(false)}
                        >
                            <X size={20} />
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto">
                        <SidebarContent onItemClick={() => setIsOpen(false)} />
                    </div>
                </div>
            )}
        </div>
    );
}
