'use server'

import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { IUser } from "@/models/User";

interface UpdateUserData {
    email?: string;
    nome?: string;
    avatar?: string;
    role?: 'SUPERADMIN' | 'TENANT_OWNER' | 'END_USER';
    status?: 'active' | 'inactive' | 'banned';
    whatsApp?: string;
    UF?: string;
    cidade?: string;
    genero?: string;
    birthday?: Date;
    tenantIds?: any[];
    tenantId?: any;
}

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
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'TENANT_OWNER')) {
        return { success: false, error: "Não autorizado" };
    }

    await connectDB();

    const targetUser = await User.findById(userId);
    if (!targetUser) return { success: false, error: "Usuário não encontrado" };

    const isSelf = session.user.id === userId;
    const currentRole = session.user.role;

    // SEGURANÇA: Não permitir que não-superadmins editem superadmins
    if (targetUser.role === 'SUPERADMIN' && currentRole !== 'SUPERADMIN') {
        return { success: false, error: "Você não tem permissão para editar um SuperAdmin" };
    }

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
    let tenantIds: string[] = [];

    if (tenantIdsStr) {
        try {
            const parsed = JSON.parse(tenantIdsStr);
            tenantIds = Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            tenantIds = [];
        }
    }

    const requestedRole = formData.get("role") as IUser['role'];
    const requestedStatus = formData.get("status") as IUser['status'];

    const updateData: UpdateUserData = {
        nome,
        avatar,
        email: (formData.get("email") as string).toLowerCase(),
        whatsApp: formData.get("whatsApp") as string,
        UF: formData.get("UF") as string,
        cidade: formData.get("cidade") as string,
        genero: (formData.get("genero") as string) as IUser['genero'],
        birthday: formData.get("birthday") ? new Date(formData.get("birthday") as string) : undefined,
    };

    // SEGURANÇA BACKEND: Proteger Role e Status
    if (!isSelf) {
        // Se não for o próprio usuário, permitimos mudar Role e Status respeitando a hierarquia
        if (currentRole === 'TENANT_OWNER') {
            // Tenant Owner não pode tornar ninguém SUPERADMIN nem mudar o status para algo que ele não deve?
            // Na verdade a regra é: Tenant Owner pode alterar entre tenant_owner e end_user
            if (requestedRole === 'SUPERADMIN') {
                updateData.role = targetUser.role; // Mantém o cargo atual se tentar burlar
            } else {
                updateData.role = requestedRole;
            }
        } else if (currentRole === 'SUPERADMIN') {
            updateData.role = requestedRole;
        }
        updateData.status = requestedStatus;
    } else {
        // Se for o próprio usuário, IGNORA role e status informados no form
        updateData.role = targetUser.role;
        updateData.status = targetUser.status;
    }

    // Sempre atualizar tenantIds com o novo array
    if (tenantIds.length > 0) {
        updateData.tenantIds = tenantIds;
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

export async function toggleUserStatusAction(userId: string, currentStatus: string) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user.role !== 'SUPERADMIN' && session.user.role !== 'TENANT_OWNER')) {
        return { success: false, error: "Não autorizado" };
    }

    if (session.user.id === userId) {
        return { success: false, error: "Você não pode alterar seu próprio status" };
    }

    try {
        await connectDB();
        const newStatus = currentStatus === 'active' ? 'banned' : 'active';
        await User.findByIdAndUpdate(userId, { status: newStatus });
        revalidatePath('/admin/users');
        return { success: true, newStatus };
    } catch (error) {
        console.error("Error toggling user status:", error);
        return { success: false, error: "Falha ao alterar status do usuário" };
    }
}
