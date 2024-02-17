const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const axios = require("axios").default;

/* const baseURL = process.env.BASE_URL;
const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET; */

const formatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP'
});

const regexDocumentoIdentidad = /^\d{10}$/;
module.exports = addKeyword([
  "pedidos",
  " Información de mi pedido",
  "2",
]).addAnswer(
  "Digita el *numero de celular* registrado en la *pagina web* para asi poder buscar tu pedido. ",
  { capture: true },
  async (ctx, { flowDynamic, fallBack,extensions }) => {
    try {
      const woocomerceCredenciales=extensions.woocommerceAxiosC
      /* Guardar en respuesta los peidos */
      const respuesta = await axios.get("/orders", woocomerceCredenciales);
      console.log(respuesta.data)
      if (regexDocumentoIdentidad.test(ctx.body)) {
        await flowDynamic('⌛ Aguarda un momento estamos buscando tu informacíon... ⌛')
        for (const item of respuesta.data) {
          console.log(item.line_items)
          if (ctx.body.toString() === item.billing.phone){
            let estado = item.status
            /* Traductor de estado del pedido */
            switch (item.status) {
              case 'cancelled':
                estado= 'Pedido cancelado'
                break;
              case 'completed':
                estado ='Pedido completado'
                break;
            }
            /* Diccionario con los items a imprimir  */
            const pedido = {
                id_pedido: item.id,
                fecha_creacion: item.date_created,
                Total_pedido: formatter.format(item.total),
                nombre: item.billing.first_name+' '+ item.billing.last_name,
                direccion:item.billing.address_1,
                estado_pedido:estado
              };
              await flowDynamic([{body:`           *Información de tu pedido*\n`+
              `*Numero de pedido:* ${pedido.id_pedido}\n`+
              `*Nombre:* ${pedido.nombre}\n`+
              `*Total del pedido + envio:* ${pedido.Total_pedido}\n`+
              `*Dirección:* ${pedido.direccion}\n`+
              `*Estado del pedido:* ${pedido.estado_pedido}\n`
            }])
          }
        }
      } 
      else {
        await flowDynamic(
          "Numero de celular *no valido*.\nDigita de nuevo el numero de celular que tienes registrado en la *pagina*."
        );
        return fallBack();
      }
    } catch (error) {
      console.error(error);
      await flowDynamic("Ha ocurrido un error, vuelve a intentar");
    }
  }
);
