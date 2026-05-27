import path from 'path';
import fs from 'fs';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import auditRoutes from './routes/auditRoutes';
import leadRoutes from './routes/leadRoutes';
import { Audit } from './models/Audit';

const app = express();


app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

app.use('/api/audits', auditRoutes);
app.use('/api/leads', leadRoutes);

app.get('/api/db-status', (req: express.Request, res: express.Response) => {
  const state = mongoose.connection.readyState;
  const states: Record<number, string> = {
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

const frontendDistPath = path.join(__dirname, '../../frontend/dist');

app.get('/report/:slug', async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  try {
    const { slug } = req.params;
    const audit = await Audit.findOne({ slug });

    if (!audit) {
      return res.status(404).send('Audit report not found');
    }

    const indexPath = path.join(frontendDistPath, 'index.html');
    if (!fs.existsSync(indexPath)) {
      return next();
    }

    let html = fs.readFileSync(indexPath, 'utf8');

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
  } catch (error) {
    console.error('Error in Server-Side OG Injection:', error);
    return next();
  }
});

// Static Assets
app.use(express.static(frontendDistPath));

// Catch-All client side router handler
app.get('*', (req: express.Request, res: express.Response) => {
  const indexPath = path.join(frontendDistPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).send('AI Spend Audit API is running. Frontend build not compiled yet.');
  }
});

export default app;
