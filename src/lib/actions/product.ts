"use server"

import connectDB from "@/lib/mongodb";
import { Types } from 'mongoose';
import { Cardapio } from "@/models/Cardapio";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

interface ProductItem {
    _id?: Types.ObjectId | string;
    nome: string;
    preco: number;
    imageUrl?: string;
    gramasPorAdulto?: number;
    gramasEmbalagem?: number;
    mlPorAdulto?: number;
    mlEmbalagem?: number;
    qtdePorAdulto?: number;
    tipoSuprimento?: string;
    subCategoriaBebida?: 'alcoolica' | 'nao-alcoolica';
    ativo?: boolean;
}

interface CardapioDocument {
    [key: string]: ProductItem[] | unknown;
    carnes: ProductItem[];
    bebidas: ProductItem[];
    acompanhamentos: ProductItem[];
    outros: ProductItem[];
    sobremesas: ProductItem[];
    suprimentos: ProductItem[];
}

interface ProdutoFormatado {
    _id: string;
    nome: string;
    preco: number;
    categoria: string;
    gramasPorAdulto?: number;
    gramasEmbalagem?: number;
    mlPorAdulto?: number;
    mlEmbalagem?: number;
    qtdePorAdulto?: number;
    tipoSuprimento?: string;
    subCategoriaBebida?: 'alcoolica' | 'nao-alcoolica';
}

