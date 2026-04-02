import { Schema, model, models, Document, Types, Model } from 'mongoose';

export interface IWhatsAppLog extends Document {
    tenantId: Types.ObjectId;
    userId?: Types.ObjectId;
    type: 'share_list' | 'share_store';
    createdAt: Date;
}

const WhatsAppLogSchema = new Schema<IWhatsAppLog>({
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['share_list', 'share_store'], default: 'share_list' },
}, { timestamps: true });

// Index para queries por período
WhatsAppLogSchema.index({ createdAt: -1 });
WhatsAppLogSchema.index({ tenantId: 1, createdAt: -1 });

export const WhatsAppLog = (models.WhatsAppLog as Model<IWhatsAppLog>) || model<IWhatsAppLog>('WhatsAppLog', WhatsAppLogSchema);
