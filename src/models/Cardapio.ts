import mongoose, { Schema, model, models, Model, Document } from 'mongoose';

export interface IItem {
    _id: mongoose.Types.ObjectId | string;
    ativo: boolean;
    nome: string;
    descricao?: string;
    imageUrl?: string;
    subcategoria?: string;
    subCategoriaBebida?: 'alcoolica' | 'nao-alcoolica';
    preco: number;
    gramasPorAdulto?: number;
    gramasEmbalagem?: number;
    mlPorAdulto?: number;
    mlEmbalagem?: number;
    qtdePorAdulto?: number;
    pesoRelativo?: number;
    base?: number;
    fator?: number;
    unidade?: string;
    tipoSuprimento?: string; // Exemplo: 'CARVAO', 'ACENDEDOR', 'COPO', 'VELA', 'GUARDANAPO', 'TALHERES', 'PRATO', etc.
}

const ItemSchema = new Schema<IItem>(
    {
        ativo: { type: Boolean, default: true },
        nome: { type: String, required: true, trim: true },
        descricao: { type: String },
        imageUrl: { type: String },
        subcategoria: { type: String },
        subCategoriaBebida: { type: String, enum: ['alcoolica', 'nao-alcoolica'], default: 'nao-alcoolica' },
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
        tipoSuprimento: { type: String },
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
    outros: IItem[];
    sobremesas: IItem[];
    suprimentos: IItem[];
    categoriasAtivas: {
        carnes: boolean;
        bebidas: boolean;
        acompanhamentos: boolean;
        outros: boolean;
        sobremesas: boolean;
        suprimentos: boolean;
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
        outros: [ItemSchema],
        sobremesas: [ItemSchema],
        suprimentos: [ItemSchema],
        categoriasAtivas: {
            carnes: { type: Boolean, default: true },
            bebidas: { type: Boolean, default: true },
            acompanhamentos: { type: Boolean, default: true },
            outros: { type: Boolean, default: true },
            sobremesas: { type: Boolean, default: true },
            suprimentos: { type: Boolean, default: true }
        }
    },
    { timestamps: true }
);

export const Cardapio = (models.Cardapio as Model<ICardapio>) || model<ICardapio>('Cardapio', CardapioSchema);
