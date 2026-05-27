import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import { IAudit } from '../models/Audit';


dotenv.config();


const host = process.env.SMTP_HOST;
const port = Number(process.env.SMTP_PORT) || 587;
const user = process.env.SMTP_USER;
const pass = process.env.SMTP_PASS;
const from = process.env.SMTP_FROM || '"AI Spend Audit" <no-reply@aispendaudit.com>';
const secure = process.env.SMTP_SECURE === 'true';


const isSmtpConfigured = !!(
  host && 
  user && 
  pass && 
  !user.includes('your_email') && 
  !pass.includes('your_app_password') &&
  host !== '' &&
  user !== '' &&
  pass !== ''
);

let transporterPromise: Promise<nodemailer.Transporter>;

if (isSmtpConfigured) {
  console.log(`SMTP configured: host=${host}, port=${port}, secure=${secure}, user=${user}`);
  transporterPromise = Promise.resolve(
    nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass
      }
    })
  );
} else {
  console.log('SMTP credentials not configured or placeholder detected. Initializing Ethereal Mail fallback for development...');
  transporterPromise = nodemailer.createTestAccount().then(account => {
    console.log('Ethereal Mail test account created:');
    console.log(`- Host: ${account.smtp.host}`);
    console.log(`- User: ${account.user}`);
    console.log(`- Pass: ${account.pass}`);
    return nodemailer.createTransport({
      host: account.smtp.host,
      port: account.smtp.port,
      secure: account.smtp.secure,
      auth: {
        user: account.user,
        pass: account.pass
      }
    });
  }).catch(err => {
    console.error('Failed to create Ethereal Mail test account:', err);
    // Fall back to a mock transporter that just logs to console
    return {
      sendMail: async (options: any) => {
        console.warn('USING MOCK EMAIL TRANSPORTER. No real or Ethereal SMTP is available.');
        console.log('Mock email sending data:', JSON.stringify(options, null, 2));
        return { messageId: 'mock-id' };
      }
    } as any;
  });
}


