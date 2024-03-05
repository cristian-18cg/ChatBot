const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const registro = require("./registro");
const { conectarDB, cerrarConexion } = require("../adaptador/adapMongo");
const { delay } = require("@whiskeysockets/baileys");
const { sendMessageChatWood } = require("../services/chatwood");

async function obtenerDatos(celular) {
  let db;
  try {
    db = await conectarDB();
    // Obtén la colección que deseas consultar
    const coleccion = db.collection("usuarios");
    // Realiza una consulta para obtener datos
    const datos = await coleccion.find({ numero: celular }).toArray();
    return datos;
  } catch (error) {
    console.error("Error al obtener datos de MongoDB:", error);
  } finally {
    if (db) {
      await cerrarConexion();
      console.log("Conexión cerrada");
    }
  }
}
let datoUsuario = "";
module.exports = addKeyword(EVENTS.WELCOME)
  .addAction(async (ctx, { flowDynamic, gotoFlow, endFlow }) => {
    await sendMessageChatWood(`Mensaje usuario: ${ctx.body}`,'incoming')
    try {
      datoUsuario = await obtenerDatos(ctx.from);
      console.log(datoUsuario);

      if (datoUsuario.length === 0) {
        await flowDynamic(
          "Bienvenido(a) a *Nacional de Electricos*. \n ⏳ Estamos consultando si estas registrado(a) en nuestra base de datos.⌛"
        );
        
        return gotoFlow(registro);
      } else {
        const nombre_cliente = datoUsuario[0].nombre_cliente;
        const primerNombre = nombre_cliente.split(" ")[0];
        console.log(primerNombre);
        const mensaje = `Hola *${datoUsuario[0].nombre_cliente}*, hablas con Andrea de Nacional de Electricos 🙋🏻, ¿como te encuentras?`
        await flowDynamic(mensaje);
        await sendMessageChatWood(`Mensaje chat: ${mensaje}`,'incoming')
      }
    } catch (error) {
      console.error("Ha ocurrido un error", error);
    }
  })
  .addAnswer(
    "¿En que te puedo ayudar el dia de hoy? 👀",
    { capture: true },
    async (ctx, ctxFn) => {
      try {
        const { state } = ctxFn;
        const mensajeEntrante = ctx.body;
        const pluginAI = ctxFn.extensions.employeesAddon;
        const empleadoIdeal = await pluginAI.determine(mensajeEntrante);
        const nombre_cliente = datoUsuario[0].nombre_cliente;
        const primerNombre = nombre_cliente.split(" ")[0];

        /* Valida si existe un empleado ideal */
        if (!empleadoIdeal?.employee) {
          return ctxFn.fallBack(
            `Ups, lo siento no entendi que necesitas,  ¿Me podrias repetir como puedo ayudarte ${datoUsuario[0].nombre_cliente}?`
          );
        }

        /* Guarda la respuesta del chatGPT */
        await state.update({
          answer: empleadoIdeal.answer,
          history: ctx.body,
          usuario: primerNombre,
        });
        /* Envia al flow adecuado */
        pluginAI.gotoFlow(empleadoIdeal.employee, ctxFn);
      } catch (error) {
        console.log(error.error);
      }
    }
  );
