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
const MockAdapter = require("@bot-whatsapp/database/mock");
const { PROMP } = require("./promp"); /* TRAER EL PROMP */
const ChatGPTClass = require("./chatgpt.class"); /* TRAER LA CLASE */

/* CREAR BOT */
const ChatGPTInstance = new ChatGPTClass();

const confirmar = addKeyword("si confirmo").addAnswer("Reservado");

const flowInicial = addKeyword("hola")
  .addAnswer("Buenas!", null, async () => {
    /* El primer mensaje es entrenar al bot */
    await ChatGPTInstance.handleMsgChatGPT(PROMP);
  })
  .addAnswer(
    "Para cuando quieres la reserva de la cita?",
    { capture: true },
    async (ctx, { flowDynamic, fallBack }) => {
      /*Espera la respuesta de chatgpt y la muestra  */
      const response = await ChatGPTInstance.handleMsgChatGPT(ctx.body);
      const message = response.text;
      if (ctx.body.toString() !== "si confirmo") {
        /* Si no escribio si confirmo vuelve al flujo otra vez y responde con lo que dijo chatgpt*/
        return fallBack(message);
      }
    },
    [confirmar]
  );


const main = async () => {
  /* adaptador base de datos  */
  const adapterDB = new MockAdapter();
  /* adaptador flujos de conversacion  */
  const adapterFlow = createFlow([flowInicial]);

  /* adaptador provedor  */
  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });
  QRPortalWeb();
};

main();
