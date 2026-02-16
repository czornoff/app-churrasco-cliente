import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            status: string;
            tenantId: string | null;
        } & DefaultSession["user"]
    }

    // Isso resolve o erro da imagem 3 (authorize)
    interface User {
        id?: string;
        role: string;
        status?: string;
        tenantId?: string | null;
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        status: string;
        tenantId: string | null;
    }
}