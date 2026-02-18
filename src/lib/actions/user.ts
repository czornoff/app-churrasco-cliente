'use server'

import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";

export async function updateProfileAction(formData: FormData) {
    const session = await getServerSession();
    if (!session?.user?.email) throw new Error("Não autorizado");

    await connectDB();

    const nome = formData.get("nome") as string;
    const updateData = {
        nome,
        whatsApp: formData.get("whatsApp") as string,
        UF: formData.get("UF") as string,
        cidade: formData.get("cidade") as string,
        genero: formData.get("genero") as string,
    };

    const avatar = (() => {
        const currentAvatar = formData.get("avatar")?.toString().trim() || "";
        const isPlaceholder = !currentAvatar || currentAvatar.includes('ui-avatars.com') || currentAvatar.includes('placeholder') || currentAvatar.includes('mandebem.com');
        return isPlaceholder
            ? `https://ui-avatars.com/api/?name=${encodeURIComponent(nome || 'User')}&background=random`
            : currentAvatar;
    })();

    await User.findOneAndUpdate(
        { email: session.user.email },
        { $set: { ...updateData, avatar } }
    );

    revalidatePath("/admin/perfil");
    return { success: true };
}

export async function updateFullUserAction(userId: string, formData: FormData) {
    await connectDB();

    const nome = formData.get("nome") as string;
    const avatar = (() => {
        const currentAvatar = formData.get("avatar")?.toString().trim() || "";
        const isPlaceholder = !currentAvatar || currentAvatar.includes('ui-avatars.com') || currentAvatar.includes('placeholder') || currentAvatar.includes('mandebem.com');
        return isPlaceholder
            ? `https://ui-avatars.com/api/?name=${encodeURIComponent(nome || "User")}&background=random`
            : currentAvatar;
    })();

    // Processar tenantIds
    const tenantIdsStr = formData.get("tenantIds") as string;
    let tenantIds: any[] = [];
    
    if (tenantIdsStr) {
        try {
            const parsed = JSON.parse(tenantIdsStr);
            tenantIds = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            tenantIds = [];
        }
    }

    // Se tenantIds foi fornecido, usar isso (múltiplos tenants)
    // Se não, manter apenas tenantId (compatibilidade com código antigo)
    const updateData: any = {
        nome,
        avatar,
        email: (formData.get("email") as string).toLowerCase(),
        role: formData.get("role") as string,
        status: formData.get("status") as string,
        whatsApp: formData.get("whatsApp") as string,
        UF: formData.get("UF") as string,
        cidade: formData.get("cidade") as string,
        genero: formData.get("genero") as string,
        birthday: formData.get("birthday") ? new Date(formData.get("birthday") as string) : undefined,
    };

    // Sempre atualizar tenantIds com o novo array
    if (tenantIds.length > 0) {
        updateData.tenantIds = tenantIds;
        // Definir o primeiro tenant como tenantId primário se houver
        updateData.tenantId = tenantIds[0];
    } else {
        updateData.tenantIds = [];
        updateData.tenantId = null;
    }

    try {
        await User.findByIdAndUpdate(userId, { $set: updateData });
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