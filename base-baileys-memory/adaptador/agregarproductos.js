const { conectarDB, cerrarConexion } = require('./adapMongo');

async function productoExiste(coleccion, nuevoProducto) {
  // Verifica si existe un producto con el mismo nombre
  const productoExistente = await coleccion.findOne({ titulo: nuevoProducto.titulo });

  return productoExistente !== null;
}

async function agregarProducto(nuevoProducto) {
  let db;
  try {
    db = await conectarDB();

    // Obtén la colección
    const coleccion = db.collection('productos');

    // Verifica si el producto ya existe
    const existe = await productoExiste(coleccion, nuevoProducto);

    if (existe) {
      console.log('El producto ya existe. No se puede agregar duplicados.');
      return;
    }

    // Inserta el nuevo producto
    await coleccion.insertOne(nuevoProducto);

    console.log('Producto agregado correctamente:', nuevoProducto);
  } catch (error) {
    console.error('Error al agregar producto a MongoDB:', error);
  } 
}

module.exports = agregarProducto;
