'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ChevronLeft, Save, Plus, Trash2, GripVertical } from 'lucide-react';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DynamicRichTextEditor from '@/components/DynamicRichTextEditor';

interface ICard {
    titulo: string;
    texto: string;
    extra: string;
    emoji: string;
    ativo: boolean;
}

interface PageFormProps {
    initialData?: {
        _id?: string;
        titulo: string;
        texto: string;
        tipo: 'texto' | 'cards' | 'ambos';
        emoji: string;
        ativo: boolean;
        slug: string;
        cards?: ICard[];
    };
    isEditing?: boolean;
}

export function PageForm({ initialData, isEditing = false }: PageFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        titulo: initialData?.titulo || '',
        texto: initialData?.texto || '',
        tipo: initialData?.tipo || 'texto',
        emoji: initialData?.emoji || '',
        ativo: initialData?.ativo ?? true,
        slug: initialData?.slug || '',
        cards: initialData?.cards || [] as ICard[]
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (checked: boolean) => {
        setFormData(prev => ({ ...prev, ativo: checked }));
    };

    const handleTypeChange = (value: string) => {
        setFormData(prev => ({ ...prev, tipo: value as 'texto' | 'cards' | 'ambos' }));
    };

    // Cards Management
    const addCard = () => {
        setFormData(prev => ({
            ...prev,
            cards: [...prev.cards, { titulo: '', texto: '', extra: '', emoji: '', ativo: true }]
        }));
    };

    const removeCard = (index: number) => {
        setFormData(prev => ({
            ...prev,
            cards: prev.cards.filter((_, i) => i !== index)
        }));
    };

    const updateCard = (index: number, field: keyof ICard, value: string | number | boolean | undefined) => {
        const newCards = [...formData.cards];
        newCards[index] = { ...newCards[index], [field]: value };
        setFormData(prev => ({ ...prev, cards: newCards }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
            const endpoint = `${basePath}/api/admin/pages`;
            const method = isEditing ? 'PUT' : 'POST';
            const body = isEditing ? { ...formData, _id: initialData?._id } : formData;

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error('Failed to save');

            toast.success(isEditing ? 'Página atualizada com sucesso' : 'Página criada com sucesso');
            router.push('/admin/pages');
            router.refresh();
        } catch (error) {
            toast.error('Erro ao salvar página', error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-200">
                    {isEditing ? 'Editar Página' : 'Nova Página'}
                </h1>
                <Button variant="ghost" size="icon" onClick={() => router.push('/admin/pages')} className="bg-zinc-100 dark:bg-zinc-800 hover:dark:bg-zinc-700 hover:bg-zinc-100 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-all">
                    <ChevronLeft />
                </Button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Configurações Gerais</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="titulo">Título da Página</Label>
                                <Input
                                    id="titulo"
                                    name="titulo"
                                    value={formData.titulo}
                                    onChange={handleChange}
                                    placeholder="Ex: Nossas Promoções"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug (URL)</Label>
                                <Input
                                    id="slug"
                                    name="slug"
                                    value={formData.slug}
                                    onChange={handleChange}
                                    placeholder="Ex: promocoes"
                                    required
                                />
                                <p className="text-xs text-zinc-500">Será acessado via /nome-do-loja/<strong>slug</strong></p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="emoji">Ícone</Label>
                                <Input
                                    id="emoji"
                                    name="emoji"
                                    value={formData.emoji}
                                    onChange={handleChange}
                                    placeholder="Ex: 🎉"
                                    className="max-w-25"
                                />
                            </div>
                            <div className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
                                <div className="space-y-0.5">
                                    <Label className="text-base">Ativa</Label>
                                    <p className="text-xs text-zinc-500">Página visível publicamente</p>
                                </div>
                                <Switch
                                    checked={formData.ativo}
                                    onCheckedChange={handleSwitchChange}
                                />
                            </div>
                        </div>

                        <div className="pt-2">
                            <Label>Tipo de Conteúdo</Label>
                            <Tabs value={formData.tipo} onValueChange={handleTypeChange} className="mt-2 w-full">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="texto">Texto Livre (HTML)</TabsTrigger>
                                    <TabsTrigger value="cards">Lista de Cards</TabsTrigger>
                                    <TabsTrigger value="ambos">Texto + Cards</TabsTrigger>
                                </TabsList>
                            </Tabs>
                        </div>
                    </CardContent>
                </Card>

                {(formData.tipo === 'texto' || formData.tipo === 'ambos') && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">Conteúdo (Texto/HTML)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="min-h-75 border rounded-lg overflow-hidden">
                                <DynamicRichTextEditor
                                    value={formData.texto}
                                    onChange={(data) => setFormData(prev => ({ ...prev, texto: data }))}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}

                {(formData.tipo === 'cards' || formData.tipo === 'ambos') && (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-lg">Cards</CardTitle>
                            <Button type="button" onClick={addCard} size="sm" variant="outline">
                                <Plus className="mr-2 h-4 w-4" /> Adicionar Card
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {formData.cards.length === 0 && (
                                <p className="text-center text-sm text-zinc-500 py-8">Nenhum card adicionado.</p>
                            )}
                            {formData.cards.map((card, index) => (
                                <div key={index} className="flex gap-4 p-4 border rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                                    <div className="flex-none pt-2 text-zinc-400">
                                        <GripVertical size={20} />
                                    </div>
                                    <div className="flex-1 space-y-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Input
                                                placeholder="Título do Card"
                                                value={card.titulo}
                                                onChange={(e) => updateCard(index, 'titulo', e.target.value)}
                                            />
                                            <Input
                                                placeholder="Emoji"
                                                value={card.emoji}
                                                onChange={(e) => updateCard(index, 'emoji', e.target.value)}
                                            />
                                        </div>
                                        <Textarea
                                            placeholder="Texto do card"
                                            value={card.texto}
                                            onChange={(e) => updateCard(index, 'texto', e.target.value)}
                                        />
                                        <Input
                                            placeholder="Texto Extra (Rodapé do card)"
                                            value={card.extra}
                                            onChange={(e) => updateCard(index, 'extra', e.target.value)}
                                        />
                                    </div>
                                    <div className="flex-none">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            onClick={() => removeCard(index)}
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}

                <div className="flex justify-end pt-4">
                    <Button type="submit" className="bg-orange-600 hover:bg-orange-700 px-8" disabled={loading}>
                        <Save className="mr-2 h-4 w-4" />
                        {loading ? 'Salvando...' : 'Salvar Página'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
