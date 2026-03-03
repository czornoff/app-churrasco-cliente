'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Plus, ExternalLink, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
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
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [currentMenu, setCurrentMenu] = useState<Partial<IMenu>>({});

    useEffect(() => {
        if (tenantId) fetchMenus();
    }, [tenantId]);

    const fetchMenus = async () => {
        try {
            const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
            const res = await fetch(`${basePath}/api/admin/menu?tenantId=${tenantId}`);
            if (!res.ok) throw new Error('Failed to fetch menus');
            const data = await res.json();
            setMenus(data);
        } catch (error) {
            toast.error('Erro ao carregar menus', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
            const res = await fetch(`${basePath}/api/admin/menu?id=${id}&tenantId=${tenantId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Item excluído com sucesso');
            fetchMenus();
        } catch (error) {
            toast.error('Erro ao excluir item', error.message);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = currentMenu._id ? 'PUT' : 'POST';
            const body = { ...currentMenu, tenantId };

            const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
            const res = await fetch(`${basePath}/api/admin/menu`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error('Failed to save');

            toast.success(currentMenu._id ? 'Menu atualizado' : 'Menu criado');
            setView('list');
            setCurrentMenu({});
            fetchMenus();
        } catch (error: any) {
            toast.error('Erro ao salvar menu', error.message);
        }
    };

    const openEdit = (menu: IMenu) => {
        setCurrentMenu(menu);
        setView('editor');
    };

    const openCreate = () => {
        setCurrentMenu({ ativo: true });
        setView('editor');
    }

    if (view === 'editor') {
        return (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between gap-4">
                    <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
                        {currentMenu._id ? 'Editar Menu' : 'Novo Menu'}
                    </h3>
                    <Button variant="ghost" size="icon" onClick={() => setView('list')} className="bg-zinc-100 dark:bg-zinc-800 hover:dark:bg-zinc-700 hover:bg-zinc-100 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-all">
                        <ChevronLeft />
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Configurações do Menu</CardTitle>
                    </CardHeader>
                    <CardContent>
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
                            <div className="flex gap-2 justify-end pt-4">
                                <Button type="button" variant="outline" onClick={() => setView('list')}>
                                    Cancelar
                                </Button>
                                <Button type="submit" className="bg-orange-600 hover:bg-orange-700 text-white font-bold">
                                    Salvar Alterações
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        )
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
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

            {loading ? (
                <div className="p-8 text-center text-zinc-500">Carregando...</div>
            ) : menus.length === 0 ? (
                <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardContent className="p-12 text-center flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                            <Plus className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Nenhum item no menu</h3>
                            <p className="text-zinc-500 text-sm mt-1">Comece adicionando links para páginas ou sites externos.</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {menus.map((menu) => (
                        <Card key={menu._id} className="group hover:border-orange-500/50 transition-all duration-300 shadow-sm hover:shadow-md p-2">
                            <CardContent className="flex flex-col h-full justify-between gap-4 px-2">
                                <div className="space-y-1">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-base leading-tight">
                                                {menu.nome}
                                            </span>
                                            {!menu.ativo && (
                                                <span className="w-fit text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                    Inativo
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono break-all bg-zinc-100 dark:bg-zinc-900 p-2 rounded border border-zinc-200 dark:border-zinc-800">
                                        <ExternalLink size={12} className="shrink-0" />
                                        <span className="truncate">{menu.url}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2 text-zinc-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                                        onClick={() => openEdit(menu)}
                                    >
                                        <Edit size={14} className="mr-1" />
                                        <span className="text-xs font-semibold">Editar</span>
                                    </Button>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 px-2 text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                                            >
                                                <Trash2 size={14} className="mr-1" />
                                                <span className="text-xs font-semibold">Excluir</span>
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Esta ação não pode ser desfeita. Isso excluirá permanentemente o item de menu
                                                    <span className="font-bold text-zinc-900"> {menu.nome}</span>.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(menu._id)}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    Sim, excluir item
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}

