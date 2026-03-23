'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCcw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function ResetModelButton() {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const handleReset = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/reset-seeds', {
                method: 'POST',
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(data.message || 'Loja Modelo resetada com sucesso!');
                setOpen(false);
                // Recarregar após um tempo para ver as mudanças
                setTimeout(() => window.location.reload(), 1500);
            } else {
                toast.error(data.error || 'Erro ao resetar Loja Modelo');
            }
        } catch (error) {
            toast.error('Erro de rede ao tentar resetar Loja Modelo');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="destructive"
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                >
                    <RefreshCcw className="h-4 w-4" />
                    Zerar Loja Modelo
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-red-600">
                        <AlertTriangle className="h-5 w-5" />
                        Confirmar Reset Total da Loja Modelo
                    </DialogTitle>
                    <DialogDescription className="py-4">
                        Esta ação irá <strong>EXCLUIR PERMANENTEMENTE</strong> todos os:
                        <ul className="list-disc ml-6 mt-2 space-y-1">
                            <li>Cálculos realizados por usuários</li>
                            <li>Configurações de Menus personalizados</li>
                            <li>Páginas criadas</li>
                            <li>Configurações do Tenant</li>
                        </ul>
                        <p className="mt-4">
                            Os dados serão recriados a partir dos arquivos padrão do sistema (seeds).
                        </p>
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
                        Cancelar
                    </Button>
                    <Button 
                        variant="destructive" 
                        onClick={handleReset} 
                        disabled={loading}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {loading ? (
                            <>
                                <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                                Resetando...
                            </>
                        ) : (
                            'Confirmar Reset'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
