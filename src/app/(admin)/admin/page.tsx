'use client' // Obrigatório para eventos de clique

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Chrome } from "lucide-react";

export default function AdminIndex() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight">
                        Painel Administrativo
                    </CardTitle>
                    <CardDescription>
                        Gerencie suas lojas e cardápios em um só lugar
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <div className="grid grid-cols-1 gap-3">
                        <Button 
                            variant="outline" 
                            className="py-6 border-2 hover:bg-slate-50"
                            onClick={() => signIn('google', { callbackUrl: '/admin/tenants' })}
                        >
                            <Chrome className="mr-2 h-5 w-5 text-red-500" />
                            Entrar com Google
                        </Button>
                    </div>
                    
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-500">Acesso Restrito</span>
                        </div>
                    </div>

                    <Button className="w-full bg-orange-600 hover:bg-orange-700 py-6">
                        Criar Conta Administrativa
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}