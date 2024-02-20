const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const registro = require("./registro");
const { conectarDB, cerrarConexion } = require("../adaptador/adapMongo");
const { delay } = require("@whiskeysockets/baileys");

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
    try {
      await flowDynamic(
        "Hola, bienvenido(a) a *Nacional de Electricos*. \n ⏳ Estamos consultando si estas registrado(a) en nuestra base de datos.⌛"
      );
      datoUsuario = await obtenerDatos(ctx.from);
      console.log(datoUsuario);

      if (datoUsuario.length === 0) {
        return gotoFlow(registro);
      } else
        await flowDynamic(
          `Hola *${datoUsuario[0].nombre_cliente}* 🙋🏻, ¿como te encuentras?`
        );
    } catch (error) {
      console.error("Ha ocurrido un error", error);
    }
  })
  .addAnswer(
    "¿En que te podemos ayudar el dia de hoy?",
    { capture: true },
    async (ctx, ctxFn) => {
      const { state } = ctxFn;
      const mensajeEntrante = ctx.body;
      const pluginAI = ctxFn.extensions.employeesAddon;
      const empleadoIdeal = await pluginAI.determine(mensajeEntrante);
      /*     console.log(pluginAI) */
      /* console.log(empleadoIdeal); */

      /* Valida si existe un empleado ideal */
      if (!empleadoIdeal?.employee) {
        return ctxFn.flowDynamic(
          "Ups lo siento no te entiendo ¿Como puedo ayudarte?"
        );
      }
      /* Guarda la respuesta del chatGPT */
      await state.update({
        answer: empleadoIdeal.answer,
        history: ctx.body,
        usuario: datoUsuario[0].nombre_cliente,
      });
      /* Envia al flow adecuado */
      pluginAI.gotoFlow(empleadoIdeal.employee, ctxFn);

      /* console.log(prueba) */
    }
  );
