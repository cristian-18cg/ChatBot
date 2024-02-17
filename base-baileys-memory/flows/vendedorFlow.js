const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const axios = require("axios").default;
const { PROMPVENDEDOR } = require("../Promps/promp_vendedor");
const ChatGPTClass = require("../chatgpt.class");
const ChatGPTInstance = new ChatGPTClass();
const texto = JSON.stringify();
const { conectarDB, cerrarConexion } = require('../adaptador/adapMongo');


async function obtenerDatos() {
    let db;
    try {
      db = await conectarDB();
      // Obtén la colección que deseas consultar
      const coleccion = db.collection('history');
      // Realiza una consulta para obtener datos
      const datos = await coleccion.find({ /* Tus condiciones de consulta aquí */ }).limit(10).toArray();
  
      // Imprime los datos
      console.log('Datos obtenidos:', datos);
    } catch (error) {
      console.error('Error al obtener datos de MongoDB:', error);
    } finally {
      if (db) {
        await cerrarConexion();
        console.log('Conexión cerrada');
      }
    }
  }
  





const formatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
});





/* Genera el promp del vendedor */
const generatePrompVendedor = (history, pregunta, produ) => {
  return PROMPVENDEDOR.replace("{PRODUCTOS}", produ)
    .replace("{RESPUESTA_C}", history)
    .replace("{PREGUNTA}", pregunta);
};
const contador = 0;






module.exports = addKeyword(EVENTS.ACTION)
  .addAction(async (_, { state, flowDynamic, extensions, fallBack }) => {
    obtenerDatos();
    respuestaChat = state.getMyState();
    let contador = 0;
    const productos = [];
    const woocomerceCredenciales = extensions.woocommerceAxiosC;
    try {
      const Productos = await axios.get("/products", woocomerceCredenciales);
      if (Productos.data && Array.isArray(Productos.data)) {
        for (const item of Productos.data) {
          if (contador == 10) {
            break;
          }
          const producto = {
            titulo: item.name,
            /*  descripcion: item.description,
          linkproducto: item.permalink, */
          };

          productos.push(producto);
          contador++;
        }
        console.log("productos: " +productos);
        const produ = JSON.stringify(productos);
        console.log(produ);

        const PROMP = generatePrompVendedor(
          respuestaChat.answer,
          respuestaChat.history,
          produ
        );

        const response = await ChatGPTInstance.handleMsgChatGPT(PROMP);
      } else {
        console.log("No se encontraron productos.");
      }
    } catch (error) {
      console.error(error);
      await flowDynamic("Ha ocurrido un error");
    }
  })
  .addAnswer(
    "Que informacion puntual buscas",
    { capture: true },
    async (ctx, { state, flowDynamic, extensions, fallBack }) => {
      const response = await ChatGPTInstance.handleMsgChatGPT(ctx.body);
      const message = response.text;
      if (ctx.body.toString() !== "No") {
        return fallBack(message);
      }
    }
  );
