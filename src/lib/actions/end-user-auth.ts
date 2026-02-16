"use server"

import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcrypt";

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

        await User.create({
            nome,
            email,
            password: hashedPassword,
            role: 'END_USER',
            status: 'active',
            tenantId: tenantId || null,
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=random`
        });

        return { success: "Conta criada com sucesso! Você já pode entrar." };
    } catch (error) {
        console.error("Registration error:", error);
        return { error: "Erro ao criar conta. Tente novamente." };
    }
}
