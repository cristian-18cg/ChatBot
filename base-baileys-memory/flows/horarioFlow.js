const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const { PROMPHORARIO } = require("../Promps/promp_horario");
const ChatGPTClass = require("../chatgpt.class");

const info_sedes = require("../Documentos/horario")

const ChatGPTInstance = new ChatGPTClass();
const texto = JSON.stringify(info_sedes);

const generatePrompHorario = (history,pregunta,texto) => {
  return PROMPHORARIO.replace('{DOCUMENTOS}', texto).replace('{RESPUESTA_C}',history).replace('{PREGUNTA}',pregunta)
}


module.exports = addKeyword(EVENTS.ACTION)
.addAction(async(_,{state,flowDynamic,fallBack})=>{
  respuestaChat = state.getMyState()
 /*  await flowDynamic (respuestaChat.answer) */
  const PROMP = generatePrompHorario(respuestaChat.answer, respuestaChat.history,texto) 
  /* console.log(PROMP) */
  const response = await ChatGPTInstance.handleMsgChatGPT(PROMP);
  const message = response.text;
  console.log(message)
}).addAnswer('Que información sobre nuestras sedes necesitas?', {capture:true}, 
async(ctx,{flowDynamic,fallBack})=>{
  const response = await ChatGPTInstance.handleMsgChatGPT(ctx.body);
  const message = response.text;
  if (ctx.body.toString() !==  "No") {

    return fallBack(message);
  }
})
  
