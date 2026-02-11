'use client' // Define que este componente roda no navegador

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DeleteTenantButtonProps {
    tenantName: string;
}

export function DeleteTenantButton({ tenantName }: DeleteTenantButtonProps) {
    return (
        <Button 
            variant="destructive" 
            size="icon" 
            type="submit"
            className="h-9 w-9"
            onClick={(e) => {
                // Agora o 'confirm' funciona porque estamos no Client Side
                if (!confirm(`Deseja realmente excluir "${tenantName}"?`)) {
                e.preventDefault()
                }
            }}
        >
            <Trash2 className="h-4 w-4" />
        </Button>
    )
}