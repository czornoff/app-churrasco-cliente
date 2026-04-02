'use server'

import connectDB from "@/lib/mongodb";
import { User } from "@/models/User";
import { Calculation } from "@/models/Schemas";
import { WhatsAppLog } from "@/models/WhatsAppLog";
import { Cardapio } from "@/models/Cardapio";

export interface PeriodStats {
    lastDay: number;
    lastWeek: number;
    lastMonth: number;
    total: number;
}

export interface DashboardStats {
    users: PeriodStats;
    calculations: PeriodStats;
    whatsappSent: PeriodStats;
    products: PeriodStats;
}

function getDateThresholds() {
    const now = new Date();
    return {
        lastDay: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        lastWeek: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        lastMonth: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
    };
}

async function countByPeriod(
    model: any,
    baseFilter: Record<string, any>,
    dateField: string = 'createdAt'
): Promise<PeriodStats> {
    const { lastDay, lastWeek, lastMonth } = getDateThresholds();

    const [total, monthCount, weekCount, dayCount] = await Promise.all([
        model.countDocuments(baseFilter),
        model.countDocuments({ ...baseFilter, [dateField]: { $gte: lastMonth } }),
        model.countDocuments({ ...baseFilter, [dateField]: { $gte: lastWeek } }),
        model.countDocuments({ ...baseFilter, [dateField]: { $gte: lastDay } }),
    ]);

    return { lastDay: dayCount, lastWeek: weekCount, lastMonth: monthCount, total };
}

async function countProductsByPeriod(tenantIds?: string[]): Promise<PeriodStats> {
    const { lastDay, lastWeek, lastMonth } = getDateThresholds();

    const baseMatch: any = {};
    if (tenantIds && tenantIds.length > 0) {
        const mongoose = await import('mongoose');
        baseMatch.tenantId = { $in: tenantIds.map(id => new mongoose.Types.ObjectId(id)) };
    }

    // Aggregate to count total items across all category arrays in Cardapio
    const pipeline = (extraMatch: Record<string, any> = {}) => [
        { $match: { ...baseMatch, ...extraMatch } },
        {
            $project: {
                totalItems: {
                    $add: [
                        { $size: { $ifNull: ["$carnes", []] } },
                        { $size: { $ifNull: ["$bebidas", []] } },
                        { $size: { $ifNull: ["$acompanhamentos", []] } },
                        { $size: { $ifNull: ["$outros", []] } },
                        { $size: { $ifNull: ["$sobremesas", []] } },
                        { $size: { $ifNull: ["$suprimentos", []] } },
                    ]
                }
            }
        },
        { $group: { _id: null, count: { $sum: "$totalItems" } } }
    ];

    const getCount = async (extraMatch: Record<string, any> = {}): Promise<number> => {
        const result = await Cardapio.aggregate(pipeline(extraMatch));
        return result[0]?.count || 0;
    };

    const [total, monthCount, weekCount, dayCount] = await Promise.all([
        getCount(),
        getCount({ updatedAt: { $gte: lastMonth } }),
        getCount({ updatedAt: { $gte: lastWeek } }),
        getCount({ updatedAt: { $gte: lastDay } }),
    ]);

    return { lastDay: dayCount, lastWeek: weekCount, lastMonth: monthCount, total };
}

export async function getDashboardStatsAction(tenantIds?: string[]): Promise<DashboardStats> {
    await connectDB();

    // Build filters - if tenantIds provided, filter by them
    const hasTenantFilter = tenantIds && tenantIds.length > 0;

    // Users: for TENANT_OWNER, count users that have one of their tenantIds
    const userFilter: any = {};
    if (hasTenantFilter) {
        userFilter.tenantIds = { $in: tenantIds };
    }

    // Calculations: filter by tenantId
    const calcFilter: any = {};
    if (hasTenantFilter) {
        calcFilter.tenantId = { $in: tenantIds };
    }

    // WhatsApp logs: filter by tenantId
    const whatsappFilter: any = {};
    if (hasTenantFilter) {
        whatsappFilter.tenantId = { $in: tenantIds };
    }

    const [users, calculations, whatsappSent, products] = await Promise.all([
        countByPeriod(User, userFilter),
        countByPeriod(Calculation, calcFilter),
        countByPeriod(WhatsAppLog, whatsappFilter),
        countProductsByPeriod(hasTenantFilter ? tenantIds : undefined),
    ]);

    return { users, calculations, whatsappSent, products };
}
