const { addKeyword, EVENTS } = require("@bot-whatsapp/bot");
const axios = require("axios").default;

/* const baseURL = process.env.BASE_URL;
const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET; */

const formatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP'
});

module.exports = addKeyword(["productos", "produ", "3"]).addAnswer(
  "Consultando productos...",
  null,
  async (ctx, { flowDynamic, extensions}) => {
    try {
      /* Conexion con api woocommerce */
      const woocomerceCredenciales=extensions.woocommerceAxiosC
      /* Guardar en respuesta los productos */


      const Productos = await axios.get("/products", woocomerceCredenciales);
      const pedidos = await axios.get("/orders", woocomerceCredenciales);


      console.log(pedidos.data)
      /* imprimir todos los datos
      console.log(respuesta.data); */

      /* contador productos */
      let contador = 10;

      for (const item of Productos.data) {
        console.log(item.name);
        if (contador > 15) break; /* Llega hasta 5 productos y para */
        contador++;
        producto = {
          titulo: item.name,
          precio: formatter.format(item.price),
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


