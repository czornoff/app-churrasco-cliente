'use client'

import { registerUserAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

export default function RegisterPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    // Se for TENANT_OWNER, redirecionar
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.role === 'TENANT_OWNER') {
            router.push(`/admin/tenants/${session.user.tenantId}`);
        }
    }, [status, session, router]);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); // Evita o refresh da página
    const formData = new FormData(event.currentTarget);
    
    try {
        const result = await registerUserAction(formData);
            if (result?.error) {
                alert(result.error);
                return;
            }
            alert("Conta criada! Agora faça login.");
            router.push("/admin");
        } catch (error: unknown) {
            alert("Erro inesperado ao cadastrar.");
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">Criar Conta Admin</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Nome</Label>
                            <Input name="nome" placeholder="Seu nome" required />
                        </div>
                        <div className="space-y-2">
                            <Label>E-mail</Label>
                            <Input name="email" type="email" placeholder="email@exemplo.com" required />
                        </div>
                        <div className="space-y-2">
                            <Label>Senha</Label>
                            <Input name="password" type="password" required />
                        </div>
                        <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                            Cadastrar
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}