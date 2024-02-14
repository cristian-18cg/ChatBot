const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const registro = require("./registro");
const productos = require("./productos");
const Info_pedido = require("./Info_pedido");

module.exports = addKeyword(EVENTS.WELCOME)
  .addAnswer("⚡⚡ Hola, welcome a Nacional de Electricos ⚡⚡")
  .addAnswer(
    "📑 *MENÚ* 📑 \n*1.* Registo \n*2.* Informacion de mi pedido\n*3.* Productos\n*4.* Contactar con un experto\n*5.* Información de mi pedido",
    null,
    null,
    [registro, productos,Info_pedido]
  );
