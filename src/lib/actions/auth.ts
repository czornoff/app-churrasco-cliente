'use server'

import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcrypt";

export async function registerUserAction(formData: FormData) {
    try {
        const nome = formData.get("nome") as string;
        const email = formData.get("email") as string;
        const password = formData.get("password") as string;

        if (!email) throw new Error("Email é obrigatório");

        await connectDB();

        // 1. Verificar se o e-mail já existe
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            throw new Error("Este e-mail já está cadastrado.");
        }

        // 2. Criptografar a senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Criar o usuário (Seguindo seu Model)
        await User.create({
            nome,
            email,
            password: hashedPassword,
            role: 'TENANT_OWNER',
            status: 'active',
        });

        return { success: true };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido";
        return { success: false, error: errorMessage };
    }
}