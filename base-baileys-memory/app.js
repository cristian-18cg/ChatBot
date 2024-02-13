const axios = require("axios").default;
require("dotenv").config();
const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} = require("@bot-whatsapp/bot");
const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");
const { createBotDialog } = require("@bot-whatsapp/contexts/dialogflowcx");

const main = async () => {
  const adapterDB = new MockAdapter();

  const adapterProvider = createProvider(BaileysProvider);

  createBotDialog(
      {
      provider: adapterProvider,
      database: adapterDB,
      },
      {
        location:'',
        agentId:''
      }
  );
  QRPortalWeb();
};

main();
