import { z } from "zod";

export const tenantCreateSchema = z.object({
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    slug: z.string().min(5, "O slug deve ter pelo menos 5 caracteres").regex(/^[a-z0-9-]+$/, "Slug inválido (apenas letras minúsculas, números e hífens)"),
});

export const tenantUpdateSchema = z.object({
    id: z.string().min(1, "ID é obrigatório"),
    name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
    nomeApp: z.string().min(3, "O nome do app deve ter pelo menos 3 caracteres").optional(),
    slogan: z.string().optional(),
    email: z.string().email("E-mail inválido").optional().or(z.literal("")),
    whatsApp: z.string()
        .min(10, "WhatsApp incompleto")
        .max(15, "WhatsApp muito longo")
        .optional().or(z.literal("")),
    instagram: z.string()
        .url("URL do Instagram inválida")
        .optional().or(z.literal("")),
    address: z.string().optional(),
    logoUrl: z.string().url("URL da logo inválida").optional().or(z.literal("")),
    colorPrimary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Cor inválida (formato #RRGGBB)").optional(),
    versao: z.string().optional(),
    active: z.boolean().optional(),
    limiteConsulta: z.number().min(1).optional(),
});