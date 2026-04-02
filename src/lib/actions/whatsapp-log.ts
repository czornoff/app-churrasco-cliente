'use server'

import connectDB from "@/lib/mongodb";
import { WhatsAppLog } from "@/models/WhatsAppLog";

export async function logWhatsAppShareAction(data: {
    tenantId: string;
    userId?: string;
    type: 'share_list' | 'share_store';
}) {
    try {
        await connectDB();

        await WhatsAppLog.create({
            tenantId: data.tenantId,
            userId: data.userId && /^[0-9a-fA-F]{24}$/.test(data.userId) ? data.userId : undefined,
            type: data.type,
        });

        return { success: true };
    } catch (error) {
        console.error("Error logging WhatsApp share:", error);
        return { success: false };
    }
}
