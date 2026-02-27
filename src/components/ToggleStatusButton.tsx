'use client'

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { toggleUserStatusAction } from "@/lib/actions/user";
import { Ban, CheckCircle } from "lucide-react";
import { useState } from "react";

export function ToggleStatusButton({ userId, currentStatus }: { userId: string, currentStatus: string }) {
    const [loading, setLoading] = useState(false);
    const isActive = currentStatus === 'active';

    async function handleToggle() {
        if (!confirm(`Deseja ${isActive ? 'bloquear' : 'ativar'} este usuário?`)) return;

        setLoading(true);
        const res = await toggleUserStatusAction(userId, currentStatus);
        setLoading(false);

        if (res.success) {
            toast.success(`Usuário ${isActive ? 'bloqueado' : 'ativado'} com sucesso!`);
        } else {
            toast.error(res.error || "Erro ao alterar status");
        }
    }

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            disabled={loading}
            title={isActive ? "Bloquear Usuário" : "Ativar Usuário"}
            className={isActive ? "text-red-500 hover:text-red-600 hover:bg-red-50" : "text-green-500 hover:text-green-600 hover:bg-green-50"}
        >
            {isActive ? <Ban size={16} /> : <CheckCircle size={16} />}
        </Button>
    );
}
