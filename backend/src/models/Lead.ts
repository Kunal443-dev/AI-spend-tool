import { Schema, model, Document } from 'mongoose';

export interface ILead extends Document {
  auditId: Schema.Types.ObjectId;
  email: string;
  name: string;
  company: string;
  consentToContact: boolean;
  createdAt: Date;
}

const LeadSchema = new Schema<ILead>({
  auditId: { type: Schema.Types.ObjectId, ref: 'Audit', required: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  name: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  consentToContact: { type: Boolean, default: false }
}, { timestamps: { createdAt: true, updatedAt: false } });

export const Lead = model<ILead>('Lead', LeadSchema);
