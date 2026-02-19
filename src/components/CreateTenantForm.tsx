'use client'

import { useActionState, useEffect } from "react"
import { createTenantAction } from "@/app/(admin)/admin/tenants/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner" // Recomendado para feedback

export function CreateTenantForm() {
    // O hook gerencia o estado da action (erro/sucesso)
    const [state, formAction, isPending] = useActionState(createTenantAction, null);

    // Feedback visual opcional com Toast
    useEffect(() => {
        if (state?.message) {
            if (state.success) {
                toast.success(state.message);
            } else {
                toast.error(state.message);
            }
        }
    }, [state]);

    return (
        <Card className="border-2">
            <CardHeader>
                <CardTitle>Cadastrar novo Estabelecimento</CardTitle>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="grid gap-6 md:grid-cols-2 items-end">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nome do Estabelecimento</Label>
                        <Input id="name" name="name" placeholder="Ex: Churrascaria Pantanal" required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="slug">Slug da URL (ex: churrascaria-pantanal)</Label>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-zinc-400 font-mono">/</span>
                            <Input id="slug" name="slug" placeholder="slug-unico" minLength={5} required />
                        </div>
                    </div>



                    <Button
                        type="submit"
                        disabled={isPending}
                        className="md:col-span-2 w-full bg-orange-600 hover:bg-orange-700 text-white"
                    >
                        {isPending ? "Criando..." : "Criar Portal de Churrasco"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}