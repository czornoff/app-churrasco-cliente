import mongoose, { Schema, model, models, Model, Document } from 'mongoose';

export interface IItem {
    _id: mongoose.Types.ObjectId | string;
    ativo: boolean;
    nome: string;
    descricao?: string;
    imageUrl?: string;
    subcategoria?: string;
    preco: number;
    gramasPorAdulto: number;
    gramasEmbalagem: number;
    mlPorAdulto: number;
    mlEmbalagem: number;
    qtdePorAdulto: number;
    pesoRelativo: number;
    base: number;
    fator: number;
    unidade?: string;
}

const ItemSchema = new Schema<IItem>(
    {
        ativo: { type: Boolean, default: true },
        nome: { type: String, required: true, trim: true },
        descricao: { type: String },
        imageUrl: { type: String },
        subcategoria: { type: String },
        preco: { type: Number, default: 0 },
        gramasPorAdulto: { type: Number, default: 0 },
        gramasEmbalagem: { type: Number, default: 0 },
        mlPorAdulto: { type: Number, default: 0 },
        mlEmbalagem: { type: Number, default: 0 },
        qtdePorAdulto: { type: Number, default: 0 },
        pesoRelativo: { type: Number, default: 0 },
        base: { type: Number, default: 1 },
        fator: { type: Number, default: 1 },
        unidade: { type: String },
    },
    { timestamps: true }
);

export interface ICardapio extends Document {
    tenantId: mongoose.Types.ObjectId;
    configuracoes: {
        gramasCarneAdulto: number;
        gramasOutrosAdulto: number;
        mlBebidaAdulto: number;
    };
    carnes: IItem[];
    bebidas: IItem[];
    acompanhamentos: IItem[];
    adicionais: IItem[];
    utensilios: IItem[];
    sobremesas: IItem[];
    categoriasAtivas: {
        carnes: boolean;
        bebidas: boolean;
        acompanhamentos: boolean;
        adicionais: boolean;
        utensilios: boolean;
        sobremesas: boolean;
    };
    createdAt: Date;
    updatedAt: Date;
}

const CardapioSchema = new Schema<ICardapio>(
    {
        tenantId: {
            type: Schema.Types.ObjectId,
            ref: 'Tenant',
            required: true,
            index: true
        },
        configuracoes: {
            gramasCarneAdulto: { type: Number, default: 400 },
            gramasOutrosAdulto: { type: Number, default: 200 },
            mlBebidaAdulto: { type: Number, default: 1200 }
        },
        carnes: [ItemSchema],
        bebidas: [ItemSchema],
        acompanhamentos: [ItemSchema],
        adicionais: [ItemSchema],
        utensilios: [ItemSchema],
        sobremesas: [ItemSchema],
        categoriasAtivas: {
            carnes: { type: Boolean, default: true },
            bebidas: { type: Boolean, default: true },
            acompanhamentos: { type: Boolean, default: true },
            adicionais: { type: Boolean, default: true },
            utensilios: { type: Boolean, default: true },
            sobremesas: { type: Boolean, default: true }
        }
    },
    { timestamps: true }
);

export const Cardapio = (models.Cardapio as Model<ICardapio>) || model<ICardapio>('Cardapio', CardapioSchema);
