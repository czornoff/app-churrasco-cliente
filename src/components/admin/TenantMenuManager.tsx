'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, Plus, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

interface IMenu {
    _id: string;
    nome: string;
    url: string;
    ativo: boolean;
    createdAt: string;
}

interface TenantMenuManagerProps {
    tenantId: string;
}

export function TenantMenuManager({ tenantId }: TenantMenuManagerProps) {
    const [menus, setMenus] = useState<IMenu[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [currentMenu, setCurrentMenu] = useState<Partial<IMenu>>({});

    useEffect(() => {
        if (tenantId) fetchMenus();
    }, [tenantId]);

    const fetchMenus = async () => {
        try {
            const res = await fetch(`/api/admin/menu?tenantId=${tenantId}`);
            if (!res.ok) throw new Error('Failed to fetch menus');
            const data = await res.json();
            setMenus(data);
        } catch (error) {
            toast.error('Erro ao carregar menus');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir este item?')) return;

        try {
            const res = await fetch(`/api/admin/menu?id=${id}&tenantId=${tenantId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Item excluído com sucesso');
            fetchMenus();
        } catch (error) {
            toast.error('Erro ao excluir item');
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = currentMenu._id ? 'PUT' : 'POST';
            const body = { ...currentMenu, tenantId };

            const res = await fetch('/api/admin/menu', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error('Failed to save');

            toast.success(currentMenu._id ? 'Menu atualizado' : 'Menu criado');
            setIsCreateOpen(false);
            setIsEditOpen(false);
            setCurrentMenu({});
            fetchMenus();
        } catch (error) {
            toast.error('Erro ao salvar menu');
        }
    };

    const openEdit = (menu: IMenu) => {
        setCurrentMenu(menu);
        setIsEditOpen(true);
    };

    const openCreate = () => {
        setCurrentMenu({ ativo: true });
        setIsCreateOpen(true);
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">Itens do Menu</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        Gerencie os links que aparecem no menu do aplicativo.
                    </p>
                </div>
                <Button onClick={openCreate} className="bg-orange-600 hover:bg-orange-700 text-white font-bold">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Item
                </Button>
            </div>

            <Card className="border-zinc-200 dark:border-zinc-800">
                <CardContent className="p-0">
                    {loading ? (
                        <div className="p-8 text-center text-zinc-500">Carregando...</div>
                    ) : menus.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                <Plus className="text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Nenhum item no menu</h3>
                                <p className="text-zinc-500 text-sm mt-1">Comece adicionando links para páginas ou sites externos.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {menus.map((menu) => (
                                <div key={menu._id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{menu.nome}</span>
                                            {!menu.ativo && (
                                                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase">Inativo</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-zinc-500 font-mono">
                                            <ExternalLink size={10} />
                                            {menu.url}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-zinc-500 hover:text-orange-600"
                                            onClick={() => openEdit(menu)}
                                        >
                                            <Pencil size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-zinc-500 hover:text-red-600"
                                            onClick={() => handleDelete(menu._id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal de Criação/Edição */}
            <Dialog open={isCreateOpen || isEditOpen} onOpenChange={(open) => {
                if (!open) {
                    setIsCreateOpen(false);
                    setIsEditOpen(false);
                }
            }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{isEditOpen ? 'Editar Menu' : 'Novo Menu'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSave} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome do Item</Label>
                            <Input
                                id="nome"
                                value={currentMenu.nome || ''}
                                onChange={e => setCurrentMenu({ ...currentMenu, nome: e.target.value })}
                                placeholder="Ex: Instagram"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="url">URL</Label>
                            <Input
                                id="url"
                                value={currentMenu.url || ''}
                                onChange={e => setCurrentMenu({ ...currentMenu, url: e.target.value })}
                                placeholder="https://..."
                                required
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <Switch
                                id="ativo"
                                checked={currentMenu.ativo}
                                onCheckedChange={checked => setCurrentMenu({ ...currentMenu, ativo: checked })}
                            />
                            <Label htmlFor="ativo">Ativo</Label>
                        </div>
                        <DialogFooter>
                            <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white">Salvar</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
