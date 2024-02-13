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



/* Credenciales woocommerce */
const baseURL = process.env.BASE_URL;
const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET;
let GLOBAL_STATE = {};
let confirmar = 0;

const guardarInfo = (datosEntrantes) => {
  let config = {
    method: "post",
    maxBodyLength: Infinity,
    url: "https://api-zqyex.strapidemo.com/api/tiendas",
    headers: {
      "Content-Type": "application/json",
      Authorization:
        "Bearer 86de8da08725f4131de7db4b427cf12d17ffa14d3f2b5b161929c2fa1c6c00d8fb0f31a257f572ba4d7080ed3eb31cbb99119aeadd1f51034f70374b72a5a0c494955b2f785905c51a8178e8bd8d5ce718c31eaa37b6ea21f4143f90d9fbc4a2f8f60ec57939053f34f1b3dd1b92d625c0051e61ea6c4bfc39a076cceb8052e0",
    },
    data: JSON.stringify({
      data: datosEntrantes,
    }),
  };

  axios
    .request(config)
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });
};

const productos = addKeyword(["productos", "produ", "3"]).addAnswer(
  "Consultando productos...",
  null,
  async (ctx, { flowDynamic }) => {
    try {
      /* Conexion con api woocommerce */
      const axiosConfig = {
        baseURL: process.env.BASE_URL,
        auth: {
          username: process.env.CONSUMER_KEY,
          password: process.env.CONSUMER_SECRET,
        },
      };
      /* Guardar en respuesta los productos */
      const respuesta = await axios.get("/products", axiosConfig);

      /* imprimir todos los datos
      console.log(respuesta.data); */

      /* contador productos */
      let contador = 1;

      for (const item of respuesta.data) {
        console.log(item.name);
        if (contador > 5) break; /* Llega hasta 5 productos y para */
        contador++;
        producto = {
          titulo: item.name,
          precio: item.price,
          linkproducto: item.permalink,
          imagen:
            item.images.length > 0
              ? item.images[0].src
              : "No hay imagen disponible",
        };
        await flowDynamic([
          {
            body: `*Nombre producto*: ${producto.titulo} '\n*Precio producto*:  ${producto.precio}\n*url producto*:  ${producto.linkproducto}`,
            media: producto.imagen,
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      await flowDynamic("Ha ocurrido un error");
    }
  }
);

/*SENSITIVE sensible a mayusculas y minusculas, se pone mas restrictivo */
const registro = addKeyword(["1"])
  .addAnswer("      📃 *FORMULARIO DE REGISTRO* 📃")
  .addAnswer("Por favor completa estos datos para darte la mejor asesoria. 😃 ")
  .addAnswer("🛑 Digita *ccl* para *CANCELAR* el proceso en cualquier paso. 🛑")
  .addAnswer(
    "Digita tu *nombre*:",
    { capture: true },
    async (ctx, { endFlow }) => {
      if (ctx.body.toLowerCase() === "ccl") {
        /* await flowDynamic('✖ Has cancelado el proceso. ✖') */
        return endFlow({ body: "✖ Has cancelado el proceso. ✖" });
      } else {
        GLOBAL_STATE[ctx.from] = {
          nombre_cliente: ctx.body,
          nombre_empresa: "",
          numero: ctx.from,
          documento: "",
          correo: "",
        };
      }
    }
  )
  .addAnswer(
    "Digita el *nombre* de tu empresa",
    { capture: true },
    async (ctx, { endFlow }) => {
      if (ctx.body.toLowerCase() === "ccl") {
        return endFlow({ body: "✖ Has cancelado el proceso. ✖" });
      } else {
        GLOBAL_STATE[ctx.from].nombre_empresa = ctx.body;
      }
    }
  )
  .addAnswer(
    "Digita el *numero* de tu documento de identidad",
    { capture: true },
    async (ctx, { fallBack, flowDynamic, endFlow }) => {
      const regexDocumentoIdentidad = /^\d{8,10}$/;
      if (ctx.body.toLowerCase() === "ccl") {
        return endFlow({ body: "✖ Has cancelado el proceso. ✖" });
      } else if (regexDocumentoIdentidad.test(ctx.body)) {
        GLOBAL_STATE[ctx.from].documento = ctx.body;
        /* guardarInfo(GLOBAL_STATE[ctx.from]);*/
      } else {
        await flowDynamic(
          "Numero de documento *no valido*.\nDigita un numero *minimo* 8 digitios *maximo* 10."
        );
        return fallBack();
      }
    }
  )
  .addAnswer(
    "Digita tu correo electronico",
    { capture: true },
    async (ctx, { flowDynamic, fallBack, endFlow }) => {
      var validCorreo = /(^[a-zA-Z0-9_.-]+[@]{1}[a-z0-9]+[.][a-z]+$)/gm;
      if (ctx.body.toLowerCase() == "ccl") {
        return endFlow({ body: "✖ Has cancelado el proceso. ✖" });
      } else if (validCorreo.test(ctx.body)) {
        GLOBAL_STATE[ctx.from].correo = ctx.body;
        guardarInfo(GLOBAL_STATE[ctx.from]);
        await flowDynamic(
          `Hemos guardado tu información *${
            GLOBAL_STATE[ctx.from].nombre_cliente
          }*.`
        );
      } else {
        await flowDynamic("Correo electronico no valido.");
        return fallBack();
      }
    }
  );

const inicioChat = addKeyword(EVENTS.WELCOME)
  .addAnswer("⚡⚡ Hola, welcome a Nacional de Electricos ⚡⚡")
  .addAnswer(
    "📑 *MENÚ* 📑 \n*1.* Registo \n*2.* Solicitud de compra\n*3.* Productos\n*4.* Contactar con un experto\n*5.* Información de mi pedido",null,null,
    [registro, productos]
  );



const main = async () => {
  /* adaptador base de datos  */
  const adapterDB = new MockAdapter();
  /* adaptador flujos de conversacion  */
/*   const adapterFlow = createFlow([inicioChat]); */

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
