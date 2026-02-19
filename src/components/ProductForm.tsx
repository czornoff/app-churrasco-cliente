'use client'

import { useState } from "react"
import { CloudinaryUpload } from "@/components/CldUploadWidget"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveProductAction } from "@/lib/actions/product";

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
}

interface ProductFormProps {
    tenantId: string;
    initialData?: ProductFormData;
}

export function ProductForm({ tenantId, initialData }: ProductFormProps) {
    const [category, setCategory] = useState<Categoria>(initialData?.category || "carnes")
    const [tipoSuprimento, setTipoSuprimento] = useState(initialData?.tipoSuprimento || null)
    const [subCategoriaBebida, setSubCategoriaBebida] = useState<'alcoolica' | 'nao-alcoolica'>(
        initialData?.category === 'bebidas' ? (initialData?.subCategoriaBebida || 'nao-alcoolica') : 'nao-alcoolica'
    )
    const [nome, setNome] = useState(initialData?.nome || "");
    // Default true para novos produtos, ou o valor existente para edição
    const [ativo, setAtivo] = useState(initialData?.ativo !== undefined ? initialData.ativo : true);

    const renderCamposDinamicos = () => {
        if (category === 'carnes' || category === 'acompanhamentos' || category === 'outros' || category === 'sobremesas') {
            // Campos: preco, gramasPorAdulto, gramasEmbalagem
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
            // Campos: preco, mlPorAdulto, mlEmbalagem, subCategoriaBebida
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
            // Campo: qtdePorAdulto
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
                            placeholder={tipoSuprimento === 'CARVAO' ? "Ex: 2.5 (kg por kg)" : tipoSuprimento === 'ACENDEDOR' ? "Ex: 1 (por hora)" : "Ex: 10"}
                            required 
                        />
                    </div>
                </>
            )
        }

        return null
    }

    return (
        <form
            action={(formData) => {
                saveProductAction(formData);
            }}
            className="space-y-6 bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border"
        >
            {initialData?._id && <input type="hidden" name="productId" value={initialData._id} />}
            <input type="hidden" name="tenantId" value={tenantId} />
            <input type="hidden" name="category" value={category} />
            <input type="hidden" name="ativo" value={ativo ? "on" : "off"} />
            {tipoSuprimento && <input type="hidden" name="tipoSuprimento" value={tipoSuprimento} />}
            
            {/* SubCategoriaBebida - sempre envia se for bebida */}
            {category === 'bebidas' ? (
                <input type="hidden" name="subCategoriaBebida" value={subCategoriaBebida} />
            ) : null}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lado Esquerdo: Upload da Foto */}
                <div className="space-y-2">
                    <Label>Foto do Produto</Label>
                    <CloudinaryUpload
                        name="imageUrl"
                        defaultValue={initialData?.imageUrl}
                        isAvatar={false}
                        fallbackUrl={`https://ui-avatars.com/api/?name=${encodeURIComponent(nome || "Produto")}&background=random&size=512`}
                    />
                </div>

                {/* Lado Direito: Infos Básicas */}
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

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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

                {/* Campos Dinâmicos baseados na Categoria */}
                {renderCamposDinamicos()}
            </div>

            <div className="flex items-center space-x-2 pt-4">
                <Switch
                    id="ativo"
                    checked={ativo}
                    onCheckedChange={setAtivo}
                />
                <Label htmlFor="ativo" className="font-medium cursor-pointer">Produto Ativo</Label>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 ml-2 italic">
                    (Inativos não aparecem para clientes)
                </p>
            </div>

            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                {initialData ? "Atualizar Produto" : "Cadastrar Produto"}
            </Button>
        </form>
    )
}