import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcrypt";
import { IUser } from "@/interfaces/user";

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                await connectDB();
                const user = await User.findOne({ email: credentials?.email }).select("+password") as unknown as IUser;

                if (user && user.password && await bcrypt.compare(credentials!.password, user.password)) {
                    return {
                        id: user._id.toString(),
                        name: user.nome,
                        email: user.email,
                        image: user.avatar,
                        role: user.role,
                        status: user.status,
                        tenantId: user.tenantId ? user.tenantId.toString() : null
                    };
                }
                return null;
            }
        })
    ],
    pages: {
        signIn: '/login',
    },
    callbacks: {
        async signIn({ user, account }) {
            await connectDB();
            const dbUser = await User.findOne({ email: user.email }) as unknown as IUser;

            // Se for Google e não existir, cria como END_USER (Ativo)
            // Se for login de admin, ele deve ser criado via outra rota ou ter o status alterado manualmente
            if (account?.provider === "google") {
                if (!dbUser) {
                    await User.create({
                        nome: user.name || "Novo Usuário",
                        email: user.email,
                        googleId: user.id,
                        avatar: user.image || undefined,
                        role: 'END_USER',
                        status: 'active',
                        tenantId: null // O tenantId pode ser associado depois ou via cookie se disponível
                    });
                    return true;
                }
            }

            // Se for um TENANT_OWNER inativo, bloqueia
            if (dbUser && dbUser.role === 'TENANT_OWNER' && dbUser.status === 'inactive') {
                throw new Error("InactiveAccount");
            }

            // End users e outros ativos passam direto
            return true;
        },

        async session({ session, token }) {
            await connectDB();
            const dbUser = await User.findOne({ email: session.user?.email }).lean() as unknown as IUser;

            if (dbUser && session.user) {
                (session.user).id = dbUser._id.toString();
                (session.user).role = dbUser.role;
                (session.user).status = dbUser.status;
                (session.user).tenantId = dbUser.tenantId?.toString() || null;
            }
            return session;
        }
    }
};
