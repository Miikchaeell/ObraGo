import { MercadoPagoConfig, Preference } from 'mercadopago';

// [v1.0] Mercado Pago SaaS Integration
// Configurada para modo SANDBOX por defecto según solicitud del CEO.

const client = new MercadoPagoConfig({ 
    accessToken: process.env.MP_ACCESS_TOKEN || 'TEST-0000000000000000-000000-00000000000000000000000000000000-000000000',
    options: { timeout: 5000 }
});

export const createPaymentPreference = async (userId, userEmail, projectName) => {
    const preference = new Preference(client);
    
    try {
        const response = await preference.create({
            body: {
                items: [
                    {
                        id: 'pdf-unlock',
                        title: `Desbloqueo PDF: ${projectName}`,
                        quantity: 1,
                        unit_price: Number(process.env.PRECIO || 2990),
                        currency_id: 'CLP',
                    }
                ],
                payer: {
                    email: userEmail
                },
                back_urls: {
                    success: `${process.env.FRONTEND_URL || 'https://app.obrago.cl'}/dashboard?status=success`,
                    failure: `${process.env.FRONTEND_URL || 'https://app.obrago.cl'}/scanner?status=failure`,
                    pending: `${process.env.FRONTEND_URL || 'https://app.obrago.cl'}/dashboard?status=pending`
                },
                auto_return: 'approved',
                notification_url: `${process.env.BACKEND_URL}/api/webhook/mp`,
                metadata: {
                    user_id: userId,
                    type: 'pdf_unlock'
                }
            }
        });
        
        return response.init_point;
    } catch (error) {
        console.error("❌ MERCADO PAGO ERROR:", error);
        throw error;
    }
};
