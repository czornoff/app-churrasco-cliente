"use server"

import connectDB from "@/lib/mongodb";
import { Cardapio, IItem } from "@/models/Cardapio";
import { Tenant } from "@/models/Schemas";
import { Types } from "mongoose";

interface BreadcrumbData {
    tenantName?: string;
    productName?: string;
}

export async function getBreadcrumbData(tenantId?: string, productId?: string): Promise<BreadcrumbData> {
    const result: BreadcrumbData = {};

    try {
        await connectDB();

        if (tenantId) {
            try {
                // Verificar se é um ObjectId válido
                if (Types.ObjectId.isValid(tenantId)) {
                    const tenant = await Tenant.findById(tenantId).select('name').lean();
                    if (tenant) {
                        result.tenantName = tenant.name;
                    } else {
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar tenant:', error);
            }
        }

        if (productId && tenantId) {
            try {
                const cardapio = await Cardapio.findOne({ tenantId }).lean();
                if (cardapio) {
                    // Procurar o produto em todas as categorias
                    const categories = ['carnes', 'bebidas', 'acompanhamentos', 'outros', 'sobremesas', 'suprimentos'];
                    
                    for (const categoria of categories) {
                        const produtos = cardapio[categoria] as IItem[];
                        if (Array.isArray(produtos)) {
                            const produto = produtos.find(p => p._id?.toString() === productId);
                            if (produto) {
                                result.productName = produto.nome;
                                break;
                            }
                        }
                    }
                }
            } catch (error) {
                console.error('Erro ao buscar produto:', error);
            }
        }
    } catch (error) {
        console.error('Erro ao buscar dados do breadcrumb:', error);
    }

    return result;
}
