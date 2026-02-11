"use server"

import connectDB from "@/lib/mongodb";
import { Tenant } from "@/models/Schemas"; // Seu model de Tenant

export async function getTenantBySlug(slug: string) {
    try {
        await connectDB();

        // Buscamos o tenant pelo slug
        // .lean() é ótimo aqui pois só queremos ler os dados (melhora a performance)
        const tenant = await Tenant.findOne({ slug }).lean();

        if (!tenant) return null;

        // Convertemos o _id para string para evitar problemas de serialização entre Server e Client components
        return {
        ...tenant,
        _id: tenant._id.toString(),
        };
    } catch (error) {
        console.error("Erro ao buscar tenant:", error);
        return null;
    }
}