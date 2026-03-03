'use server'

import connectDB from "@/lib/mongodb";
import { Calculation, Tenant } from "@/models/Schemas";
import { sendEmail } from "@/lib/email";
import { getCalculationEmailTemplate } from "@/lib/email-templates/calculationTemplate";

export async function sendCalculationEmailAction(data: {
    calculationId?: string;
    tenantId: string;
    userEmail: string;
    calculationData?: any; // Para envios diretos sem salvar no banco (visitantes)
}) {
    try {
        await connectDB();

        const tenant = await Tenant.findById(data.tenantId).lean();
        if (!tenant) {
            return { success: false, error: "Tenant não encontrado" };
        }

        let calcData;

        // Se passar ID, busca do banco (Histórico)
        if (data.calculationId) {
            const doc = await Calculation.findById(data.calculationId).lean();
            if (!doc) {
                return { success: false, error: "Cálculo não encontrado" };
            }
            calcData = doc;
        }
        // Se passar dados diretos (Calculadora para visitantes)
        else if (data.calculationData) {
            calcData = data.calculationData;
        } else {
            return { success: false, error: "Dados do cálculo ausentes" };
        }

        const htmlConfig = getCalculationEmailTemplate(
            tenant.name,
            calcData.eventName || 'Churrasco sem nome',
            calcData.totalPeople,
            calcData.items,
            calcData.totalPrice
        );

        // Envia para o usuário (lista de compras)
        if (data.userEmail) {
            await sendEmail({
                to: data.userEmail,
                subject: `Seu Orçamento de Churrasco - ${tenant.name}`,
                html: htmlConfig
            });
        }

        // Envia uma cópia para o lojista (orçamento)
        if (tenant.email && tenant.email !== 'contato@email.com') {
            await sendEmail({
                to: tenant.email,
                subject: `Novo Orçamento Solicitado - App Churrasco`,
                html: htmlConfig
            });
        }

        return { success: true };
    } catch (error: any) {
        console.error("Error sending calculation email:", error);
        return { success: false, error: error.message || "Falha ao enviar e-mail" };
    }
}
