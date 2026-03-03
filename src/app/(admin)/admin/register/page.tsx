'use client'

import { registerUserAction } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { toast } from 'sonner';
import { Users, Save } from "lucide-react";

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
            router.push("/admin/users");
        } catch (error) {
            toast.error("Erro inesperado ao cadastrar.", error.message);
        }
    }

    return (
        <div className="space-y-6">

            <div className="flex justify-between items-end mb-6">
                <div className="flex items-left gap-2">
                    <Users className="h-8 w-8 text-orange-600" />
                    <div>
                        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
                            Gerenciar Usuários
                        </h1>
                        <p className="text-zinc-500 dark:text-zinc-200 text-sm">
                            Administre permissões, status e informações de perfil de todos os usuários.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto space-y-6">
                <Card className="border border-zinc-200/50 dark:border-zinc-600/50 shadow-sm hover:shadow-lg hover:shadow-zinc/60 dark:hover:shadow-zinc/20 transition-all duration-300 rounded-lg bg-white dark:bg-zinc-800 overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-2xl font-bold">Criar Conta</CardTitle>
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
                            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">
                                <Save className="mr-2 h-5 w-5" /> Salvar Alterações
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}