import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";

export async function addUserToTenantAction(userId: string, tenantId: string) {
    try {
        await connectDB();
        
        const user = await User.findById(userId);
        if (!user) {
            return { success: false, message: "Usuário não encontrado" };
        }

        // Verifica se o usuário já está associado a este tenant
        if (user.tenantIds?.some(id => id.toString() === tenantId)) {
            return { success: false, message: "Usuário já está associado a este estabelecimento" };
        }

        // Adiciona o tenant aos tenantIds do usuário
        if (!user.tenantIds) {
            user.tenantIds = [];
        }
        user.tenantIds.push(tenantId as any);

        // Define como tenant primário se for o primeiro
        if (!user.tenantId) {
            user.tenantId = tenantId as any;
        }

        await user.save();
        
        return { success: true, message: "Usuário adicionado ao estabelecimento com sucesso" };
    } catch (error) {
        console.error("Erro ao adicionar usuário ao tenant:", error);
        return { success: false, message: "Erro ao adicionar usuário ao estabelecimento" };
    }
}

export async function removeUserFromTenantAction(userId: string, tenantId: string) {
    try {
        await connectDB();
        
        const user = await User.findById(userId);
        if (!user) {
            return { success: false, message: "Usuário não encontrado" };
        }

        // Remove o tenant dos tenantIds
        user.tenantIds = user.tenantIds?.filter(id => id.toString() !== tenantId) || [];

        // Se era o tenant primário, atribui o primeiro da lista (se houver)
        if (user.tenantId?.toString() === tenantId) {
            user.tenantId = user.tenantIds?.[0] || null;
        }

        await user.save();
        
        return { success: true, message: "Usuário removido do estabelecimento com sucesso" };
    } catch (error) {
        console.error("Erro ao remover usuário do tenant:", error);
        return { success: false, message: "Erro ao remover usuário do estabelecimento" };
    }
}

export async function setActiveTenantAction(userId: string, tenantId: string) {
    try {
        await connectDB();
        
        const user = await User.findById(userId);
        if (!user) {
            return { success: false, message: "Usuário não encontrado" };
        }

        // Verifica se o usuário tem acesso a este tenant
        if (!user.tenantIds?.some(id => id.toString() === tenantId)) {
            return { success: false, message: "Usuário não tem acesso a este estabelecimento" };
        }

        // Define como tenant primário
        user.tenantId = tenantId as any;
        await user.save();
        
        return { success: true, message: "Estabelecimento ativo alterado com sucesso" };
    } catch (error) {
        console.error("Erro ao alterar tenant ativo:", error);
        return { success: false, message: "Erro ao alterar estabelecimento ativo" };
    }
}
