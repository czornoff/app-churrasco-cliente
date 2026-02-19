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
                        tenantId: user.tenantId ? user.tenantId.toString() : null,
                        tenantIds: user.tenantIds?.map(id => id.toString()) || []
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
            if (account?.provider === "google") {
                if (!dbUser) {
                    await User.create({
                        nome: user.name || "Novo Usuário",
                        email: user.email,
                        googleId: user.id,
                        avatar: user.image || undefined,
                        role: 'END_USER',
                        status: 'active',
                        tenantIds: [],
                        tenantId: null
                    });
                    return true;
                } else {
                    // Propaga os dados do banco para o objeto user
                    user.role = dbUser.role;
                    user.status = dbUser.status;
                    user.tenantId = dbUser.tenantId ? dbUser.tenantId.toString() : null;
                    user.tenantIds = dbUser.tenantIds?.map(id => id.toString()) || [];
                }
                return true;
            }
            // Para Credentials provider
            return true;
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id || '';
                token.role = user.role || '';
                token.status = user.status || '';
                token.tenantId = user.tenantId || null;
                token.tenantIds = user.tenantIds || [];
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id;
                session.user.role = token.role;
                session.user.status = token.status;
                session.user.tenantId = token.tenantId;
                session.user.tenantIds = token.tenantIds;
            }
            return session;
        }
    }
};
