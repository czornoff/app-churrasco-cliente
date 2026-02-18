import mongoose, { Schema, model, models, Model, Document } from "mongoose";

export interface IUser extends Document {
    nome: string;
    email: string;
    googleId?: string;
    password?: string;
    role: 'SUPERADMIN' | 'TENANT_OWNER' | 'END_USER';
    status: 'active' | 'inactive' | 'banned';
    avatar: string;
    tenantIds?: mongoose.Types.ObjectId[]; // Array de tenants
    tenantId?: mongoose.Types.ObjectId; // Compatibilidade com código antigo (tenant primário)
    whatsApp?: string;
    UF?: string;
    cidade?: string;
    genero: 'masculino' | 'feminino' | 'outros' | 'undefined';
    birthday?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
    nome: {
        type: String,
        required: true,
        default: "Novo Usuário"
    },
    email: {
        type: String,
        unique: true,
        required: true,
        lowercase: true
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    password: {
        type: String,
        select: false
    },
    role: {
        type: String,
        enum: ['SUPERADMIN', 'TENANT_OWNER', 'END_USER'],
        default: 'END_USER'
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'banned'],
        default: 'active'
    },
    avatar: {
        type: String,
        default: 'https://ui-avatars.com/api/?name=User&background=random'
    },
    tenantIds: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'Tenant',
        default: []
    },
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: false
    },
    whatsApp: { type: String },
    UF: { type: String, maxLength: 2 },
    cidade: { type: String },
    genero: {
        type: String,
        enum: ['masculino', 'feminino', 'outros', 'undefined'],
        default: 'undefined'
    },
    birthday: { type: Date }
}, {
    timestamps: true
});

export const User = (models.User as Model<IUser>) || model<IUser>("User", UserSchema);