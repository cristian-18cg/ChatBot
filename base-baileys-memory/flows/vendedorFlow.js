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
    const palabrasArray = palabraBuscada.split(" ");

    // Crea un array de condiciones para el operador $or
    const condicionesOR = palabrasArray.map((palabra) => ({
      $or: [
        { titulo: { $regex: palabraBuscada, $options: "i" } },
        { titulo: { $regex: palabra, $options: "i" } },
        { descripcion: { $regex: palabra, $options: "i" } },
      ],
    }));

    // Realiza la consulta utilizando el operador $or
    const datos = await coleccion
      .find({ $or: condicionesOR })
      .limit(10)
      .toArray();

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
const generatePrompVendedor = (usuario, pregunta, produ) => {
  return PROMPVENDEDOR.replace("{PRODUCTOS}", produ)
    .replace("{NOMBRE}", usuario)
    .replace("{PREGUNTA}", pregunta);
};

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function limpiarCadena(cadena) {
  if (typeof cadena === "string") {
    return cadena
      .replace(/\n/g, "")
      .replace(/<\/?p>/g, "")
      .replace(/<br\s*\/?>/g, "")
      .replace(/['"]/g, "");
  } else {
    return cadena;
  }
}
let contador = true;
module.exports = addKeyword("ventas")
  .addAction(
    { capture: false },
    async (ctx, { state, flowDynamic, extensions, fallBack, gotoFlow }) => {
      try {
        const respuestaChat = state.getMyState();
        const PROMP_1 = generatePrompBusqueda(respuestaChat.history);
        const response_1 = await ChatGPTInstance.handleMsgChatGPT(PROMP_1);
        console.log(response_1.detail.usage)
        /* await flowDynamic(`Producto buscado: ${response_1.text}`); */
        console.log(`Producto buscado: ${response_1.text}`);
        /* Consulta base de datos productos */
        const datos = await obtenerDatos(response_1.text);
        if (datos.length === 0) {
          await flowDynamic("No encontre ese producto 😔");
          return gotoFlow(bienvenida, 1);
        }
        /* Convertimos a los datos que necesitamos */
        const productos = Object.values(datos).map(
          ({ id, titulo, descripcion, linkproducto, precio }) => ({
            id,
            titulo,
            descripcion,
            linkproducto,
            precio,
          })
        );
        const texto = JSON.stringify(productos);
        const datosLimpios = JSON.parse(texto).map((item) => {
          return {
            ...item,
            descripcion: limpiarCadena(item.descripcion),
          };
        });
        const texto_Json = JSON.stringify(datosLimpios);
        /* Cambiamos las variables del PROMP */
        const PROMP = generatePrompVendedor(
          respuestaChat.usuario,
          respuestaChat.history,
          texto_Json
        );
        /* console.log(PROMP); */
        /* Enviamos el segundo mensaje entrenando al bot */
        const respuesta = await ChatGPTInstance.handleMsgChatGPT(PROMP);
        console.log(respuesta.text);/*  */
        console.log(respuesta.detail.usage);

        if (respuesta.text.toLowerCase() !== "ok") {
          const respuesta_2 = await ChatGPTInstance.handleMsgChatGPT(PROMP);
          console.log("No se entreno bien");
          console.log(respuesta_2.text);
        }
      } catch (error) {
        console.log(error)
        await flowDynamic(
          "⏱️ Permiteme un momento mientras proceso tu solicitud, *no respondas nada* por el momento. ⏱️"
        );
        await delay(21000);
        const response = await ChatGPTInstance.handleMsgChatGPT(ctx.body);
        const message = response.text;
        await flowDynamic("¡Listo!");
        return fallBack(message);
        
      }
    }
  )
  .addAnswer(
    "¿Que información puntual buscas sobre este producto?",
    { capture: true },
    async (ctx, { state, fallBack, flowDynamic, gotoFlow }) => {
      const State = state.getMyState();

      if (contador) {
        await flowDynamic(
          `*${State.usuario}* si deseas buscar otro producto escribe *SI* en mayuscula en cualquier momento 😄.\n 
          o *NO* si quieres acabar con el proceso`
        );
        contador = false;
      }
      try {
        const response = await ChatGPTInstance.handleMsgChatGPT(ctx.body);
        console.log(response.detail.usage)
        const message = response.text;
        if (ctx.body.toString() === "SI") {
          await flowDynamic("Dime el otro producto ");
          return gotoFlow(bienvenida, 1);
        } else if (ctx.body.toString() === "agregar") {
          const link = message;
          await flowDynamic(
            `El link de tu producto ya agregado es este: ${link}`
          );
          return fallBack(message);
        } else if (ctx.body.toString() !== "NO") {
          return fallBack(message);
        } else {
          await flowDynamic(
            `Fue un gusto ayudarte *${State.usuario}*, espero vuelvas pronto. 🙋🏻👋🏻`
          );
        }
      } catch (error) {
        console.log(error)
        console.error(error.message);
        await flowDynamic(
          " ⏱️ Permiteme un momento mientras proceso tu solicitud, *no respondas nada* por el momento. ⏱️"
        );
        await delay(21000);
        const response = await ChatGPTInstance.handleMsgChatGPT(ctx.body);
        const message = response.text;
        await flowDynamic("¡Listo!");
        return fallBack(message);
      }
    }
  );
