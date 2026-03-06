'use server'

import connectDB from "@/lib/mongodb";
import { Calculation } from "@/models/Schemas";
import { User } from "@/models/User";
import { revalidatePath } from "next/cache";

export async function saveCalculationAction(data: {
    tenantId: string;
    userId?: string;
    eventName?: string;
    totalPeople: {
        men: number;
        women: number;
        children: number;
    };
    items: any[];
    totalPrice: number;
}) {
    try {
        await connectDB();

        let finalUserId = data.userId;
        // Segurança: Se o ID não for um ObjectId válido (ex: vindo do Google como string numérica)
        if (finalUserId && !/^[0-9a-fA-F]{24}$/.test(finalUserId)) {
            const userRef = await User.findOne({
                $or: [{ googleId: finalUserId }, { _id: (finalUserId.length === 24 ? (finalUserId as any) : undefined) }]
            });
            if (userRef) {
                finalUserId = userRef._id.toString();
            } else {
                finalUserId = undefined;
            }
        }

        const newCalculation = await Calculation.create({
            tenantId: data.tenantId,
            userId: finalUserId,
            eventName: data.eventName || 'Churrasco sem nome',
            totalPeople: data.totalPeople,
            items: data.items,
            totalPrice: data.totalPrice,
        });

        return { success: true, id: newCalculation._id.toString() };
    } catch (error) {
        console.error("Error saving calculation:", error);
        return { success: false, error: "Falha ao salvar o cálculo" };
    }
}

export async function getCalculationsByUserIdAction(userId: string, tenantId?: string) {
    try {
        await connectDB();

        const filter: any = { userId };
        if (tenantId) {
            filter.tenantId = tenantId;
        }

        const calculations = await Calculation.find(filter).sort({ createdAt: -1 }).lean();
        return JSON.parse(JSON.stringify(calculations));
    } catch (error) {
        console.error("Error fetching calculations:", error);
        return [];
    }
}

export async function getCalculationsByTenantIdAction(tenantId: string) {
    try {
        await connectDB();
        const calculations = await Calculation.find({ tenantId }).sort({ createdAt: -1 }).populate('userId').lean();
        return JSON.parse(JSON.stringify(calculations));
    } catch (error) {
        console.error("Error fetching tenant calculations:", error);
        return [];
    }
}

export async function deleteCalculationAction(id: string, path?: string) {
    try {
        await connectDB();
        await Calculation.findByIdAndDelete(id);
        if (path) revalidatePath(path);
        return { success: true };
    } catch (error) {
        console.error("Error deleting calculation:", error);
        return { success: false };
    }
}
