'use client' // Define que este componente roda no navegador

import { Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useTransition } from "react";
import { deleteTenantAction } from "@/app/(admin)/admin/tenants/actions";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DeleteTenantButtonProps {
    tenantId: string;
    tenantName: string;
}

export function DeleteTenantButton({ tenantId, tenantName }: DeleteTenantButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleDelete = () => {
        startTransition(async () => {
            await deleteTenantAction(tenantId);
        });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    size="icon"
                    variant="ghost"
                    disabled={isPending}
                    className="h-9 w-9 bg-transparent text-red-600 dark:text-red-600 hover:text-red-600"
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso excluirá permanentemente a loja
                        <span className="font-bold text-zinc-900"> {tenantName}</span> e removerá os dados de nossos servidores.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                        className="bg-red-600 hover:bg-red-700"
                        disabled={isPending}
                        onClick={handleDelete}
                    >
                        {isPending ? "Excluindo..." : "Sim, excluir loja"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
