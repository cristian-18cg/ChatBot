const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017/chatbot_curso_mongo';
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

const client = new MongoClient(uri, options);

async function conectarDB() {
  try {
    await client.connect();
    console.log('Conectado a MongoDB');
    return client.db('tu_basedatos');
  } catch (error) {
    console.error('Error al conectar a MongoDB:', error);
    throw error;
  }
}

function cerrarConexion() {
  return client.close();
}

module.exports = { conectarDB, cerrarConexion };
