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
                        id: 'reporte-pro',
                        title: 'ObraGo Pro - Reporte Élite de Ingeniería',
                        quantity: 1,
                        unit_price: 2990,
                        currency_id: 'CLP',
                        picture_url: 'https://obrascan.vercel.app/logo-full.svg'
                    }
                ],
                payer: {
                    email: userEmail
                },
                statement_descriptor: "OBRA GO",
                integrator_id: "dev_24c65dbd1ad711ea82820242ac130004", // ID de Integrador MP Chile
                back_urls: {
                    success: `${process.env.VITE_FRONTEND_URL || 'http://localhost:5555'}/scanner?status=approved`,
                    failure: `${process.env.VITE_FRONTEND_URL || 'http://localhost:5555'}/scanner?status=failure`,
                    pending: `${process.env.VITE_FRONTEND_URL || 'http://localhost:5555'}/scanner?status=pending`
                },
                auto_return: 'approved',
                metadata: {
                    user_id: userId,
                    project_name: projectName
                }
            }
        });
        
        return response.init_point;
    } catch (error) {
        console.error("❌ MERCADO PAGO ERROR:", error);
        throw error;
    }
};
