/**
 * Utilitário de envio de e-mails via Resend (https://resend.com)
 * Requer: RESEND_API_KEY e EMAIL_FROM no .env.local
 */

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || 'noreply@mandebem.com';

    if (!apiKey) {
        throw new Error('RESEND_API_KEY não configurada no ambiente.');
    }

    const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to, subject, html }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Falha ao enviar e-mail: ${errorText}`);
    }
}

export function buildPasswordResetEmail(nome: string, resetUrl: string): string {
    return `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        <title>Recuperar Senha</title>
    </head>
    <body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 20px;">
            <tr>
                <td align="center">
                    <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08);">
                        <!-- Header -->
                        <tr>
                            <td style="background:#e53935;padding:32px;text-align:center;">
                                <p style="margin:0;color:#fff;font-size:24px;font-weight:900;letter-spacing:-0.5px;text-transform:uppercase;">🔒 Redefinir Senha</p>
                            </td>
                        </tr>
                        <!-- Body -->
                        <tr>
                            <td style="padding:40px 40px 32px;">
                                <p style="margin:0 0 16px;color:#18181b;font-size:18px;font-weight:700;">Olá, ${nome}!</p>
                                <p style="margin:0 0 24px;color:#52525b;font-size:15px;line-height:1.7;">
                                    Recebemos uma solicitação para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova senha:
                                </p>
                                <div style="text-align:center;margin:32px 0;">
                                    <a href="${resetUrl}"
                                       style="display:inline-block;background:#e53935;color:#fff;font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:1px;padding:16px 40px;border-radius:10px;text-decoration:none;">
                                        Redefinir Minha Senha
                                    </a>
                                </div>
                                <p style="margin:24px 0 0;color:#a1a1aa;font-size:13px;line-height:1.6;">
                                    Este link expira em <strong>1 hora</strong>. Se você não solicitou a redefinição de senha, ignore este e-mail — sua conta continua segura.
                                </p>
                            </td>
                        </tr>
                        <!-- Footer -->
                        <tr>
                            <td style="background:#f4f4f5;padding:24px;text-align:center;">
                                <p style="margin:0;color:#a1a1aa;font-size:12px;">MandeBem - Apps Inteligentes &copy; 2026</p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
}
