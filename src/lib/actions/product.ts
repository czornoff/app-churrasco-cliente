"use server"

import connectDB from "@/lib/mongodb";
import { Types } from 'mongoose';
import { Cardapio } from "@/models/Cardapio";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function saveProductAction(formData: FormData) {
    await connectDB();

    const tenantId = formData.get("tenantId") as string;
    const category = formData.get("category") as string;
    const productId = formData.get("productId") as string; // Adicione este campo no seu form de produto
    
    // Mapeamento rigoroso para os arrays do seu CardapioSchema
    const categoryMap: Record<string, string> = {
        carnes: "carnes",
        bebidas: "bebidas",
        acompanhamentos: "acompanhamentos",
        sobremesas: "sobremesas",
        adicionais: "adicionais",
        utensilios: "utensilios"
    };

    const targetArray = categoryMap[category];

    if (!targetArray) {
        throw new Error("Categoria inválida ou não selecionada");
    }

    // Montagem do objeto conforme os campos do seu ProductForm
    const productData = {
        nome: formData.get("nome") as string,
        preco: Number(formData.get("preco")) || 0,
        imageUrl: formData.get("imageUrl") as string || "",
        gramasPorAdulto: Number(formData.get("gramasPorAdulto")) || 0,
        gramasEmbalagem: Number(formData.get("gramasEmbalagem")) || 0,
        mlPorAdulto: Number(formData.get("mlPorAdulto")) || 0,
        mlEmbalagem: Number(formData.get("mlEmbalagem")) || 0,
        qtdePorAdulto: Number(formData.get("qtdePorAdulto")) || 0,
        ativo: formData.get("ativo") === "on"
    };

    try {
        if (productId) {
            // 1. Precisamos descobrir onde o produto estava antes (categoria antiga)
            // O banco já sabe disso, mas o jeito mais fácil é comparar o que veio no form
            // com o que você enviou via query string ou campo hidden.
            
            // Vamos buscar o cardápio para validar a categoria atual
            const currentCardapio = await Cardapio.findOne({ tenantId });
            
            // Encontrar em qual categoria o produto existe atualmente
            const categories = ["carnes", "bebidas", "acompanhamentos", "sobremesas", "adicionais"];
            const oldCategory = categories.find(cat => 
                currentCardapio[cat].some((p: any) => p._id.toString() === productId)
            );

            if (oldCategory && oldCategory !== targetArray) {
                // --- TROCA DE CATEGORIA ---
                // 1. Pega os dados do item antigo
                const oldItem = currentCardapio[oldCategory].find((p: any) => p._id.toString() === productId);
                
                // 2. Remove do array antigo
                await Cardapio.updateOne(
                    { tenantId },
                    { $pull: { [oldCategory]: { _id: new Types.ObjectId(productId) } } }
                );

                // 3. Adiciona no array novo (com os dados atualizados)
                await Cardapio.updateOne(
                    { tenantId },
                    { $push: { [targetArray]: { ...oldItem, ...productData, _id: new Types.ObjectId(productId) } } }
                );
            } else {
                // --- MESMA CATEGORIA (Ajuste que já fizemos) ---
                const updateFields: any = {};
                Object.entries(productData).forEach(([key, value]) => {
                    updateFields[`${targetArray}.$.${key}`] = value;
                });

                await Cardapio.findOneAndUpdate(
                    { tenantId, [`${targetArray}._id`]: new Types.ObjectId(productId) },
                    { $set: updateFields }
                );
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
        // Em vez de retornar objeto, podemos lançar um erro ou tratar silenciosamente
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

        // Caminho absoluto é mais garantido para atualizar a tela na hora
        revalidatePath(`/admin/tenants/${tenantId}`); 
        return { success: true };
    } catch (error) {
        console.error("Erro ao deletar:", error);
        return { success: false };
    }
}