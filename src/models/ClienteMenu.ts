import { Schema, model, models, Model, Document, Types } from 'mongoose';

export interface IClienteMenu extends Document {
    nome: string;
    url: string;
    idPai: number;
    ordem: number;
    ativo: boolean;
    isDefault?: boolean;
    tenantId: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const ClienteMenuSchema = new Schema<IClienteMenu>({
    nome: { type: String, default: 'Calculadora de Churrasco' },
    url: { type: String, default: 'https://mandebem.com/' },
    idPai: { type: Number, default: 0 },
    ordem: { type: Number, default: 0 },
    ativo: { type: Boolean, default: true },
    isDefault: { type: Boolean, default: false },
    tenantId: {
        type: Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    }
}, { timestamps: true });

export const ClienteMenu = (models.ClienteMenu as Model<IClienteMenu>) || model<IClienteMenu>('ClienteMenu', ClienteMenuSchema);