export async function saveProductAction(formData: FormData) {
    await connectDB();

    const tenantId = formData.get("tenantId") as string;
    const category = formData.get("category") as string;
    const productId = formData.get("productId") as string;
    const nome = formData.get("nome") as string;

    // Mapeamento rigoroso para os arrays do seu CardapioSchema
    const categoryMap: Record<string, string> = {
        carnes: "carnes",
        bebidas: "bebidas",
        acompanhamentos: "acompanhamentos",
        outros: "outros",
        sobremesas: "sobremesas",
        suprimentos: "suprimentos"
    };

    const targetArray = categoryMap[category];

    if (!targetArray) {
        throw new Error("Categoria inválida ou não selecionada");
    }

    // Montagem do objeto conforme os campos do seu ProductForm
    const rawImageUrl = formData.get("imageUrl") as string || "";

    // Lógica agressiva de fallback
    const imageUrl = (rawImageUrl && !rawImageUrl.includes('mandebem.com') && !rawImageUrl.includes('placeholder'))
        ? rawImageUrl.trim()
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(nome || "Produto")}&background=random&size=512`;

    const productData: ProductItem = {
        nome,
        preco: Number(formData.get("preco")) || 0,
        imageUrl,
        ativo: formData.get("ativo") === "on"
    };

    // Adicionar campos específicos baseado na categoria
    if (category === 'carnes' || category === 'acompanhamentos' || category === 'outros' || category === 'sobremesas') {
        productData.gramasPorAdulto = Number(formData.get("gramasPorAdulto")) || 0;
        productData.gramasEmbalagem = Number(formData.get("gramasEmbalagem")) || 0;
    } else if (category === 'bebidas') {
        productData.mlPorAdulto = Number(formData.get("mlPorAdulto")) || 0;
        productData.mlEmbalagem = Number(formData.get("mlEmbalagem")) || 0;
        const subCategoriaBebida = formData.get("subCategoriaBebida") as string;
        
        if (subCategoriaBebida === 'alcoolica' || subCategoriaBebida === 'nao-alcoolica') {
            productData.subCategoriaBebida = subCategoriaBebida;
        } else {
            productData.subCategoriaBebida = 'nao-alcoolica';
        }
    } else if (category === 'suprimentos') {
        productData.qtdePorAdulto = Number(formData.get("qtdePorAdulto")) || 0;
        const tipoSuprimento = formData.get("tipoSuprimento") as string;
        if (tipoSuprimento === 'CARVAO' || tipoSuprimento === 'ACENDEDOR') {
            productData.tipoSuprimento = tipoSuprimento;
        }
    }

    try {
        if (productId) {
            // Buscar o cardápio para validar a categoria atual
            const currentCardapio = await Cardapio.findOne({ tenantId }) as unknown as CardapioDocument | null;

            if (!currentCardapio) {
                throw new Error("Cardápio não encontrado");
            }

            // Encontrar em qual categoria o produto existe atualmente
            const categories = ["carnes", "bebidas", "acompanhamentos", "outros", "sobremesas", "suprimentos"];
            const oldCategory = categories.find(cat =>
                (currentCardapio[cat] as ProductItem[]).some((p) => p._id?.toString() === productId)
            );

            if (oldCategory && oldCategory !== targetArray) {
                // --- TROCA DE CATEGORIA ---
                const oldItem = (currentCardapio[oldCategory] as ProductItem[]).find((p) => p._id?.toString() === productId);

                // Remove do array antigo
                await Cardapio.updateOne(
                    { tenantId },
                    { $pull: { [oldCategory]: { _id: new Types.ObjectId(productId) } } }
                );

                // Adiciona no array novo
                await Cardapio.updateOne(
                    { tenantId },
                    { $push: { [targetArray]: { ...oldItem, ...productData, _id: new Types.ObjectId(productId) } } }
                );
            } else {
                // --- MESMA CATEGORIA ---
                const updateFields: Record<string, unknown> = {};
                Object.entries(productData).forEach(([key, value]) => {
                    updateFields[`${targetArray}.$.${key}`] = value;
                });

                const result = await Cardapio.findOneAndUpdate(
                    { tenantId, [`${targetArray}._id`]: new Types.ObjectId(productId) },
                    { $set: updateFields },
                    { new: true }
                );
                
                if (result) {
                    const produtoAtualizado = result[targetArray]?.find((p: ProductItem) => p._id?.toString() === productId);
                    if (produtoAtualizado) {
                    }
                } 
            }
        } else {
            // --- LÓGICA DE CRIAÇÃO ---
            await Cardapio.findOneAndUpdate(
                { tenantId },
                { $push: { [targetArray]: productData } },
                { upsert: true }
            );
        }
    } catch (error) {
        console.error("Erro ao salvar/editar:", error);
        throw new Error("Falha na operação");
    }

    revalidatePath(`/admin/tenants/${tenantId}`);
    redirect(`/admin/tenants/${tenantId}?tab=cardapio`);
}

export async function deleteProductAction(tenantId: string, category: string, productId: string) {
    await connectDB();

    try {
        await Cardapio.findOneAndUpdate(
            { tenantId },
            { $pull: { [category]: { _id: new Types.ObjectId(productId) } } }
        );

        revalidatePath(`/admin/tenants/${tenantId}`);
        return { success: true };
    } catch (error) {
        console.error("Erro ao deletar:", error);
        return { success: false };
    }
}

export async function getCardapioByTenant(tenantId: string) {
    await connectDB();

    try {
        const cardapio = await Cardapio.findOne({ tenantId }).lean() as unknown as CardapioDocument | null;

        if (!cardapio) {
            return { success: false, produtos: [] };
        }

        // Juntar todos os produtos de todas as categorias
        const todasAsCategories = ['carnes', 'bebidas', 'acompanhamentos', 'outros', 'sobremesas', 'suprimentos'];
        const todosProdutos: ProdutoFormatado[] = [];

        todasAsCategories.forEach(categoria => {
            if (cardapio[categoria] && Array.isArray(cardapio[categoria])) {
                (cardapio[categoria] as ProductItem[]).forEach((produto) => {
                    if (produto.ativo !== false) {
                        const produtoFormatado: ProdutoFormatado = {
                            _id: produto._id?.toString() || '',
                            nome: produto.nome,
                            preco: produto.preco || 0,
                            categoria: categoria,
                        };

                        // Adicionar campos específicos da categoria
                        if (categoria === 'carnes' || categoria === 'acompanhamentos' || categoria === 'outros' || categoria === 'sobremesas') {
                            produtoFormatado.gramasPorAdulto = produto.gramasPorAdulto || 0;
                            produtoFormatado.gramasEmbalagem = produto.gramasEmbalagem || 0;
                        } else if (categoria === 'bebidas') {
                            produtoFormatado.mlPorAdulto = produto.mlPorAdulto || 0;
                            produtoFormatado.mlEmbalagem = produto.mlEmbalagem || 0;
                            if (produto.subCategoriaBebida) {
                                produtoFormatado.subCategoriaBebida = produto.subCategoriaBebida;
                            }
                        } else if (categoria === 'suprimentos') {
                            produtoFormatado.qtdePorAdulto = produto.qtdePorAdulto || 0;
                            if (produto.tipoSuprimento) {
                                produtoFormatado.tipoSuprimento = produto.tipoSuprimento;
                            }
                        }

                        todosProdutos.push(produtoFormatado);
                    }
                });
            }
        });

        return { success: true, produtos: todosProdutos };
    } catch (error) {
        console.error("Erro ao buscar cardápio:", error);
        return { success: false, produtos: [] };
    }
}