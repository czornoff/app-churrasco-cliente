'use client'

import { useAdminLayout } from "./AdminLayoutProvider";
import { Button } from "./ui/button";
import { Menu } from "lucide-react";

export function MobileNav() {
    const { setSidebarOpen } = useAdminLayout();

    return (
        <div className="md:hidden">
            <Button
                variant="ghost"
                size="icon"
                className="text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 active:scale-95"
                onClick={() => setSidebarOpen(true)}
            >
                <Menu size={26} />
                <span className="sr-only">Menu</span>
            </Button>
        </div>
    );
}
