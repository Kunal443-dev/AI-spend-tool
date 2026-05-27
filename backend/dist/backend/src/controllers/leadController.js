"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLead = void 0;
const Lead_1 = require("../models/Lead");
const Audit_1 = require("../models/Audit");
const emailService_1 = require("../services/emailService");
const createLead = async (req, res) => {
    try {
        const { auditSlug, email, name, company, consentToContact, hp_name } = req.body;
        if (hp_name && hp_name.trim() !== '') {
            console.warn('Honeypot field triggered in lead submission.');
            return res.status(400).json({ error: 'Invalid submission' });
        }
        if (!auditSlug || !email || !name || !company) {
            return res.status(400).json({ error: 'Missing required lead parameters' });
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email address format' });
        }
        const audit = await Audit_1.Audit.findOne({ slug: auditSlug });
        if (!audit) {
            return res.status(404).json({ error: 'Referenced audit report not found' });
        }
        const newLead = new Lead_1.Lead({
            auditId: audit._id,
            email,
            name,
            company,
            consentToContact: !!consentToContact
        });
        await newLead.save();
        let emailResult = '';
        try {
            emailResult = await (0, emailService_1.sendAuditReportEmail)(email, name, audit);
        }
        catch (emailError) {
            console.error(`SMTP email delivery failed to ${email}:`, emailError);
            return res.status(502).json({
                error: `Lead saved but report email could not be sent: ${emailError.message || emailError}`
            });
        }
        return res.status(201).json({
            message: 'Report sent successfully.',
            previewUrl: emailResult && emailResult !== 'real_smtp' ? emailResult : undefined
        });
    }
    catch (error) {
        console.error('Error saving lead:', error);
        return res.status(500).json({ error: 'Internal server error capturing lead' });
    }
};
exports.createLead = createLead;
