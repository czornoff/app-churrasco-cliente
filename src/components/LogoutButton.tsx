'use client'

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function LogoutButton() {
    return (
        <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: `/admin` })}
            className="text-red-500 hover:text-red-600"
        >
            <LogOut className="w-4 h-4" />
        </Button>
    );
}