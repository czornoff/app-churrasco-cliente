import mongoose, { Schema, model, models, Model } from "mongoose";

const UserSchema = new Schema({
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
        sparse: true // Permite que usuários sem Google ID (login manual) coexistam
    },
    password: { 
        type: String,
        select: false // Evita que a senha seja retornada em buscas comuns por segurança
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
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant', // Certifique-se de que o model da Loja se chama 'Tenant'
        required: false // IMPORTANTE: false para o login social não travar
    },
    // Campos adicionais com valores padrão para evitar erros de undefined
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
    timestamps: true // Cria automaticamente createdAt e updatedAt
});

// Exporta o model, prevenindo erro de re-compilação no Next.js
export const User = (models.User as Model<unknown>) || model<unknown>("User", UserSchema);