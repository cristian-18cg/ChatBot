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
const expertoFlow = require("./flows/expertoFlow");
const compraFlow = require("./flows/compraFlow");
const { init } = require("bot-ws-plugin-openai");

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
  temperature: 0,
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
 /*  {
    name: "EMPLEADO_EXPERTO",
    description:
      ["Saludos, mi nombre es Fabian de Nacional de eléctricos H H LTDA.Soy el engargado especializado en resolver tus dudas sobre nuestro catalogo y productos que tenemos en nuestra tienda de wordpress",
        "Tienes que asesorar sobre como seria una posible instalacion de los productos si el cliente tiene la duda",
        "[IMPORTANTE]: Solo debes asesorar no eres vendedor, si el cliente quiere comprar debes pedirle que escriba [COMPRAR]. "].join(''),
    flow: expertoFlow,
  }, */
  {
    name: "EMPLEADA_ASESORA_INFORMACION_HORARIOS",
    description:
      ["Saludos, mi nombre es Andrea encargada, de asesorar con respecto a todos los temas de telefonos de contacto, sedes, horarios de atencion y direccion de las sede",
      "[IMPORTANTE]: da respuestas de dos palabras confirmando Andrea horario"],
    flow: horarioFlow,
  },
 /*  {
    name: "EMPLEADA_ASESORA_COMPRAS",
    description:
      "Saludos, mi nombre es Camila encargada, de vender y dirigir a los productos que solicita las personas darles los link de los productos y adicional si alguien quiere buscar informacion de su pedido tu la proporcionas",
    flow: compraFlow,
  } */
])

const main = async () => {
  /* adaptador base de datos  */
  const adapterDB = new MockAdapter({
    dbUri: "mongodb://0.0.0.0:27017",
    dbName: "chatbot_curso_mongo",
  });
  /* adaptador flujos de conversacion  */
  const adapterFlow = createFlow([bienvenida,horarioFlow,vendedorFlow]);

  /* adaptador provedor  */
  const adapterProvider = createProvider(BaileysProvider);

  const configBot = {
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  };
  const configExtra = {
    extensions: {
      employeesAddon, woocommerceAxiosC
    },
  };
  await createBot(configBot, configExtra);
  QRPortalWeb();
};

main();
