import { Schema, model, models, Model, Document, Types } from 'mongoose';

export interface IClienteMenu extends Document {
    nome: string;
    url: string;
    idPai: number;
    ativo: boolean;
    clienteId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ClienteMenuSchema = new Schema<IClienteMenu>({
    nome: { type: String, default: 'Calculadora de Churrasco' },
    url: { type: String, default: 'https://mandebem.com/' },
    idPai: { type: Number, default: 0 },
    ativo: { type: Boolean, default: true },
    clienteId: {
        type: Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    }
}, { timestamps: true });

export const ClienteMenu = (models.ClienteMenu as Model<IClienteMenu>) || model<IClienteMenu>('ClienteMenu', ClienteMenuSchema);
