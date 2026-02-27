'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pencil, Trash2, Plus, FileText, ChevronLeft } from 'lucide-react';
import { toast } from 'sonner';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import EmojiPicker, { Theme } from 'emoji-picker-react';
import DynamicRichTextEditor from '@/components/DynamicRichTextEditor';

interface ICard {
    _id?: string;
    titulo: string;
    texto: string;
    extra?: string;
    emoji: string;
    ativo: boolean;
}

interface IPage {
    _id?: string;
    titulo: string;
    tipo: 'texto' | 'cards' | 'ambos';
    slug: string;
    ativo: boolean;
    texto?: string;
    emoji?: string;
    cards?: ICard[];
}

interface TenantPageManagerProps {
    tenantId: string;
}

export function TenantPageManager({ tenantId }: TenantPageManagerProps) {
    const { resolvedTheme } = useTheme();
    const [pages, setPages] = useState<IPage[]>([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState<'list' | 'editor'>('list');
    const [currentPage, setCurrentPage] = useState<Partial<IPage>>({});

    // Card editing state
    const [editingCard, setEditingCard] = useState<Partial<ICard> | null>(null);
    const [isCardModalOpen, setIsCardModalOpen] = useState(false);

    useEffect(() => {
        if (tenantId) fetchPages();
    }, [tenantId]);

    const fetchPages = async () => {
        try {
            const res = await fetch(`/api/admin/pages?tenantId=${tenantId}`);
            if (!res.ok) throw new Error('Failed to fetch pages');
            const data = await res.json();
            setPages(data);
        } catch (error) {
            toast.error('Erro ao carregar páginas', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta página?')) return;

        try {
            const res = await fetch(`/api/admin/pages?id=${id}&tenantId=${tenantId}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Página excluída com sucesso');
            fetchPages();
        } catch (error) {
            toast.error('Erro ao excluir página', error.message);
        }
    };

    const handleSave = async () => {
        try {
            const method = currentPage._id ? 'PUT' : 'POST';
            const body = {
                ...currentPage,
                tenantId
            };

            const res = await fetch('/api/admin/pages', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error('Failed to save');

            toast.success(currentPage._id ? 'Página atualizada' : 'Página criada');
            setView('list');
            setCurrentPage({});
            fetchPages();
        } catch (error) {
            toast.error('Erro ao salvar página', error.message);
        }
    };

    const openEdit = (page: IPage) => {
        setCurrentPage({ ...page, cards: page.cards || [] });
        setView('editor');
    };

    const openCreate = () => {
        setCurrentPage({
            ativo: true,
            tipo: 'texto',
            texto: '',
            emoji: '📄',
            cards: []
        });
        setView('editor');
    }

    const handleTipoChange = (newTipo: 'texto' | 'cards' | 'ambos') => {
        setCurrentPage({ ...currentPage, tipo: newTipo });
    }

    // --- Card Methods ---

    const handleAddCard = () => {
        setEditingCard({
            titulo: '',
            texto: '',
            extra: '',
            emoji: '✨',
            ativo: true
        });
        setIsCardModalOpen(true);
    };

    const handleEditCard = (card: ICard, index: number) => {
        setEditingCard({ ...card, _id: index.toString() }); // using index as temp ID for editing logic
        setIsCardModalOpen(true);
    };

    const handleSaveCard = () => {
        if (!editingCard) return;

        const newCards = [...(currentPage.cards || [])];

        // Check if we are editing an existing card (by temporary ID check)
        const isEditingIndex = editingCard._id && !isNaN(parseInt(editingCard._id));

        if (isEditingIndex) {
            const index = parseInt(editingCard._id!);
            newCards[index] = editingCard as ICard;
            delete newCards[index]._id; // Clean up temp ID
        } else {
            // Clean up temp ID just in case
            const { _id, ...cardData } = editingCard;
            newCards.push(cardData as ICard);
        }

        setCurrentPage({ ...currentPage, cards: newCards });
        setIsCardModalOpen(false);
        setEditingCard(null);
    };

    const handleDeleteCard = (index: number) => {
        const newCards = [...(currentPage.cards || [])];
        newCards.splice(index, 1);
        setCurrentPage({ ...currentPage, cards: newCards });
    };


    if (view === 'editor') {
        return (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => setView('list')}>
                        <ChevronLeft />
                    </Button>
                    <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
                        {currentPage._id ? 'Editar Item' : 'Novo Item'}
                    </h3>
                </div>

                <div className="space-y-6">
                    {/* Tipo Selector */}
                    <div className="space-y-2">
                        <Label>Tipo de Página</Label>
                        <div className="flex gap-2 flex-wrap">
                            <button
                                type="button"
                                onClick={() => handleTipoChange('texto')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage.tipo === 'texto'
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                                    }`}
                            >
                                Apenas Texto
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTipoChange('cards')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage.tipo === 'cards'
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                                    }`}
                            >
                                Apenas Cards
                            </button>
                            <button
                                type="button"
                                onClick={() => handleTipoChange('ambos')}
                                className={`px-4 py-2 rounded-lg font-medium transition-colors ${currentPage.tipo === 'ambos'
                                        ? 'bg-orange-600 text-white'
                                        : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                                    }`}
                            >
                                Texto + Cards
                            </button>
                        </div>
                    </div>

                    {/* Configurações Gerais */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Configurações da Página</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="titulo">Título da Página</Label>
                                <Input
                                    id="titulo"
                                    value={currentPage.titulo || ''}
                                    onChange={e => setCurrentPage({ ...currentPage, titulo: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug (URL)</Label>
                                <Input
                                    id="slug"
                                    value={currentPage.slug || ''}
                                    onChange={e => setCurrentPage({ ...currentPage, slug: e.target.value })}
                                    placeholder="ex: sobre-nos"
                                />
                            </div>
                            <div className="space-y-2 flex gap-2 items-start">
                                <div className="align-top">
                                    <Label htmlFor="emoji">Ícone</Label>
                                    <Input
                                        id="emoji"
                                        value={currentPage.emoji || ''}
                                        onChange={e => setCurrentPage({ ...currentPage, emoji: e.target.value })}
                                        className="w-16 text-center text-2xl mt-2"
                                    />
                                </div>
                                <EmojiPicker
                                    onEmojiClick={(emojiData) =>
                                        setCurrentPage({ ...currentPage, emoji: emojiData.emoji })
                                    }
                                    width={'100%'}
                                    height={200}
                                    searchDisabled
                                    previewConfig={{ showPreview: false }}
                                    theme={resolvedTheme === 'dark' ? Theme.DARK : Theme.LIGHT}
                                />
                            </div>
                            <div className="flex items-center gap-2 pt-2">
                                <Switch
                                    id="ativo"
                                    checked={currentPage.ativo}
                                    onCheckedChange={checked => setCurrentPage({ ...currentPage, ativo: checked })}
                                />
                                <Label htmlFor="ativo">Página Ativa</Label>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Editor de Texto */}
                    {(currentPage.tipo === 'texto' || currentPage.tipo === 'ambos') && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Conteúdo de Texto</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="border rounded-lg overflow-hidden min-h-125">
                                    <DynamicRichTextEditor
                                        value={currentPage.texto || ''}
                                        onChange={(data) => setCurrentPage({ ...currentPage, texto: data })}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* Editor de Cards */}
                    {(currentPage.tipo === 'cards' || currentPage.tipo === 'ambos') && (
                        <>
                            <div className="flex justify-between items-center mb-4">
                                <div>
                                    <h4 className="text-lg font-bold">Cards Informativos</h4>
                                    <p className="text-sm text-muted-foreground">Adicione blocos de destaque para esta página.</p>
                                </div>
                                <Button onClick={handleAddCard} variant="outline" className="border-dashed">
                                    <Plus className="w-4 h-4 mr-2" /> Adicionar Card
                                </Button>
                            </div>

                            {/* Card List */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {currentPage.cards?.map((card, index) => (
                                    <Card key={index} className="relative group hover:border-orange-200 transition-colors">
                                        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                                            <CardTitle className="text-sm font-medium">
                                                {card.emoji} {card.titulo}
                                            </CardTitle>
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditCard(card, index)}>
                                                    <Pencil className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteCard(index)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                <div dangerouslySetInnerHTML={{ __html: card.texto.replace(/\n/g, '<br />') }} />
                                            </p>
                                            {card.extra && (
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary text-secondary-foreground">
                                                    {card.extra}
                                                </span>
                                            )}
                                            {!card.ativo && (
                                                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                                    Inativo
                                                </span>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}
                                {(!currentPage.cards || currentPage.cards.length === 0) && (
                                    <div className="col-span-full border-2 border-dashed rounded-lg p-12 text-center text-muted-foreground">
                                        Nenhum card adicionado. Clique em Adicionar Card para começar.
                                    </div>
                                )}
                            </div>

                            {/* Card Editor Modal (Inline for simplicity, or could be a Dialog) */}
                            {isCardModalOpen && editingCard && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
                                    <Card className="w-full max-w-md animate-in zoom-in-95">
                                        <CardHeader>
                                            <CardTitle>{editingCard._id ? 'Editar Card' : 'Novo Card'}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Título</Label>
                                                <Input
                                                    value={editingCard.titulo || ''}
                                                    onChange={e => setEditingCard({ ...editingCard, titulo: e.target.value })}
                                                    placeholder="Título do card"
                                                />
                                            </div>

                                            <div className="flex gap-4">
                                                <div className="w-1/4 space-y-2">
                                                    <Label>Ícone</Label>
                                                    <Input
                                                        value={editingCard.emoji || ''}
                                                        onChange={e => setEditingCard({ ...editingCard, emoji: e.target.value })}
                                                        className="text-center text-2xl"
                                                    />
                                                </div>
                                                <div className="w-3/4">
                                                    <EmojiPicker
                                                        onEmojiClick={(emojiData) =>
                                                            setEditingCard({ ...editingCard, emoji: emojiData.emoji })
                                                        }
                                                        width={'100%'}
                                                        height={200}
                                                        searchDisabled
                                                        previewConfig={{ showPreview: false }}
                                                        theme={resolvedTheme === 'dark' ? Theme.DARK : Theme.LIGHT}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Texto Descritivo</Label>
                                                <div className="border rounded-lg overflow-hidden min-h-75">
                                                    <DynamicRichTextEditor
                                                        value={editingCard.texto || ''}
                                                        onChange={(data) => setEditingCard({ ...editingCard, texto: data })}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Info Extra (Opcional)</Label>
                                                <Input
                                                    value={editingCard.extra || ''}
                                                    onChange={e => setEditingCard({ ...editingCard, extra: e.target.value })}
                                                    placeholder="Ex: R$ 99,90 ou 'Promoção'"
                                                />
                                            </div>

                                            <div className="flex items-center gap-2 pt-2">
                                                <Switch
                                                    id="card-active"
                                                    checked={editingCard.ativo}
                                                    onCheckedChange={checked => setEditingCard({ ...editingCard, ativo: checked })}
                                                />
                                                <Label htmlFor="card-active">Card Visível</Label>
                                            </div>

                                            <div className="flex gap-2 justify-end pt-4">
                                                <Button variant="outline" onClick={() => setIsCardModalOpen(false)}>Cancelar</Button>
                                                <Button onClick={handleSaveCard} className="bg-orange-600 hover:bg-orange-700 text-white">Salvar Card</Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )}

                        </>
                    )}

                    {/* Botão de Salvar */}
                    <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={() => setView('list')}>
                            Cancelar
                        </Button>
                        <Button onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 text-white">
                            Salvar Página
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">Páginas Customizadas</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        Crie páginas com conteúdo rico (texto, imagens, etc).
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
                    ) : pages.length === 0 ? (
                        <div className="p-12 text-center flex flex-col items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                                <FileText className="text-orange-600 dark:text-orange-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Nenhuma página criada</h3>
                                <p className="text-zinc-500 text-sm mt-1">Crie páginas para informar seus clientes.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-200 dark:divide-zinc-800">
                            {pages.map((page) => (
                                <div key={page._id} className="p-4 flex items-center justify-between hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-zinc-900 dark:text-zinc-100">{page.titulo}</span>
                                            {!page.ativo && (
                                                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold uppercase">Inativo</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 text-xs text-zinc-500 font-mono">
                                            /{page.slug}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-zinc-500 hover:text-orange-600"
                                            onClick={() => openEdit(page)}
                                        >
                                            <Pencil size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-zinc-500 hover:text-red-600"
                                            onClick={() => handleDelete(page._id!)}
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
        </div>
    );
}
