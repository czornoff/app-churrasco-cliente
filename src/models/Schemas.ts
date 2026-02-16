import { Schema, model, models, Document, Types, Model } from 'mongoose';

// 1. TENANT (O Cliente - Ex: Loja do Zé)
export interface ITenantDocument extends Document {
    name: string;
    slug: string;
    nomeApp: string;
    slogan: string;
    logoUrl: string;
    colorPrimary: string;
    email: string;
    whatsApp: string;
    instagram: string;
    versao: string;
    limiteConsulta: number;
    ownerId?: Types.ObjectId;
    active: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const TenantSchema = new Schema<ITenantDocument>({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    nomeApp: { type: String, default: 'Calculadora de Churrasco' },
    slogan: { type: String, default: 'A solução inteligente para organizar seu churrasco sem desperdícios.' },
    logoUrl: {
        type: String,
        default: function (this: any) {
            return `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name || 'Estabelecimento')}&background=random`;
        }
    },
    colorPrimary: { type: String, default: '#e53935' },
    email: { type: String, default: 'contato@email.com' },
    whatsApp: { type: String, default: '11900000000' },
    instagram: { type: String, default: 'https://instagram.com/' },
    versao: { type: String, default: '1.0.1' },
    limiteConsulta: { type: Number, default: 5 },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    active: { type: Boolean, default: true },
}, { timestamps: true });

// 2. PRODUCT (Itens do Cliente)
export interface IProductDocument extends Document {
    tenantId: Types.ObjectId;
    name: string;
    price: number;
    category: 'CARNE' | 'BEBIDA' | 'ACOMPANHAMENTO' | 'SUPRIMENTO';
    createdAt: Date;
    updatedAt: Date;
}

const ProductSchema = new Schema<IProductDocument>({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, enum: ['CARNE', 'BEBIDA', 'ACOMPANHAMENTO', 'SUPRIMENTO'] },
}, { timestamps: true });

// 3. CALCULATION (Cálculos dos usuários finais)
export interface ICalculationDocument extends Document {
    tenantId: Types.ObjectId;
    userId?: Types.ObjectId;
    eventName?: string;
    totalPeople: {
        men: number;
        women: number;
        children: number;
    };
    items: any[];
    totalPrice: number;
    createdAt: Date;
    updatedAt: Date;
}

const CalculationSchema = new Schema<ICalculationDocument>({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    eventName: String,
    totalPeople: {
        men: Number,
        women: Number,
        children: Number
    },
    items: Array,
    totalPrice: Number
}, { timestamps: true });

export const Tenant = (models.Tenant as Model<ITenantDocument>) || model<ITenantDocument>('Tenant', TenantSchema);
export const Product = (models.Product as Model<IProductDocument>) || model<IProductDocument>('Product', ProductSchema);
export const Calculation = (models.Calculation as Model<ICalculationDocument>) || model<ICalculationDocument>('Calculation', CalculationSchema);