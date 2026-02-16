import mongoose, { Schema, model, models, Model, Document, Types } from 'mongoose';

export interface ICard {
    titulo: string;
    texto: string;
    extra: string;
    emoji: string;
    ativo: boolean;
}

export interface IPagina {
    _id: Types.ObjectId;
    titulo: string;
    texto: string;
    tipo: string;
    emoji: string;
    ativo: boolean;
    cards: ICard[];
    slug: string; // Added for routing
}

export interface IClientePagina extends Document {
    clienteId: Types.ObjectId;
    paginas: IPagina[];
    createdAt: Date;
    updatedAt: Date;
}

const CardSchema = new Schema<ICard>({
    titulo: String,
    texto: String,
    extra: String,
    emoji: String,
    ativo: { type: Boolean, default: true },
});

const PaginaSchema = new Schema<IPagina>({
    titulo: String,
    texto: String,
    tipo: String,
    emoji: String,
    ativo: { type: Boolean, default: true },
    cards: [CardSchema],
    slug: { type: String, required: true }
});

const ClientePaginaSchema = new Schema<IClientePagina>({
    clienteId: {
        type: Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    paginas: [PaginaSchema]
}, { timestamps: true });

export const ClientePagina = (models.ClientePagina as Model<IClientePagina>) || model<IClientePagina>('ClientePagina', ClientePaginaSchema);
