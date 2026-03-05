'use client'

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut({ callbackUrl: `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/admin` })}
            className="text-zinc-500 hover:text-red-600"
        >
            <LogOut className="w-4 h-4 mr-2" />
            Sair
        </Button>
    );
}