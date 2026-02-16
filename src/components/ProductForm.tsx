'use client'

import { useState } from "react"
import { CloudinaryUpload } from "@/components/CldUploadWidget"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { saveProductAction } from "@/lib/actions/product";

import { Switch } from "@/components/ui/switch"

interface ProductFormData {
    _id?: string;
    nome: string;
    category: "carnes" | "bebidas" | "acompanhamentos" | "sobremesas" | "adicionais" | "utensilios";
    preco: number;
    imageUrl?: string;
    gramasPorAdulto?: number;
    gramasEmbalagem?: number;
    mlPorAdulto?: number;
    mlEmbalagem?: number;
    qtdePorAdulto?: number;
    subcategoria?: string;
    ativo: boolean;
}

interface ProductFormProps {
    tenantId: string;
    initialData?: ProductFormData;
}

export function ProductForm({ tenantId, initialData }: ProductFormProps) {
    const [category, setCategory] = useState(initialData?.category || "carnes")
    const [nome, setNome] = useState(initialData?.nome || "");
    // Default true para novos produtos, ou o valor existente para edição
    const [ativo, setAtivo] = useState(initialData?.ativo !== undefined ? initialData.ativo : true);

    return (
        <form
            action={saveProductAction}
            className="space-y-6 bg-white dark:bg-zinc-800 p-6 rounded-lg shadow-sm border"
        >
            {initialData?._id && <input type="hidden" name="productId" value={initialData._id} />}
            <input type="hidden" name="tenantId" value={tenantId} />
            {/* Input hidden controlado pelo Switch. Se "on", o backend entende como true. Se "off" ou omitido, falso. */}
            <input type="hidden" name="ativo" value={ativo ? "on" : "off"} />

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
                        <Label>Categoria</Label>
                        <Select
                            name="category"
                            defaultValue={category}
                            onValueChange={(v: ProductFormData["category"]) => setCategory(v)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="carnes">Carnes</SelectItem>
                                <SelectItem value="bebidas">Bebidas</SelectItem>
                                <SelectItem value="acompanhamentos">Acompanhamentos</SelectItem>
                                <SelectItem value="sobremesas">Sobremesas</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                    <Label>Preço (R$)</Label>
                    <Input name="preco" type="number" step="0.01" defaultValue={initialData?.preco} />
                </div>

                {/* Campos Dinâmicos baseados na Categoria */}
                {category === 'carnes' || category === 'acompanhamentos' ? (
                    <>
                        <div className="space-y-2">
                            <Label>Gramas por Adulto</Label>
                            <Input name="gramasPorAdulto" type="number" defaultValue={initialData?.gramasPorAdulto} />
                        </div>
                        <div className="space-y-2">
                            <Label>Gramas por Embalagem</Label>
                            <Input name="gramasEmbalagem" type="number" defaultValue={initialData?.gramasEmbalagem} />
                        </div>
                    </>
                ) : category === 'bebidas' ? (
                    <>
                        <div className="space-y-2">
                            <Label>ML por Adulto</Label>
                            <Input name="mlPorAdulto" type="number" defaultValue={initialData?.mlPorAdulto} />
                        </div>
                        <div className="space-y-2">
                            <Label>ML Embalagem</Label>
                            <Input name="mlEmbalagem" type="number" defaultValue={initialData?.mlEmbalagem} />
                        </div>
                    </>
                ) : null}
            </div>

            <div className="flex items-center space-x-2 pt-4">
                <Switch
                    id="ativo"
                    checked={ativo}
                    onCheckedChange={setAtivo}
                />
                <Label htmlFor="ativo" className="font-medium cursor-pointer">Produto Ativo</Label>
                <p className="text-xs text-slate-400 dark:text-zinc-500 ml-2 italic">
                    (Inativos não aparecem para clientes)
                </p>
            </div>

            <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                {initialData ? "Atualizar Produto" : "Cadastrar Produto"}
            </Button>
        </form>
    )
}