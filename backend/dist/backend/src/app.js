"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importDefault(require("mongoose"));
const auditRoutes_1 = __importDefault(require("./routes/auditRoutes"));
const leadRoutes_1 = __importDefault(require("./routes/leadRoutes"));
const Audit_1 = require("./models/Audit");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express_1.default.json());
app.use('/api/audits', auditRoutes_1.default);
app.use('/api/leads', leadRoutes_1.default);
app.get('/api/db-status', (req, res) => {
    const state = mongoose_1.default.connection.readyState;
    const states = {
        0: 'disconnected',
        1: 'connected',
        2: 'connecting',
        3: 'disconnecting'
    };
    const rawUri = process.env.MONGODB_URI || 'default_local';
    const maskedUri = rawUri.replace(/:([^@]+)@/, ':****@');
    return res.json({
        status: states[state] || 'unknown',
        uriUsed: maskedUri,
        environment: process.env.NODE_ENV || 'production'
    });
});
const frontendDistPath = path_1.default.join(__dirname, '../../frontend/dist');
app.get('/report/:slug', async (req, res, next) => {
    try {
        const { slug } = req.params;
        const audit = await Audit_1.Audit.findOne({ slug });
        if (!audit) {
            return res.status(404).send('Audit report not found');
        }
        const indexPath = path_1.default.join(frontendDistPath, 'index.html');
        if (!fs_1.default.existsSync(indexPath)) {
            return next();
        }
        let html = fs_1.default.readFileSync(indexPath, 'utf8');
        const savingsPercent = audit.results.totalCurrentMonthlySpend > 0
            ? Math.round((audit.results.totalMonthlySavings / audit.results.totalCurrentMonthlySpend) * 100)
            : 0;
        const title = `AI Spend Audit | Saved $${audit.results.totalMonthlySavings}/mo (${savingsPercent}%)`;
        const description = `This ${audit.industry} team of ${audit.teamSize} optimized their AI stack, reducing monthly spend from $${audit.results.totalCurrentMonthlySpend} to $${audit.results.totalOptimizedMonthlySpend}. View the full audit details.`;
        html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
        html = html.replace(/<meta property="og:title" content="[^"]*" \/>/g, `<meta property="og:title" content="${title}" />`);
        html = html.replace(/<meta property="og:description" content="[^"]*" \/>/g, `<meta property="og:description" content="${description}" />`);
        html = html.replace(/<meta name="twitter:title" content="[^"]*" \/>/g, `<meta name="twitter:title" content="${title}" />`);
        html = html.replace(/<meta name="twitter:description" content="[^"]*" \/>/g, `<meta name="twitter:description" content="${description}" />`);
        return res.send(html);
    }
    catch (error) {
        console.error('Error in Server-Side OG Injection:', error);
        return next();
    }
});
// Static Assets
app.use(express_1.default.static(frontendDistPath));
// Catch-All client side router handler
app.get('*', (req, res) => {
    const indexPath = path_1.default.join(frontendDistPath, 'index.html');
    if (fs_1.default.existsSync(indexPath)) {
        res.sendFile(indexPath);
    }
    else {
        res.status(200).send('AI Spend Audit API is running. Frontend build not compiled yet.');
    }
});
exports.default = app;
