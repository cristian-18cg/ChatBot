const { conectarDB, cerrarConexion } = require('./adapMongo');

async function productoExiste(coleccion, nuevoUsuario) {
  // Verifica si existe un producto con el mismo nombre
  const usuarioExistente = await coleccion.findOne({ numero: nuevoUsuario.numero });

  return usuarioExistente !== null;
}

async function agregarUsuario(nuevoUsuario) {
  let db;
  try {
    db = await conectarDB();

    // Obtén la colección
    const coleccion = db.collection('usuarios');

    // Verifica si el producto ya existe
    const existe = await productoExiste(coleccion, nuevoUsuario);

    if (existe) {
      console.log('El usuario ya existe. No se puede agregar duplicados.');
      return;
    }

    // Inserta el nuevo usuario
    await coleccion.insertOne(nuevoUsuario);

    console.log('Usuario agregado correctamente:', nuevoUsuario);
  } catch (error) {
    console.error('Error al agregar usuario a MongoDB:', error);
  } 
}

module.exports = agregarUsuario;
