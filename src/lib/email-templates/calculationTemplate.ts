export function getCalculationEmailTemplate(
    tenantName: string,
    eventName: string,
    totalPeople: { men: number; women: number; children: number },
    items: any[],
    totalPrice: number
) {
    const total = totalPeople.men + totalPeople.women + totalPeople.children;

    const itemsHtml = items.map(item => `
        <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151;">
                <strong>${item.nome}</strong><br>
                <span style="font-size: 12px; color: #6b7280;">${item.quantidadeEmbalagem} embalagen(s) de ${item.tamanhoEmbalagem}${item.unidade}</span>
            </td>
            <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #374151; text-align: right;">
                R$ ${item.totalPreco.toFixed(2)}
            </td>
        </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orçamento de Churrasco</title>
</head>
<body style="font-family: Arial, sans-serif; background-color: #f9fafb; margin: 0; padding: 20px;">
    <div style="max-w: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
        
        <div style="background-color: #e53935; padding: 30px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🔥 Calculadora de Churrasco</h1>
            <p style="color: #ffebee; margin-top: 5px; font-size: 16px;">${tenantName}</p>
        </div>

        <div style="padding: 30px;">
            <p style="font-size: 16px; color: #374151; line-height: 1.5;">
                Olá! Aqui estão os detalhes do cálculo para o evento: <strong>${eventName}</strong>.
            </p>

            <div style="background-color: #f3f4f6; border-radius: 6px; padding: 15px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #111827; font-size: 16px;">Resumo dos Convidados</h3>
                <ul style="margin: 0; padding-left: 20px; color: #4b5563;">
                    <li>Homens: ${totalPeople.men}</li>
                    <li>Mulheres: ${totalPeople.women}</li>
                    <li>Crianças: ${totalPeople.children}</li>
                    <li><strong>Total: ${total} pessoas</strong></li>
                </ul>
            </div>

            <h3 style="color: #111827; font-size: 18px; border-bottom: 2px solid #e53935; padding-bottom: 8px;">Lista de Compras</h3>

            <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                <thead>
                    <tr>
                        <th style="padding: 12px; text-align: left; background-color: #f9fafb; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Produto</th>
                        <th style="padding: 12px; text-align: right; background-color: #f9fafb; color: #6b7280; font-size: 14px; border-bottom: 1px solid #e5e7eb;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${itemsHtml}
                </tbody>
                <tfoot>
                    <tr>
                        <td style="padding: 15px 12px; text-align: right; font-weight: bold; color: #111827; font-size: 18px;">Valor Estimado:</td>
                        <td style="padding: 15px 12px; text-align: right; font-weight: bold; color: #e53935; font-size: 20px;">R$ ${totalPrice.toFixed(2)}</td>
                    </tr>
                </tfoot>
            </table>

            <div style="margin-top: 30px; text-align: center;">
                <a href="${(process.env.NEXTAUTH_URL || 'https://mandebem.com').replace(/\/api\/auth\/?$/, '')}" style="background-color: #1f2937; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;">
                    Voltar para o App
                </a>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 30px;">
                Esta é uma mensagem automática gerada pela plataforma MandeBem em nome de ${tenantName}.<br>
                Os valores apresentados são estimativas baseadas nos produtos disponíveis na data do cálculo.
            </p>
        </div>
    </div>
</body>
</html>
    `;
}
