"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lead = void 0;
const mongoose_1 = require("mongoose");
const LeadSchema = new mongoose_1.Schema({
    auditId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Audit', required: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    consentToContact: { type: Boolean, default: false }
}, { timestamps: { createdAt: true, updatedAt: false } });
exports.Lead = (0, mongoose_1.model)('Lead', LeadSchema);
