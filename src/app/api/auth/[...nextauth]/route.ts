import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import bcrypt from "bcrypt";
import { IUser} from "@/interfaces/user";

const handler = NextAuth({
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
                
                // Busca o usuário e força a vinda da senha (que está como select: false no Model)
                const user = await User.findOne({ email: credentials?.email }).select("+password") as unknown as IUser;

                if (user && await bcrypt.compare(credentials!.password, user.password)) {
                    return { 
                        id: user._id.toString(), 
                        name: user.nome, 
                        email: user.email, 
                        image: user.avatar,
                        role: user.role, // Certifique-se que 'role' existe no seu 'IUser'
                        tenantId: user.tenantId ? user.tenantId.toString() : null
                    };
                }
                return null;
            }
        })
    ],
    callbacks: {
        async signIn({ user, account }) {
        if (account?.provider === "google") {
            await connectDB();

            try {
            const userExists = await User.findOne({ email: user.email }) as unknown as IUser;

            if (!userExists) {
                await User.create({
                    nome: user.name || "Usuário Master",
                    email: user.email,
                    googleId: user.id,
                    avatar: user.image || undefined,
                    role: 'SUPERADMIN', // Define o primeiro como admin do sistema
                    status: 'active',
                    tenantId: null 
                });
            } else {
                // Atualiza dados básicos se o usuário já existir
                userExists.googleId = user.id;
                if (user.image) userExists.avatar = user.image;
                await userExists.save();
            }
            return true;
            } catch (error) {
            console.error("Erro ao sincronizar usuário:", error);
            return false; 
            }
        }
        return true;
        },

        async session({ session, token }) {
            await connectDB();
            const dbUser = await User.findOne({ email: session.user?.email }).lean() as unknown as IUser;
            
            if (dbUser && session.user) {
                // Injeta os dados do banco na sessão do Next.js
                (session.user).id = dbUser._id.toString();
                (session.user).role = dbUser.role;
                (session.user).tenantId = dbUser.tenantId?.toString() || null;
            }
            return session;
        }
    }
});

export { handler as GET, handler as POST };