"use server"

import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export async function registerEndUserAction(formData: FormData) {
    await connectDB();

    const nome = formData.get("nome") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const tenantId = formData.get("tenantId") as string;

    if (!nome || !email || !password) {
        return { error: "Todos os campos são obrigatórios." };
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return { error: "Este e-mail já está sendo utilizado." };
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const tenantObjectId = tenantId ? new mongoose.Types.ObjectId(tenantId) : null;

        await User.create({
            nome,
            email,
            password: hashedPassword,
            role: 'END_USER',
            status: 'active',
            tenantId: tenantObjectId,
            tenantIds: tenantObjectId ? [tenantObjectId] : [],
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=random`
        });

        return { success: "Conta criada com sucesso! Você já pode entrar." };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: "Erro ao criar conta. Tente novamente." };
    }
}

/**
 * Vincula um tenant ao usuário logado, se ainda não estiver vinculado.
 * Chamado após login bem-sucedido pela página do estabelecimento.
 */
export async function addTenantToUserAction(userEmail: string, tenantId: string) {
    if (!userEmail || !tenantId) return;
    await connectDB();

    try {
        const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
        await User.findOneAndUpdate(
            { email: userEmail },
            {
                $addToSet: { tenantIds: tenantObjectId },
                $set: { tenantId: tenantObjectId }
            }
        );
    } catch (error) {
        console.error("addTenantToUser error:", error);
    }
}
