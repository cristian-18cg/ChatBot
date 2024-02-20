const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const axios = require("axios").default;
const { PROMPVENDEDOR } = require("../Promps/promp_vendedor");
const { PROMPBUSQUEDA } = require("../Promps/promp_busqueda");
const ChatGPTClass = require("../chatgpt.class");
const ChatGPTInstance = new ChatGPTClass();
const dbAgregar = require("../adaptador/agregarproductos");
const { conectarDB, cerrarConexion } = require("../adaptador/adapMongo");
const bienvenida = require("./bienvenida");

async function obtenerDatos(palabraBuscada) {
  let db;
  try {
    db = await conectarDB();
    // Obtén la colección que deseas consultar
    const coleccion = db.collection("productos");
    // Realiza una consulta para obtener datos
    
    const datos = await coleccion
      .find({ titulo: { $regex: palabraBuscada, $options: "i" } })
      .limit(10)
      .toArray();
    /* const datos = await coleccion.find({}).limit(10).toArray(); */
    // Imprime los datos //
    /* console.log("Datos obtenidos:", datos);  */
    return datos;
  } catch (error) {
    console.error("Error al obtener datos de MongoDB:", error);
  } finally {
    if (db) {
      await cerrarConexion();
      console.log("Conexión cerrada ");
    }
  }
}

const formatter = new Intl.NumberFormat("es-CO", {
  style: "currency",
  currency: "COP",
});
const generatePrompBusqueda = (history) => {
  return PROMPBUSQUEDA.replace("{MENSAJE}", history);
};
/* Genera el promp del vendedor */
const generatePrompVendedor = (history,pregunta,produ) => {
  return PROMPVENDEDOR.replace("{PRODUCTOS}", produ)
    .replace("{RESPUESTA_CHAT}", history)
    .replace("{PREGUNTA}", pregunta);
};

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}



module.exports = addKeyword(EVENTS.ACTION)
  .addAction({capture:true},async (ctx, { state, flowDynamic, extensions, fallBack, gotoFlow }) => {
    try {
      const respuestaChat = state.getMyState();
      const PROMP_1 = generatePrompBusqueda(respuestaChat.history);
      const response_1 = await ChatGPTInstance.handleMsgChatGPT(PROMP_1);
      console.log(response_1.text)
      /* Consulta base de datos productos */
      const datos = await obtenerDatos(response_1.text);
      if (datos.length === 0){
        console.log("producto no encontado")
        await flowDynamic('¿Puedes volverme a indicar que necesitas?')
        return gotoFlow (bienvenida,1)
      }
      /* Convertimos a los datos que necesitamos */

      const productos = Object.values(datos).map(
        ({ titulo, descripcion, linkproducto, precio }) => ({
          titulo,
          descripcion,
          linkproducto,
          precio
        })
      );
      console.log(productos); 
      /* Convertimos a Texto */
      const texto = JSON.stringify(productos);
      /* console.log(texto) */
      /* Cambiamos las variables del PROMP */
      const PROMP = generatePrompVendedor(
        respuestaChat.answer,
        respuestaChat.history,
        texto
      );
    
      /* Enviamos el segundo mensaje entrenando al bot */
      await ChatGPTInstance.handleMsgChatGPT(PROMP);
    } catch (error) {
      console.error(error);
      await flowDynamic("Ha ocurrido un error");
    }
  })
  .addAnswer(
    "¿Que información puntual buscas?",
    { capture: true },
    async (ctx, { state, fallBack, flowDynamic, gotoFlow }) => {
      const State = state.getMyState();
      try {
        const response = await ChatGPTInstance.handleMsgChatGPT(ctx.body);
        const message = response.text;
        if (ctx.body.toString() !== "no") {
          return fallBack(message);
        }else if (ctx.body.toString() == "si"){
            return (bienvenida,1)
        }else {
          await flowDynamic(
            `Fue un gusto ayudarte *${State.usuario}*, espero vuelvas pronto.`
          );
        }
      } catch (error) {
        console.error(error);
        await flowDynamic("Permiteme un momento mientras proceso tu solicitud, no respondas nada por el momento.");
        await delay(21000);
        const response = await ChatGPTInstance.handleMsgChatGPT(ctx.body);
        const message = response.text;
        await flowDynamic('¡Listo!')
        return fallBack(message);
      }
    }
  );
