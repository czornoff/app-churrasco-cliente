'use server'

import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
    const session = await getServerSession();
    if (!session?.user?.email) throw new Error("Não autorizado");

    await connectDB();

    const updateData = {
        nome: formData.get("nome") as string,
        whatsApp: formData.get("whatsApp") as string,
        UF: formData.get("UF") as string,
        cidade: formData.get("cidade") as string,
        genero: formData.get("genero") as string,
    };

    await User.findOneAndUpdate(
        { email: session.user.email },
        { $set: updateData }
    );

    revalidatePath("/admin/perfil");
    return { success: true };
}

export async function updateFullUserAction(userId: string, formData: FormData) {
    await connectDB();

    const data = {
        nome: formData.get("nome") as string,
        email: (formData.get("email") as string).toLowerCase(),
        role: formData.get("role") as string,
        status: formData.get("status") as string,
        whatsApp: formData.get("whatsApp") as string,
        UF: formData.get("UF") as string,
        cidade: formData.get("cidade") as string,
        genero: formData.get("genero") as string,
        avatar: formData.get("avatar") as string,
        birthday: formData.get("birthday") ? new Date(formData.get("birthday") as string) : undefined,
        // Se tenantId for vazio, enviamos null
        tenantId: formData.get("tenantId") || null,
    };

    try {
        await User.findByIdAndUpdate(userId, { $set: data });
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido";
        return { success: false, error: errorMessage };
    }
}

export async function deleteUserAction(userId: string) {
    await connectDB();
    
    try {
        await User.findByIdAndDelete(userId);
        revalidatePath("/admin/users");
        return { success: true };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Erro ao excluir usuário";
        return { success: false, error: errorMessage };
    }
}