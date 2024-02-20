require("dotenv").config();
const axios = require("axios").default;
const agregarProducto = require("../adaptador/agregarproductos")
const woocommerceAxiosC = {
    baseURL: process.env.BASE_URL,
    auth: {
      username: process.env.CONSUMER_KEY,
      password: process.env.CONSUMER_SECRET,
    }
  };

try {
    const Productos =  axios.get("/products", woocommerceAxiosC);
    if (Productos.data && Array.isArray(Productos.data)) {
    
      for (const item of Productos.data) {
        const producto = {
          titulo: item.name,
          descripcion: item.description,
          linkproducto: item.permalink,
          precio: item.price,
        };
        console.log(producto)
        /* agregarProducto(producto) */
      }
     
    } else {
      console.log("No se encontraron productos.");
    }
  } catch (error) {
    console.error(error);
  }