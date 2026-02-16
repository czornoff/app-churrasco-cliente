'use server'

import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcrypt";

export async function registerUserAction(formData: FormData) {
    try {
        const nome = (formData.get("nome") as string)?.trim();
        const email = (formData.get("email") as string)?.toLowerCase()?.trim();
        const password = formData.get("password") as string;

        if (!email) throw new Error("Email é obrigatório");
        if (!nome) throw new Error("Nome é obrigatório");
        if (!password || password.length < 6) throw new Error("Senha deve ter ao menos 6 caracteres");

        await connectDB();

        // 1. Verificar se o e-mail já existe
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            throw new Error("Este e-mail já está cadastrado.");
        }

        // 2. Criptografar a senha
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Criar o usuário (Inicialmente INATIVO conforme regra)
        await User.create({
            nome,
            email,
            password: hashedPassword,
            role: 'TENANT_OWNER',
            status: 'inactive', // Trava de segurança
            avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(nome)}&background=random`
        });

        return { success: true };
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Ocorreu um erro desconhecido";
        return { success: false, error: errorMessage };
    }
}