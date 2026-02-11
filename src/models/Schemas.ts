import mongoose, { Schema, model, models } from 'mongoose';

// 1. TENANT (O Cliente - Ex: Buffet do Zé)
const TenantSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },

    // Branding & UI
    nomeApp: { type: String, default: 'Calculadora de Churrasco' },
    slogan: { type: String, default: 'A solução inteligente para organizar seu churrasco sem desperdícios.' },
    logoUrl: { type: String, default: 'https://mandebem.com/logo.png' },
    colorPrimary: { type: String, default: '#e53935' },
    
    // Contato & Redes
    email: { type: String, default: 'contato@email.com' },
    whatsApp: { type: String, default: '11900000000' },
    instagram: { type: String, default: 'https://instagram.com/' },
    
    // Configurações de Negócio
    versao: { type: String, default: '1.0.1' },
    limiteConsulta: { type: Number, default: 5 },
    ownerId: { type: Schema.Types.ObjectId, ref: 'User' },
    active: { type: Boolean, default: true },
}, { timestamps: true });

// 2. PRODUCT (Itens do Cliente)
const ProductSchema = new Schema({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, enum: ['CARNE', 'BEBIDA', 'ACOMPANHAMENTO', 'SUPRIMENTO'] },
}, { timestamps: true });

// 3. CALCULATION (Cálculos dos usuários finais)
const CalculationSchema = new Schema({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    eventName: String,
    totalPeople: {
        men: Number,
        women: Number,
        children: Number
    },
  items: Array, // Lista de itens calculados
  totalPrice: Number
}, { timestamps: true });

export const Tenant = models.Tenant || model('Tenant', TenantSchema);
export const Product = models.Product || model('Product', ProductSchema);
export const Calculation = models.Calculation || model('Calculation', CalculationSchema);