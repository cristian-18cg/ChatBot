const axios = require("axios").default;
require("dotenv").config();
const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} = require("@bot-whatsapp/bot");

/* Importaciones */
const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mongo");
const bienvenida = require("./flows/bienvenida");
const horarioFlow = require("./flows/horarioFlow");
const vendedorFlow = require("./flows/vendedorFlow");
const { init } = require("bot-ws-plugin-openai");
const registro = require("./flows/registro");
/* woocomerce credenciales */
const woocommerceAxiosC = {
  baseURL: process.env.BASE_URL,
  auth: {
    username: process.env.CONSUMER_KEY,
    password: process.env.CONSUMER_SECRET,
  },
};
/* Credenciales openia */
const employeesAddonConfig = {
  model: "gpt-3.5-turbo-16k",
  temperature: 0.2,
  apiKey: process.env.OPENAI_API_KEY,
};
const employeesAddon = init(employeesAddonConfig);

employeesAddon.employees([
  {
    name: "EMPLEADA_VENDEDORA",
    description:
      "Soy Andrea de Nacional de eléctricos H H LTDA encargada de atentender si tienes intencion de comprar, consultar informacion de productos , mis respuestas son breves y concisas, pero se amable. ",
    flow: vendedorFlow,
  },
  {
    name: "EMPLEADA_ASESORA_INFORMACION_HORARIOS",
    description: [
      "Saludos, mi nombre es Andrea encargada, de asesorar con respecto a todos los temas de telefonos de contacto, sedes, horarios de atencion y direccion de las sede",
      "[IMPORTANTE]: da respuestas de dos palabras confirmando Andrea horario",
    ],
    flow: horarioFlow,
  },
]);

const main = async () => {
  /* adaptador base de datos  */
  const adapterDB = new MockAdapter({
    dbUri: "mongodb://0.0.0.0:27017",
    dbName: "chatbot_curso_mongo",
  });
  /* adaptador flujos de conversacion  */
  const adapterFlow = createFlow([
    bienvenida,
    horarioFlow,
    vendedorFlow,
    registro,
  ]);

  /* adaptador provedor  */
  const adapterProvider = createProvider(BaileysProvider);

  const configBot = {
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  };
  const configExtra = {
    extensions: {
      employeesAddon,
      woocommerceAxiosC,
    },
  };
  await createBot(configBot, configExtra);
  QRPortalWeb();
};

main();
