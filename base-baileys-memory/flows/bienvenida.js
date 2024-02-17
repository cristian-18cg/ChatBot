const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const registro = require("./registro");
const productos = require("./productos");
const Info_pedido = require("./Info_pedido");

module.exports = addKeyword(EVENTS.WELCOME).addAction(
  async (ctx, ctxFn) => {
   
    const {state}=ctxFn
    const mensajeEntrante = ctx.body;
    const pluginAI = ctxFn.extensions.employeesAddon;
    const empleadoIdeal = await pluginAI.determine(mensajeEntrante);
    /*     console.log(pluginAI) */
    /* console.log(empleadoIdeal); */

    /* Valida si existe un empleado ideal */
    if(!empleadoIdeal?.employee){
      return ctxFn.flowDynamic('Ups lo siento no te entiendo ¿Como puedo ayudarte?')
    }
    /* Guarda la respuesta del chatGPT */
    await state.update({
      answer:empleadoIdeal.answer,
      history:ctx.body
    })
    /* Envia al flow adecuado */
    pluginAI.gotoFlow(empleadoIdeal.employee, ctxFn)
    /* console.log(prueba) */
  }
);
