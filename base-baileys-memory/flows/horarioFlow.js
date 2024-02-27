const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { PROMPHORARIO } = require("../Promps/promp_horario");
const ChatGPTClass = require("../chatgpt.class");

const info_sedes = require("../Documentos/horario");

const ChatGPTInstance = new ChatGPTClass();
const texto = JSON.stringify(info_sedes);

const generatePrompHorario = (history, pregunta, texto) => {
  return PROMPHORARIO.replace("{DOCUMENTOS}", texto)
    .replace("{RESPUESTA_C}", history)
    .replace("{PREGUNTA}", pregunta);
};

module.exports = addKeyword(EVENTS.ACTION)
  .addAction(async (_, { state, flowDynamic, fallBack }) => {
    respuestaChat = state.getMyState();
    /*  await flowDynamic (respuestaChat.answer) */
    const PROMP = generatePrompHorario(
      respuestaChat.answer,
      respuestaChat.history,
      texto
    );
    /* console.log(PROMP) */
    const response = await ChatGPTInstance.handleMsgChatGPT(PROMP);
    const message = response.text;
    console.log(message);
  })
  .addAnswer(
    "¿Me podrias especificar que información sobre nuestras sedes necesitas?",
    { capture: true },
    async (ctx, { state, flowDynamic, fallBack }) => {
      try{
      const State = state.getMyState();
      const response = await ChatGPTInstance.handleMsgChatGPT(ctx.body);
      const message = response.text;
      if (ctx.body.toString() !== "No") {
        return fallBack(message);
      } else {
        await flowDynamic(`Fue un gusto ayudarte *${State.usuario}*, espero vuelvas pronto. 🙋🏻👋🏻`);
      }
    }catch (error) {
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
  );
