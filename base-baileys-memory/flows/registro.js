const { addKeyword } = require("@bot-whatsapp/bot");



let GLOBAL_STATE = {};

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

module.exports = addKeyword(["1"])
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