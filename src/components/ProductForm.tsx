'use client'

import { useState, useActionState, useEffect } from "react"
import { CloudinaryUpload } from "@/components/CldUploadWidget"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveProductAction } from "@/lib/actions/product";
import { Plus, ChevronLeft, Package, Trash2, Star } from "lucide-react";
import { toast } from "sonner";

import { Switch } from "@/components/ui/switch"

type Categoria = "carnes" | "bebidas" | "acompanhamentos" | "outros" | "sobremesas" | "suprimentos";

interface ProductFormData {
    _id?: string;
    nome: string;
    category: Categoria;
    preco: number;
    imageUrl?: string;
    gramasPorAdulto?: number;
    gramasEmbalagem?: number;
    mlPorAdulto?: number;
    mlEmbalagem?: number;
    qtdePorAdulto?: number;
    tipoSuprimento?: string;
    subCategoriaBebida?: 'alcoolica' | 'nao-alcoolica';
    subcategoria?: string;
    ativo: boolean;
    indicado?: boolean;
    favorito?: boolean;
}

interface ProductFormProps {
    tenantId: string;
    initialData?: ProductFormData;
    onBack?: () => void;
    onSuccess?: () => void;
}

export function ProductForm({ tenantId, initialData, onBack, onSuccess }: ProductFormProps) {
    const [state, formAction, isPending] = useActionState(saveProductAction, null);

    const [category, setCategory] = useState<Categoria>(initialData?.category || "carnes")
    const [tipoSuprimento, setTipoSuprimento] = useState(initialData?.tipoSuprimento || null)
    const [subCategoriaBebida, setSubCategoriaBebida] = useState<'alcoolica' | 'nao-alcoolica'>(
        initialData?.category === 'bebidas' ? (initialData?.subCategoriaBebida || 'nao-alcoolica') : 'nao-alcoolica'
    )
    const [nome, setNome] = useState(initialData?.nome || "");
    const [ativo, setAtivo] = useState(initialData?.ativo !== undefined ? initialData.ativo : true);
    const [indicado, setIndicado] = useState(initialData?.indicado || false);
    const [favorito, setFavorito] = useState(initialData?.favorito || false);

    useEffect(() => {
        if (state?.success) {
            toast.success(state.message);
            if (onSuccess) onSuccess();
            else if (onBack) onBack();
        } else if (state?.success === false) {
            toast.error(state.message);
        }
    }, [state, onBack, onSuccess]);

    const renderCamposDinamicos = () => {
        if (category === 'carnes' || category === 'acompanhamentos' || category === 'outros' || category === 'sobremesas') {
            return (
                <>
                    <div className="space-y-2">
                        <Label>Gramas por Adulto</Label>
                        <Input name="gramasPorAdulto" type="number" step="0.01" defaultValue={initialData?.gramasPorAdulto} required />
                    </div>
                    <div className="space-y-2">
                        <Label>Gramas por Embalagem</Label>
                        <Input name="gramasEmbalagem" type="number" step="0.01" defaultValue={initialData?.gramasEmbalagem} required />
                    </div>
                </>
            )
        }

        if (category === 'bebidas') {
            return (
                <>
                    <div className="space-y-2">
                        <Label>Tipo de Bebida</Label>
                        <Select
                            value={subCategoriaBebida}
                            onValueChange={(v) => setSubCategoriaBebida(v as 'alcoolica' | 'nao-alcoolica')}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="alcoolica">Alcoólica</SelectItem>
                                <SelectItem value="nao-alcoolica">Não Alcoólica</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>ML por Adulto</Label>
                        <Input name="mlPorAdulto" type="number" step="0.01" defaultValue={initialData?.mlPorAdulto} required />
                    </div>
                    <div className="space-y-2">
                        <Label>ML por Embalagem</Label>
                        <Input name="mlEmbalagem" type="number" step="0.01" defaultValue={initialData?.mlEmbalagem} required />
                    </div>
                </>
            )
        }

        if (category === 'suprimentos') {
            return (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="qtdePorAdulto">Quantidade por Adulto</Label>
                        <Input
                            id="qtdePorAdulto"
                            name="qtdePorAdulto"
                            type="number"
                            step="0.01"
                            defaultValue={initialData?.qtdePorAdulto}
                            placeholder={tipoSuprimento === 'CARVAO' ? "Ex: 1 (kg por kg de carne)" : tipoSuprimento === 'ACENDEDOR' ? "Ex: 1 (por hora)" : "Ex: 10"}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gramasEmbalagem">Gramas por Embalagem</Label>
                        <Input
                            id="gramasEmbalagem"
                            name="gramasEmbalagem"
                            type="number"
                            step="0.01"
                            defaultValue={initialData?.gramasEmbalagem}
                            placeholder="Ex: 3000 (para saco de 3kg)"
                            required={tipoSuprimento === 'CARVAO'}
                        />
                    </div>
                </>
            )
        }

        return null
    }

    return (
        <div className="w-full animate-in slide-in-from-right duration-300">
            {onBack && (
                <div className="flex items-center gap-4 mb-6">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ChevronLeft className="w-5 h-5" />
                        <span className="sr-only">Voltar</span>
                    </Button>
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                        <Package className="w-6 h-6 text-slate-400" />
                        {initialData ? "Editar Produto" : "Novo Produto"}
                    </h2>
                </div>
            )}

            <form
                action={formAction}
                className="space-y-6 bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border"
            >
                {initialData?._id && <input type="hidden" name="productId" value={initialData._id} />}
                <input type="hidden" name="tenantId" value={tenantId} />
                <input type="hidden" name="category" value={category} />
                <input type="hidden" name="ativo" value={ativo ? "on" : "off"} />
                <input type="hidden" name="indicado" value={indicado ? "on" : "off"} />
                <input type="hidden" name="favorito" value={favorito ? "on" : "off"} />
                {tipoSuprimento && <input type="hidden" name="tipoSuprimento" value={tipoSuprimento} />}

                {category === 'bebidas' ? (
                    <input type="hidden" name="subCategoriaBebida" value={subCategoriaBebida} />
                ) : null}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Foto do Produto</Label>
                        <CloudinaryUpload
                            name="imageUrl"
                            defaultValue={initialData?.imageUrl}
                            isAvatar={false}
                            fallbackUrl={`https://ui-avatars.com/api/?name=${encodeURIComponent(nome || "Produto")}&background=random&size=512`}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="nome">Nome do Item</Label>
                            <Input
                                id="nome"
                                name="nome"
                                placeholder="Ex: Picanha Premium"
                                value={nome}
                                onChange={(e) => setNome(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="category">Categoria</Label>
                            <Select
                                name="category"
                                value={category}
                                onValueChange={(v) => {
                                    setCategory(v as Categoria)
                                    if (v !== 'suprimentos') setTipoSuprimento(null)
                                    if (v !== 'bebidas') setSubCategoriaBebida('nao-alcoolica')
                                }}
                            >
                                <SelectTrigger id="category">
                                    <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="carnes">CARNE</SelectItem>
                                    <SelectItem value="bebidas">BEBIDA</SelectItem>
                                    <SelectItem value="acompanhamentos">ACOMPANHAMENTO</SelectItem>
                                    <SelectItem value="outros">OUTRO</SelectItem>
                                    <SelectItem value="sobremesas">SOBREMESA</SelectItem>
                                    <SelectItem value="suprimentos">SUPRIMENTO</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {category === 'suprimentos' && (
                            <div className="space-y-2">
                                <Label htmlFor="tipoSuprimento">Tipo de Suprimento (opcional)</Label>
                                <Input
                                    id="tipoSuprimento"
                                    name="tipoSuprimento"
                                    type="text"
                                    value={tipoSuprimento || ""}
                                    onChange={(e) => setTipoSuprimento(e.target.value || null)}
                                    placeholder="Ex: CARVAO, ACENDEDOR, COPO, VELA, GUARDANAPO, TALHERES, PRATO"
                                    className="text-sm"
                                />
                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                    Deixe em branco para suprimento genérico. Especifique para CARVAO (kg por kg), ACENDEDOR (1 por hora) ou outro tipo.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="preco">Preço (R$)</Label>
                        <Input
                            id="preco"
                            name="preco"
                            type="number"
                            step="0.01"
                            defaultValue={initialData?.preco}
                            required
                        />
                    </div>

                    {renderCamposDinamicos()}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                    <div className="space-y-4">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2">
                                <Switch
                                    id="ativo"
                                    checked={ativo}
                                    onCheckedChange={setAtivo}
                                />
                                <Label htmlFor="ativo" className="font-medium cursor-pointer">Ativo</Label>
                            </div>

                            <div className="flex items-center gap-4 border-l pl-6 border-zinc-100 dark:border-zinc-800">
                                <button
                                    type="button"
                                    onClick={() => setIndicado(!indicado)}
                                    className="flex items-center gap-1.5 group transition-all"
                                    title="Destaque na Página Inicial"
                                >
                                    <Star className={`w-5 h-5 transition-all ${indicado ? 'fill-blue-500 text-blue-500 scale-110' : 'text-zinc-300 group-hover:text-blue-400'}`} />
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${indicado ? 'text-blue-500' : 'text-zinc-400'}`}>Indicado</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setFavorito(!favorito)}
                                    className="flex items-center gap-1.5 group transition-all"
                                    title="Sugestão no Cálculo"
                                >
                                    <Star className={`w-5 h-5 transition-all ${favorito ? 'fill-yellow-400 text-yellow-400 scale-110' : 'text-zinc-300 group-hover:text-yellow-300'}`} />
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${favorito ? 'text-yellow-600 dark:text-yellow-400' : 'text-zinc-400'}`}>Favorito</span>
                                </button>
                            </div>
                        </div>

                        <p className="text-xs text-zinc-400 dark:text-zinc-500 italic hidden md:block">
                            (Produtos inativos não aparecem para clientes. Indicados aparecem na home e Favoritos são sugeridos no cálculo.)
                        </p>
                    </div>

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-8"
                    >
                        {isPending ? "Salvando..." : (
                            <>
                                <Plus className="mr-2 h-5 w-5" />
                                {initialData ? "Atualizar Produto" : "Cadastrar Produto"}
                            </>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    )
}