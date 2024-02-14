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
const { init } = require("bot-ws-plugin-openai");

/* Credenciales woocommerce */
const employeesAddonConfig = {
  model: "gpt-3.5-turbo-16k",
  temperature: 0,
  apiKey: process.env.OPENAI_API_KEY,
};
const employeesAddon = init(employeesAddonConfig);

employeesAddon.employees([
  {
    name: "EMPLEADO_VENDEDOR",
    description:
      "Soy Rob el vendedor amable encargado de atentender si tienes intencion de comprar o interesado en algun producto, mis respuestas son breves.",
    flow: vendedorFlow,
  },
]);

const main = async () => {
  /* adaptador base de datos  */
  const adapterDB = new MockAdapter({
    dbUri: "mongodb://0.0.0.0:27017",
    dbName: "chatbot_curso_mongo",
  });
  /* adaptador flujos de conversacion  */
  const adapterFlow = createFlow([bienvenida]);

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
    },
  };
  await createBot(configBot, configExtra);

  QRPortalWeb();
};

main();
