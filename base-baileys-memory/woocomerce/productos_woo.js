require("dotenv").config();
const axios = require("axios").default;
const agregarProducto = require("../adaptador/agregarproductos");
const woocommerceAxiosC = {
  baseURL: process.env.BASE_URL,
  auth: {
    username: process.env.CONSUMER_KEY,
    password: process.env.CONSUMER_SECRET,
  },
};

async function getProductos(page = 1, perPage = 100) {
  try {
    const response = await axios.get("/products", {
      ...woocommerceAxiosC,
      params: {
        page,
        per_page: perPage,
      },
    });

    const productos = response.data;

    console.log(productos);

    if (productos && Array.isArray(productos)) {
      for (const item of productos) {
        const producto = {
          id: item.id,
          titulo: item.name,
          descripcion: item.description,
          linkproducto: item.permalink,
          precio: item.price,
          categoria: item.categories,
        };
        console.log(producto);
        await agregarProducto(producto);
      }

      // Si hay más productos, realiza una llamada recursiva para obtener la siguiente página
      if (response.headers["x-wp-totalpages"] > page) {
        await getProductos(page + 1, perPage);
      }
    } else {
      console.log("No se encontraron productos.");
    }
  } catch (error) {
    console.error(error);
  }
}

getProductos();
