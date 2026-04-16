'use client'

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Plus, Edit2, Trash2, List, Check, X, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { 
    getCategoriesAction, 
    saveCategoryAction, 
    deleteCategoryAction 
} from '@/lib/actions/category';
import EmojiPicker, { Theme } from 'emoji-picker-react';

interface Category {
    _id: string;
    name: string;
    type: 'carnes' | 'bebidas' | 'acompanhamentos' | 'outros' | 'sobremesas' | 'suprimentos';
    emoji?: string;
    order: number;
    active: boolean;
}

interface CategoryManagerProps {
    tenantId: string;
}

const CATEGORY_TYPES = [
    { value: 'carnes', label: 'Carnes', icon: '🥩' },
    { value: 'bebidas', label: 'Bebidas', icon: '🍻' },
    { value: 'acompanhamentos', label: 'Acompanhamentos', icon: '🥗' },
    { value: 'outros', label: 'Outros', icon: '🧀' },
    { value: 'sobremesas', label: 'Sobremesas', icon: '🍰' },
    { value: 'suprimentos', label: 'Suprimentos', icon: '🍴' }
];

export function CategoryManager({ tenantId }: CategoryManagerProps) {
    const { resolvedTheme } = useTheme();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState<string | null>(null); // _id of category being edited or 'new'
    
    // Form state
    const [formState, setFormState] = useState({
        name: '',
        type: 'carnes' as any,
        emoji: '',
        order: 0,
        active: true
    });

    useEffect(() => {
        fetchCategories();
    }, [tenantId]);

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const data = await getCategoriesAction(tenantId);
            setCategories(data);
        } catch (error) {
            toast.error('Erro ao carregar categorias');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (category: Category) => {
        setFormState({
            name: category.name,
            type: category.type,
            emoji: category.emoji || '',
            order: category.order,
            active: category.active
        });
        setIsEditing(category._id);
    };

    const handleNew = () => {
        setFormState({
            name: '',
            type: 'carnes',
            order: categories.length,
            active: true
        });
        setIsEditing('new');
    };

    const handleSave = async () => {
        if (!formState.name.trim()) {
            toast.error('Nome da categoria é obrigatório');
            return;
        }

        try {
            const payload = {
                ...formState,
                id: (isEditing === 'new' || isEditing?.startsWith('default-')) ? undefined : isEditing,
                order: (isEditing?.startsWith('default-') || formState.order === -1) ? -1 : formState.order
            };
            const res = await saveCategoryAction(tenantId, payload);
            
            if (res.success) {
                toast.success(res.message);
                setIsEditing(null);
                fetchCategories();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error('Erro ao salvar categoria');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Tem certeza que deseja excluir esta categoria? Os produtos a ela vinculados voltarão para a categoria padrão.')) {
            return;
        }

        try {
            const res = await deleteCategoryAction(tenantId, id);
            if (res.success) {
                toast.success(res.message);
                fetchCategories();
            } else {
                toast.error(res.message);
            }
        } catch (error) {
            toast.error('Erro ao excluir categoria');
        }
    };

    // Gerar lista final com categorias base SEMPRE visíveis
    const displayCategories: Category[] = [];
    CATEGORY_TYPES.forEach(baseType => {
        // Encontrar as customizadas deste tipo
        const customForType = [...categories.filter(c => c.type === baseType.value)];
        
        // Encontrar se existe um "Override" do Sistema (marcado com order -1)
        const systemOverrideIndex = customForType.findIndex(c => c.order === -1);
        let systemOverride = systemOverrideIndex !== -1 ? customForType.splice(systemOverrideIndex, 1)[0] : null;

        // Adicionar a entrada da Categoria Base (sempre editável)
        displayCategories.push(systemOverride || {
            _id: `default-${baseType.value}`,
            name: baseType.label,
            type: baseType.value as any,
            emoji: baseType.icon,
            order: -1,
            active: true
        });

        // Adicionar as demais subcategorias customizadas
        if (customForType.length > 0) {
            displayCategories.push(...customForType);
        }
    });

    if (loading) return <div className="p-8 text-center text-zinc-500 italic">Carregando categorias...</div>;

    return (
        <div className="space-y-6">
            <style jsx global>{`
                .EmojiPickerReact .epr-category-name,
                .EmojiPickerReact .epr-header-overlay,
                .EmojiPickerReact .epr-emoji-category-label {
                    display: none !important;
                }
            `}</style>
            <div className="flex justify-between items-center">
                <div>
                    <h3 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
                        Categorias da Loja
                    </h3>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        Personalize como os produtos são agrupados no seu cardápio.
                    </p>
                </div>
                <Button 
                    onClick={handleNew} 
                    disabled={isEditing !== null}
                    className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Categoria
                </Button>
            </div>

            {/* List and Editor */}
            <div className="space-y-3">
                {isEditing === 'new' && (
                    <div className="p-4 bg-orange-50/50 dark:bg-orange-900/10 border-2 border-dashed border-orange-200 dark:border-orange-800 rounded-xl animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                            <div className="space-y-2 md:col-span-1">
                                <Label>Nome</Label>
                                <Input 
                                    value={formState.name} 
                                    onChange={e => setFormState({...formState, name: e.target.value})}
                                    placeholder="Ex: Entradas"
                                />
                            </div>
                            <div className="space-y-2 md:col-span-1">
                                <Label>Tipo Base</Label>
                                <Select 
                                    value={formState.type} 
                                    onValueChange={v => {
                                        const typeInfo = CATEGORY_TYPES.find(t => t.value === v);
                                        setFormState({...formState, type: v as any, emoji: typeInfo?.icon || ''});
                                    }}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORY_TYPES.map(t => (
                                            <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label>Emoji / Ícone</Label>
                                <div className="flex gap-4 items-start">
                                    <Input 
                                        value={formState.emoji} 
                                        onChange={e => setFormState({...formState, emoji: e.target.value})}
                                        className="w-16 text-center text-2xl h-10"
                                    />
                                    <div className="flex-1">
                                        <EmojiPicker
                                            onEmojiClick={(emojiData) =>
                                                setFormState({ ...formState, emoji: emojiData.emoji })
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
                            </div>
                            <div className="space-y-2 md:col-span-2 flex items-center justify-between h-10">
                                <div className="flex items-center gap-2">
                                    <Switch 
                                        checked={formState.active} 
                                        onCheckedChange={v => setFormState({...formState, active: v})}
                                    />
                                    <Label>Ativa</Label>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(null)}>
                                        <X className="w-4 h-4 mr-1" />
                                    </Button>
                                    <Button size="sm" onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 text-white">
                                        <Check className="w-4 h-4 mr-1" /> Salvar
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {categories.length === 0 && !isEditing ? (
                    <div className="p-10 text-center border-2 border-dashed rounded-xl bg-zinc-50 dark:bg-zinc-900/20 text-zinc-500">
                        Nenhuma categoria personalizada. O sistema usará os padrões globais (Carnes, Bebidas, etc).
                    </div>
                ) : (
                    displayCategories.map((cat, index) => (
                        <div key={cat._id} className="group animate-in fade-in duration-300">
                            {isEditing === cat._id ? (
                                <div className="p-4 bg-zinc-50 dark:bg-zinc-800 border rounded-xl shadow-sm">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                        <div className="space-y-2 md:col-span-1">
                                            <Label>Nome</Label>
                                            <Input 
                                                value={formState.name} 
                                                onChange={e => setFormState({...formState, name: e.target.value})}
                                            />
                                        </div>
                                        <div className="space-y-2 md:col-span-1">
                                            <Label>Tipo Base</Label>
                                            <Select 
                                                value={formState.type} 
                                                onValueChange={v => {
                                                    const typeInfo = CATEGORY_TYPES.find(t => t.value === v);
                                                    setFormState({...formState, type: v as any, emoji: typeInfo?.icon || ''});
                                                }}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {CATEGORY_TYPES.map(t => (
                                                        <SelectItem key={t.value} value={t.value}>{t.icon} {t.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2 md:col-span-2">
                                            <Label>Emoji / Ícone</Label>
                                            <div className="flex gap-4 items-start">
                                                <Input 
                                                    value={formState.emoji} 
                                                    onChange={e => setFormState({...formState, emoji: e.target.value})}
                                                    className="w-16 text-center text-2xl h-10"
                                                />
                                                <div className="flex-1">
                                                    <EmojiPicker
                                                        onEmojiClick={(emojiData) =>
                                                            setFormState({ ...formState, emoji: emojiData.emoji })
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
                                        </div>
                                        <div className="space-y-2 md:col-span-2 flex items-center justify-between h-10">
                                            <div className="flex items-center gap-2">
                                                <Switch 
                                                    checked={formState.active} 
                                                    onCheckedChange={v => setFormState({...formState, active: v})}
                                                />
                                                <Label>Ativa</Label>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(null)}>
                                                    <X size={16} />
                                                </Button>
                                                <Button size="sm" onClick={handleSave} className="bg-orange-600 hover:bg-orange-700 text-white">
                                                    <Check size={16} />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className={`flex items-center justify-between p-4 bg-white dark:bg-zinc-800 border rounded-xl hover:border-orange-200 transition-all ${!cat.active ? 'opacity-60 grayscale' : ''}`}>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center text-xl shadow-sm border border-zinc-200 dark:border-zinc-600">
                                            {cat.emoji || CATEGORY_TYPES.find(t => t.value === cat.type)?.icon}
                                        </div>
                                        <div>
                                            <p className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                                                {cat.name}
                                                {cat._id.startsWith('default-') && (
                                                    <span className="text-[9px] bg-zinc-100 dark:bg-zinc-700 text-zinc-500 px-1.5 py-0.5 rounded-full border">PADRÃO</span>
                                                )}
                                            </p>
                                            <p className="text-[10px] uppercase font-black text-zinc-400 dark:text-zinc-500 tracking-widest">
                                                Tipo Base: {CATEGORY_TYPES.find(t => t.value === cat.type)?.label}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleEdit(cat)}
                                            className="h-8 w-8 p-0 text-zinc-500 hover:text-blue-600"
                                        >
                                            <Edit2 size={16} />
                                        </Button>
                                        <Button 
                                            variant="ghost" 
                                            size="sm" 
                                            onClick={() => handleDelete(cat._id)}
                                            disabled={cat._id.startsWith('default-')}
                                            className="h-8 w-8 p-0 text-zinc-500 hover:text-red-600 disabled:opacity-0"
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
            
            <div className="p-4 rounded-lg bg-zinc-50 dark:bg-zinc-900/40 border text-xs text-zinc-500 leading-relaxed italic">
                <strong>Dica:</strong> O "Tipo Base" é usado pela calculadora para saber como calcular as quantidades (ex: gramas para carnes, ml para bebidas). Você pode ter várias categorias com o mesmo tipo base.
            </div>
        </div>
    );
}
