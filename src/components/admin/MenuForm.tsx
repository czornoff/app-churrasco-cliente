'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface MenuFormProps {
    initialData?: {
        _id?: string;
        nome: string;
        url: string;
        ativo: boolean;
        idPai?: number;
    };
    isEditing?: boolean;
}

export function MenuForm({ initialData, isEditing = false }: MenuFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        nome: initialData?.nome || '',
        url: initialData?.url || '',
        ativo: initialData?.ativo ?? true,
        idPai: initialData?.idPai || 0
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, ativo: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const endpoint = '/api/admin/menu';
            const method = isEditing ? 'PUT' : 'POST';
            const body = isEditing ? { ...formData, _id: initialData?._id } : formData;

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error('Failed to save');

            toast.success(isEditing ? 'Menu atualizado com sucesso' : 'Menu criado com sucesso');
            router.push('/admin/menu');
            router.refresh();
        } catch (error) {
            toast.error('Erro ao salvar menu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/menu">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft size={20} />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                    {isEditing ? 'Editar Item' : 'Novo Item do Menu'}
                </h1>
            </div>

            <Card>
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome do Link</Label>
                            <Input
                                id="nome"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                placeholder="Ex: Contato, Sobre Nós"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="url">URL de Destino</Label>
                            <Input
                                id="url"
                                name="url"
                                value={formData.url}
                                onChange={handleChange}
                                placeholder="Ex: /contato ou https://google.com"
                                required
                            />
                            <p className="text-xs text-slate-500">
                                Para links internos use o formato /slug (ex: /sobre). Para externos use https://...
                            </p>
                        </div>

                        <div className="flex items-center justify-between p-4 bg-neutral-50 dark:bg-zinc-900 rounded-lg">
                            <div className="space-y-0.5">
                                <Label className="text-base">Ativo</Label>
                                <p className="text-xs text-slate-500">Exibir este item no menu do aplicativo</p>
                            </div>
                            <Switch
                                checked={formData.ativo}
                                onCheckedChange={handleSwitchChange}
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button type="submit" className="bg-orange-600 hover:bg-orange-700" disabled={loading}>
                                <Save className="mr-2 h-4 w-4" />
                                {loading ? 'Salvando...' : 'Salvar Alterações'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
