import express from 'express';
import cors from 'cors';
import { MercadoPagoConfig, Preference } from 'mercadopago';

const app = express();
app.use(express.json());
app.use(cors());

// Servir la carpeta donde estará la página web
app.use(express.static('public'));

// Pega aquí tu TEST Access Token de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: 'APP_USR-3500818402473777-091414-af67f5626a8ac55896f5dab50086d69c-3689792524' 
});

app.post('/api/crear-preferencia', async (req, res) => {
  try {
    const { items } = req.body;

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: items.map(prod => ({
          title: prod.nombre,
          quantity: Number(prod.cantidad),
          unit_price: Number(prod.precio),
          currency_id: 'ARS' // Cambia la moneda si no es pesos argentinos
        })),
        back_urls: {
          success: 'https://www.mercadopago.com',
          failure: 'https://www.mercadopago.com',
          pending: 'https://www.mercadopago.com'
        },
        auto_return: 'approved'
      }
    });

    res.json({ init_point: result.init_point });
  } catch (error) {
    console.error('Error al generar pago:', error);
    res.status(500).json({ error: 'Error al generar preferencia' });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor activo en: http://localhost:${PORT}`);
});