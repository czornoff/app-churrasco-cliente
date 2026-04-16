"use server"

import connectDB from "@/lib/mongodb";
import { Category } from "@/models/Schemas";
import { revalidatePath } from "next/cache";

export async function getCategoriesAction(tenantId: string) {
    await connectDB();
    try {
        const categories = await Category.find({ tenantId }).sort({ order: 1, createdAt: 1 }).lean();
        return JSON.parse(JSON.stringify(categories));
    } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        return [];
    }
}

export async function saveCategoryAction(tenantId: string, data: any) {
    await connectDB();
    try {
        const { id, name, type, emoji, order, active } = data;

        if (id) {
            await Category.findByIdAndUpdate(
                id, 
                { $set: { name, type, emoji, order, active } }, 
                { strict: false, new: true }
            );
        } else {
            const newCat = new Category({ tenantId, name, type, emoji, order, active });
            await newCat.save({ strict: false });
        }

        revalidatePath(`/admin/tenants/${tenantId}`);
        return { success: true, message: `Categoria salva com sucesso! (Emoji: ${emoji || 'nenhum'})` };
    } catch (error) {
        console.error("Erro ao salvar categoria:", error);
        return { success: false, message: "Erro ao salvar categoria." };
    }
}

export async function deleteCategoryAction(tenantId: string, id: string) {
    await connectDB();
    try {
        // TODO: Poderíamos verificar se há produtos nesta categoria antes de excluir
        await Category.findByIdAndDelete(id);
        revalidatePath(`/admin/tenants/${tenantId}`);
        return { success: true, message: "Categoria excluída com sucesso!" };
    } catch (error) {
        console.error("Erro ao excluir categoria:", error);
        return { success: false, message: "Erro ao excluir categoria." };
    }
}
