import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            role: string;
            status: string;
            tenantId: string | null; // Tenant atual/primário
            tenantIds: string[]; // Todos os tenants do usuário
        } & DefaultSession["user"]
    }

    interface User {
        id?: string;
        role: string;
        status?: string;
        tenantId?: string | null;
        tenantIds?: string[];
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        id: string;
        role: string;
        status: string;
        tenantId: string | null;
        tenantIds: string[];
    }
}