export const sendAuditReportEmail = async (
  email: string,
  name: string,
  audit: IAudit
): Promise<string> => {
  const transporter = await transporterPromise;
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const reportUrl = `${clientUrl}/report/${audit.slug}`;
  const savingsPercent = audit.results.totalCurrentMonthlySpend > 0
    ? Math.round((audit.results.totalMonthlySavings / audit.results.totalCurrentMonthlySpend) * 100)
    : 0;

  // Build recommendations HTML list
  let recommendationsHtml = '';
  if (audit.results.recommendations.length === 0) {
    recommendationsHtml = `
      <div style="background-color: #111827; border: 1px solid #1f2937; padding: 20px; border-radius: 12px; text-align: center; color: #9ca3af; font-size: 14px;">
        🎉 Your AI stack is fully optimized! No overspending detected.
      </div>
    `;
  } else {
    recommendationsHtml = audit.results.recommendations.map(rec => {
      let severityBadgeColor = '#4b5563'; // gray
      let severityTextColor = '#9ca3af';
      if (rec.severity === 'high') {
        severityBadgeColor = 'rgba(239, 68, 68, 0.15)';
        severityTextColor = '#ef4444';
      } else if (rec.severity === 'medium') {
        severityBadgeColor = 'rgba(245, 158, 11, 0.15)';
        severityTextColor = '#f59e0b';
      } else if (rec.severity === 'low') {
        severityBadgeColor = 'rgba(99, 102, 241, 0.15)';
        severityTextColor = '#6366f1';
      }

      return `
        <div style="background-color: #111827; border: 1px solid #1f2937; border-left: 4px solid #6366f1; padding: 20px; border-radius: 12px; margin-bottom: 16px;">
          <div style="display: flex; gap: 8px; margin-bottom: 8px; align-items: center;">
            <span style="font-size: 10px; font-weight: bold; background-color: #0b0f19; color: #d1d5db; padding: 3px 8px; border-radius: 9999px; border: 1px solid #1f2937;">
              ${rec.toolId.toUpperCase()}
            </span>
            <span style="font-size: 10px; font-weight: bold; background-color: ${severityBadgeColor}; color: ${severityTextColor}; padding: 3px 8px; border-radius: 9999px;">
              ${rec.severity.toUpperCase()} Priority
            </span>
          </div>
          <h4 style="margin: 0 0 6px 0; color: #ffffff; font-size: 16px; font-weight: bold;">${rec.title}</h4>
          <p style="margin: 0 0 12px 0; color: #9ca3af; font-size: 13px; line-height: 1.5;">${rec.description}</p>
          <div style="font-size: 12px; color: #6b7280; display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #1f2937; padding-top: 10px;">
            <span>Current: <strong>$${rec.currentCost}/mo</strong> &rarr; Target: <strong>$${rec.optimizedCost}/mo</strong></span>
            <span style="color: #10b981; font-weight: bold;">+ $${rec.savings}/mo savings</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Define email body HTML (premium, dark themed dashboard design)
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AI Spend Optimization Audit</title>
      <style>
        body {
          background-color: #0b0f19;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #f1f5f9;
          margin: 0;
          padding: 0;
          -webkit-text-size-adjust: 100%;
          -ms-text-size-adjust: 100%;
        }
        table {
          border-collapse: collapse;
          mso-table-lspace: 0pt;
          mso-table-rspace: 0pt;
        }
      </style>
    </head>
    <body style="background-color: #0b0f19; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background-color: #0c101d; border-radius: 20px; border: 1px solid #1e293b; overflow: hidden;">
        
        <!-- Header -->
        <tr>
          <td align="center" style="background-color: #020617; padding: 30px 20px; border-bottom: 1px solid #1e293b;">
            <table border="0" cellspacing="0" cellpadding="0">
              <tr>
                <td style="background-color: #4f46e5; border-radius: 8px; width: 32px; height: 32px; text-align: center; vertical-align: middle;">
                  <span style="color: #ffffff; font-weight: bold; font-size: 20px;">&darr;</span>
                </td>
                <td style="padding-left: 10px;">
                  <span style="font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                    AI Spend <span style="color: #818cf8;">Audit</span>
                  </span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Main Body -->
        <tr>
          <td style="padding: 30px 24px;">
            <p style="margin: 0 0 10px 0; font-size: 14px; font-weight: bold; text-transform: uppercase; color: #818cf8; letter-spacing: 1px;">Audit Ready</p>
            <h2 style="margin: 0 0 10px 0; font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.25;">
              Hi ${name}, your optimization report is ready!
            </h2>
            <p style="margin: 0 0 24px 0; font-size: 14px; color: #9ca3af; line-height: 1.5;">
              We audited the software subscription models for your team in the <strong>${audit.industry}</strong> industry. Here are your cost optimization recommendations.
            </p>

            <!-- Financial Summary Box -->
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(99, 102, 241, 0.05) 100%); border: 1px solid rgba(129, 140, 248, 0.2); border-radius: 16px; margin-bottom: 24px; padding: 24px;">
              <tr>
                <td>
                  <span style="font-size: 12px; font-weight: bold; text-transform: uppercase; color: #a5b4fc; letter-spacing: 0.5px;">Estimated Monthly Savings</span>
                  <div style="font-size: 36px; font-weight: 900; color: #ffffff; margin: 8px 0 2px 0;">
                    +$${audit.results.totalMonthlySavings}<span style="font-size: 14px; font-weight: normal; color: #a5b4fc;">/mo</span>
                  </div>
                  <div style="font-size: 14px; font-weight: bold; color: #10b981;">
                    Save $${audit.results.totalYearlySavings}/year (${savingsPercent}% cut)
                  </div>
                  
                  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 20px; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 14px;">
                    <tr>
                      <td width="50%">
                        <div style="font-size: 11px; color: #9ca3af; text-transform: uppercase; font-weight: bold;">Current Spend</div>
                        <div style="font-size: 16px; font-weight: bold; color: #ffffff; margin-top: 4px;">$${audit.results.totalCurrentMonthlySpend}/mo</div>
                      </td>
                      <td width="50%">
                        <div style="font-size: 11px; color: #9ca3af; text-transform: uppercase; font-weight: bold;">Optimized Spend</div>
                        <div style="font-size: 16px; font-weight: bold; color: #10b981; margin-top: 4px;">$${audit.results.totalOptimizedMonthlySpend}/mo</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- AI CFO Narrative -->
            <div style="background-color: #111827; border: 1px dashed rgba(99, 102, 241, 0.3); border-radius: 16px; padding: 20px; margin-bottom: 30px;">
              <h3 style="margin: 0 0 10px 0; font-size: 15px; font-weight: bold; color: #ffffff; display: flex; align-items: center; gap: 8px;">
                💡 AI CFO Narrative Summary
              </h3>
              <p style="margin: 0; font-size: 13px; color: #d1d5db; line-height: 1.6; font-style: italic;">
                "${audit.results.aiSummary}"
              </p>
            </div>

            <!-- Recommendations Heading -->
            <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: bold; color: #ffffff;">
              Recommended Action Items (${audit.results.recommendations.length})
            </h3>

            <!-- Recommendations list -->
            ${recommendationsHtml}

            <!-- Button CTA -->
            <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 30px;">
              <tr>
                <td align="center">
                  <a href="${reportUrl}" target="_blank" style="background-color: #4f46e5; color: #ffffff; display: inline-block; padding: 14px 30px; font-size: 14px; font-weight: bold; border-radius: 12px; text-decoration: none; box-shadow: 0 4px 12px rgba(79, 70, 229, 0.3); transition: background-color 0.2s;">
                    View Interactive Audit Report
                  </a>
                </td>
              </tr>
            </table>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td align="center" style="background-color: #020617; padding: 24px 20px; border-top: 1px solid #1e293b; color: #6b7280; font-size: 12px;">
            <p style="margin: 0 0 6px 0; color: #9ca3af; font-weight: bold;">Credex AI Spend Audit Submission</p>
            <p style="margin: 0 0 12px 0; line-height: 1.4;">
              This report was compiled securely using local pricing data rules and AI summaries. All data is sanitized and public URLs do not contain personal details.
            </p>
            <p style="margin: 0;">&copy; 2026 AI Spend Audit.</p>
          </td>
        </tr>

      </table>
    </body>
    </html>
  `;

  const mailOptions = {
    from,
    to: email,
    subject: `AI Spend Audit | Save $${audit.results.totalMonthlySavings}/mo on AI subscriptions!`,
    html: htmlContent
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    const etherealUrl = nodemailer.getTestMessageUrl(info);
    
    if (etherealUrl) {
      console.log(`\n==================================================`);
      console.log(`📧 Ethereal Email Sent Successfully!`);
      console.log(`- Recipient: ${email}`);
      console.log(`- Preview URL: ${etherealUrl}`);
      console.log(`==================================================\n`);
      return etherealUrl;
    } else {
      console.log(`📧 Real Email Sent Successfully to ${email}. MessageId: ${info.messageId}`);
      return 'real_smtp';
    }
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
    throw error;
  }
};
