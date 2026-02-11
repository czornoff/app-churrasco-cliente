import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Em produção, usaremos hash (bcrypt)
  image: { type: String }, // Foto do perfil
  
  // O "role" define o que o usuário pode fazer
  role: { 
    type: String, 
    enum: ['SUPERADMIN', 'TENANT_OWNER', 'END_USER'], 
    default: 'END_USER' 
  },

  // Se o usuário for um TENANT_OWNER, aqui guardamos o ID do buffet dele
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', default: null },

}, { timestamps: true });

export const User = models.User || model('User', UserSchema);