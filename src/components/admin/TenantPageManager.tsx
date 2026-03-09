'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Plus, FileText, ChevronLeft } from 'lucide-react';
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
            const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
            const res = await fetch(`${basePath}/api/admin/pages?tenantId=${tenantId}`);
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

        try {
            const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
            const res = await fetch(`${basePath}/api/admin/pages?id=${id}&tenantId=${tenantId}`, {
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

            const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
            const res = await fetch(`${basePath}/api/admin/pages`, {
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

        // Ensure text is not undefined
        if (editingCard.texto === undefined) {
            editingCard.texto = '';
        }

        // Check if we are editing an existing card (by temporary ID check)
        const isEditingIndex = editingCard._id && !isNaN(parseInt(editingCard._id));

        if (isEditingIndex) {
            const index = parseInt(editingCard._id!);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { _id, ...cardData } = editingCard;
            newCards[index] = cardData as ICard;
        } else {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
                <style jsx global>{`
                    .EmojiPickerReact .epr-category-name,
                    .EmojiPickerReact .epr-header-overlay,
                    .EmojiPickerReact .epr-emoji-category-label {
                        display: none !important;
                    }
                `}</style>
                <div className="flex items-center gap-4 justify-between">
                    <h3 className="text-xl font-bold text-zinc-800 dark:text-zinc-200">
                        {currentPage._id ? 'Editar Item' : 'Novo Item'}
                    </h3>
                    <Button variant="ghost" size="icon" onClick={() => setView('list')} className="bg-zinc-100 dark:bg-zinc-800 hover:dark:bg-zinc-700 hover:bg-zinc-100 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-all">
                        <ChevronLeft />
                    </Button>
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
                                    categories={[]}
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
                                <div className="border overflow-hidden">
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
                                        <CardHeader className="flex flex-row items-center justify-between pb-0 space-y-0">
                                            <CardTitle className="text-sm font-medium">
                                                {card.emoji} {card.titulo}
                                            </CardTitle>
                                            <div className="flex gap-1">
                                                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleEditCard(card, index)}>
                                                    <Edit className="h-3 w-3" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteCard(index)}>
                                                    <Trash2 className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="text-xs text-muted-foreground line-clamp-2 mb-2">
                                                <div dangerouslySetInnerHTML={{ __html: (card.texto || '').replace(/\n/g, '<br />') }} />
                                            </div>
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
                                <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in overflow-y-auto">
                                    <Card className="w-full max-w-md animate-in zoom-in-95 my-auto">
                                        <CardHeader>
                                            <CardTitle>{editingCard._id ? 'Editar Card' : 'Novo Card'}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="mr-6 grid grid-cols-6 gap-2">
                                                <div className="space-y-2 col-span-5">
                                                    <Label>Título</Label>
                                                    <Input
                                                        value={editingCard.titulo || ''}
                                                        onChange={e => setEditingCard({ ...editingCard, titulo: e.target.value })}
                                                        placeholder="Título do card"
                                                    />
                                                </div>
                                                <div className="space-y-2 col-span-1">
                                                    <Label>Ícone</Label>
                                                    <Input
                                                        value={editingCard.emoji || ''}
                                                        onChange={e => setEditingCard({ ...editingCard, emoji: e.target.value })}
                                                        className="text-center text-2xl w-20"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex flex-col gap-4">

                                                <div className="w-full">
                                                    <EmojiPicker
                                                        onEmojiClick={(emojiData) =>
                                                            setEditingCard({ ...editingCard, emoji: emojiData.emoji })
                                                        }
                                                        width={'100%'}
                                                        height={150}
                                                        searchDisabled
                                                        categories={[]}
                                                        previewConfig={{ showPreview: false }}
                                                        theme={resolvedTheme === 'dark' ? Theme.DARK : Theme.LIGHT}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Texto Descritivo</Label>
                                                <div className="border overflow-hidden">
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
                    <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">Páginas</h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        Crie páginas com conteúdo rico (texto, imagens, etc).
                    </p>
                </div>
                <Button onClick={openCreate} className="bg-orange-600 hover:bg-orange-700 text-white font-bold">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Item
                </Button>
            </div>

            {loading ? (
                <div className="p-8 text-center text-zinc-500">Carregando...</div>
            ) : pages.length === 0 ? (
                <Card className="border-zinc-200 dark:border-zinc-800">
                    <CardContent className="p-12 text-center flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center">
                            <FileText className="text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Nenhuma página criada</h3>
                            <p className="text-zinc-500 text-sm mt-1">Crie páginas para informar seus clientes.</p>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pages.map((page) => (
                        <Card key={page._id} className="group hover:border-orange-500/50 transition-all duration-300 shadow-sm hover:shadow-md p-2">
                            <CardContent className="flex flex-col h-full justify-between gap-4 px-2">
                                <div className="space-y-1">
                                    <div className="flex items-start justify-between">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-bold text-zinc-900 dark:text-zinc-100 text-base leading-tight">
                                                {page.titulo}
                                            </span>
                                            {!page.ativo && (
                                                <span className="w-fit text-[9px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                                                    Inativo
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono break-all bg-zinc-100 dark:bg-zinc-900 p-2 rounded border border-zinc-200 dark:border-zinc-800">
                                        <FileText size={12} className="shrink-0" />
                                        <span className="truncate">/{page.slug}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-8 px-2 text-zinc-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/30"
                                        onClick={() => openEdit(page)}
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
                                                    Esta ação não pode ser desfeita. Isso excluirá permanentemente a página
                                                    <span className="font-bold text-zinc-900"> {page.titulo}</span>.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                                <AlertDialogAction
                                                    onClick={() => handleDelete(page._id!)}
                                                    className="bg-red-600 hover:bg-red-700"
                                                >
                                                    Sim, excluir página
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
