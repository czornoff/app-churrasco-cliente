import { z } from "zod";

export const tenantUpdateSchema = z.object({
  id: z.string().min(1, "ID é obrigatório"),
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  whatsApp: z.string()
    .min(14, "WhatsApp incompleto")
    .max(15, "WhatsApp muito longo")
    .regex(/\(\d{2}\)\s\d{5}-\d{4}/, "Formato aceito: (00) 00000-0000"),
  instagram: z.string()
    .startsWith("https://instagram.com/", "O Instagram deve começar com https://instagram.com/")
    .min(24, "Digite um usuário válido"),
});