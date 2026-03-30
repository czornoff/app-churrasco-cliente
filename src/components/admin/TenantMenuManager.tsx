'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Edit, Trash2, Plus, ExternalLink, ChevronLeft, GripVertical, Save, Lock } from 'lucide-react';
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
    ordem: number;
    ativo: boolean;
    isDefault?: boolean;
    createdAt?: string;
}

interface TenantMenuManagerProps {
    tenantId: string;
}

export function TenantMenuManager({ tenantId }: TenantMenuManagerProps) {
    const [menus, setMenus] = useState<IMenu[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSavingOrder, setIsSavingOrder] = useState(false);
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [currentMenu, setCurrentMenu] = useState<Partial<IMenu>>({});
    const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

    useEffect(() => {
        if (tenantId) fetchMenus();
    }, [tenantId]);

    const fetchMenus = async () => {
        try {
            const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
            const res = await fetch(`${basePath}/api/admin/menu?tenantId=${tenantId}`);
            if (!res.ok) throw new Error('Failed to fetch menus');
            const data: IMenu[] = await res.json();

            // Inject defaults if missing
            const hasCalculadora = data.some(m => m.url === '/calculadora' || m.url.includes('/calculadora'));
            const hasCardapio = data.some(m => m.url === '/cardapio' || m.url.includes('/cardapio'));

            let finalMenus = [...data];

            if (!hasCalculadora) {
                finalMenus.push({ _id: 'def-calc', nome: 'Calculadora', url: '/calculadora', ativo: true, ordem: -100, isDefault: true });
            }
            if (!hasCardapio) {
                finalMenus.push({ _id: 'def-card', nome: 'Cardápio', url: '/cardapio', ativo: true, ordem: -90, isDefault: true });
            }

            // Sort by ordem
            finalMenus.sort((a, b) => a.ordem - b.ordem);
            setMenus(finalMenus);
        } catch (error) {
            toast.error('Erro ao carregar menus');
        } finally {
            setLoading(false);
        }
    };

    const handleSaveOrder = async () => {
        setIsSavingOrder(true);
        try {
            const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
            
            // We need to save all items that are NOT virtual IDs
            // If they are virtual, we should probably POST them first or ignore if they aren't moved.
            // But for simplicity, let's treat the order update carefully.
            
            const itemsToUpdate = [];
            
            for (let i = 0; i < menus.length; i++) {
                const item = menus[i];
                // If it's a default/virtual item and it moved, we'd need to create it.
                // But let's assume we update the ones with real IDs.
                if (!item._id.startsWith('def-')) {
                    itemsToUpdate.push({ _id: item._id, ordem: i * 10 });
                } else {
                    // Create default items if they are being ordered
                    const res = await fetch(`${basePath}/api/admin/menu`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            nome: item.nome,
                            url: item.url,
                            ativo: true,
                            ordem: i * 10,
                            tenantId
                        }),
                    });
                    // Refresh after creation will replace the virtual ID with real one
                }
            }

            const res = await fetch(`${basePath}/api/admin/menu`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: itemsToUpdate, tenantId }),
            });

            if (!res.ok) throw new Error('Failed to save order');
            toast.success('Ordem salva com sucesso');
            fetchMenus();
        } catch (error) {
            toast.error('Erro ao salvar ordem');
        } finally {
            setIsSavingOrder(false);
        }
    };

    const handleDragStart = (index: number) => {
        setDraggedItemIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedItemIndex === null || draggedItemIndex === index) return;

        const newMenus = [...menus];
        const draggedItem = newMenus[draggedItemIndex];
        newMenus.splice(draggedItemIndex, 1);
        newMenus.splice(index, 0, draggedItem);
        
        setDraggedItemIndex(index);
        setMenus(newMenus);
    };

    const handleDragEnd = () => {
        setDraggedItemIndex(null);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = currentMenu._id && !currentMenu._id.startsWith('def-') ? 'PUT' : 'POST';
            const body = { ...currentMenu, tenantId };
            delete body._id; // Remove virtual ID if it exists

            const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
            const res = await fetch(`${basePath}/api/admin/menu${currentMenu._id && !currentMenu._id.startsWith('def-') ? '' : ''}`, {
                method: currentMenu._id && !currentMenu._id.startsWith('def-') ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(currentMenu._id && !currentMenu._id.startsWith('def-') ? { ...currentMenu, tenantId } : body),
            });

            if (!res.ok) throw new Error('Failed to save');

            toast.success('Menu salvo com sucesso');
            setView('list');
            setCurrentMenu({});
            fetchMenus();
        } catch (error: any) {
            toast.error('Erro ao salvar menu');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
            const res = await fetch(`${basePath}/api/admin/menu?id=${id}&tenantId=${tenantId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Item excluído');
            fetchMenus();
        } catch (error) {
            toast.error('Erro ao excluir item');
        }
    };

    if (view === 'editor') {
        return (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
                        {currentMenu._id && !currentMenu._id.startsWith('def-') ? 'Editar Menu' : 'Novo Menu'}
                    </h3>
                    <Button variant="ghost" size="icon" onClick={() => setView('list')}>
                        <ChevronLeft />
                    </Button>
                </div>

                <Card className="border-zinc-200 dark:border-zinc-800 shadow-xl">
                    <CardContent className="p-6">
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nome">Nome do Item</Label>
                                <Input
                                    id="nome"
                                    value={currentMenu.nome || ''}
                                    onChange={e => setCurrentMenu({ ...currentMenu, nome: e.target.value })}
                                    placeholder="Ex: Instagram"
                                    required
                                    disabled={currentMenu.isDefault}
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
                                    disabled={currentMenu.isDefault}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ordem">Ordem (Manual)</Label>
                                <Input
                                    id="ordem"
                                    type="number"
                                    value={currentMenu.ordem || 0}
                                    onChange={e => setCurrentMenu({ ...currentMenu, ordem: Number(e.target.value) })}
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
                                <Button type="button" variant="outline" onClick={() => setView('list')}>Cancelar</Button>
                                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                                    Salvar
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
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter">Menu de Navegação</h3>
                    <p className="text-zinc-500 text-sm">Arraste os itens para reordenar a exibição no cabeçalho e rodapé.</p>
                </div>
                <div className="flex gap-2">
                    <Button 
                        onClick={handleSaveOrder} 
                        variant="outline" 
                        className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                        disabled={isSavingOrder}
                    >
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Ordem
                    </Button>
                    <Button onClick={() => { setCurrentMenu({ ativo: true, ordem: menus.length * 10 }); setView('editor'); }} className="bg-zinc-900 text-white font-bold">
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Item
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="p-12 text-center text-zinc-500 font-medium">Carregando estrutura...</div>
            ) : (
                <div className="space-y-2">
                    {menus.map((menu, index) => (
                        <div
                            key={menu._id}
                            draggable
                            onDragStart={() => handleDragStart(index)}
                            onDragOver={(e) => handleDragOver(e, index)}
                            onDragEnd={handleDragEnd}
                            className={`flex items-center justify-between p-4 bg-white dark:bg-zinc-900 border rounded-xl transition-all duration-200 group ${
                                draggedItemIndex === index ? 'opacity-50 scale-95 border-emerald-500 border-dashed' : 'border-zinc-100 dark:border-zinc-800 hover:shadow-md'
                            }`}
                        >
                            <div className="flex items-center gap-4 flex-1">
                                <div className="cursor-grab active:cursor-grabbing text-zinc-400 group-hover:text-zinc-600">
                                    <GripVertical size={20} />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                        {menu.nome}
                                        {menu._id.startsWith('def-') && (
                                            <span className="text-[9px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1.5 py-0.5 rounded uppercase font-black tracking-widest flex items-center gap-1">
                                                <Lock size={10} /> Padrão
                                            </span>
                                        )}
                                    </span>
                                    <span className="text-xs text-zinc-500 font-mono flex items-center gap-1">
                                        <ExternalLink size={10} /> {menu.url}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                {!menu._id.startsWith('def-') ? (
                                    <>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-9 w-9 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50"
                                            onClick={() => { setCurrentMenu(menu); setView('editor'); }}
                                        >
                                            <Edit size={16} />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-zinc-400 hover:text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Excluir item?</AlertDialogTitle>
                                                    <AlertDialogDescription>Remover permanentemente o item {menu.nome}.</AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(menu._id)} className="bg-red-600">Sim, excluir</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </>
                                ) : (
                                    <span className="text-xs text-zinc-400 italic px-3">Específico do App</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

