'use client'

import { useAdminLayout } from "./AdminLayoutProvider"
import { SidebarContent } from "./SidebarContent"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"
import { Button } from "./ui/button"

export function AdminSidebarResponsive() {
    const { isSidebarOpen, setSidebarOpen } = useAdminLayout();

    return (
        <>
            {/* Sidebar Overlay (Aside) */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-[60] w-64 transform transition-transform duration-300 ease-in-out bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 md:translate-x-0 md:static md:inset-0 md:z-auto md:w-52 md:block",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <div className="relative h-full flex flex-col">
                    {/* Close button - Mobile only */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 md:hidden z-[70] text-zinc-500"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X size={24} />
                    </Button>

                    <SidebarContent onItemClick={() => setSidebarOpen(false)} />
                </div>
            </aside>

            {/* Backdrop - Mobile only */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-sm md:hidden animate-in fade-in duration-300"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </>
    );
}
