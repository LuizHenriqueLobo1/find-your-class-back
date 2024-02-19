import { config } from 'dotenv';
import { MongoClient, ServerApiVersion } from 'mongodb';

config();

const client = new MongoClient(process.env.DB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

export async function getDataOfDatabase() {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(process.env.COLLECTION_NAME);
    const data = await collection
      .find({})
      .toArray()
      .catch((_) => []);
    const finalData = data.map((element) => {
      delete element._id;
      return element;
    });
    return finalData;
  } finally {
    await client.close();
  }
}

export async function updateDataOnDatabase(data) {
  console.log(`🔔 - Atualizando dados...`);
  if (!data || !data.length) {
    console.log(`⚠️ - Erro ao tentar obter os dados da planilha!`);
    return;
  }
  const deleteResponse = await deleteDataOfDatabase();
  if (deleteResponse) {
    const insertResponse = await insertDataOnDatabase(data);
    if (insertResponse) {
      console.log(`✅ - Sucesso ao inserir os novos dados no banco!`);
    } else {
      console.log(`❌ - Houve um problema ao tentar inserir os novos dados no banco!`);
    }
  } else {
    console.log(`⚠️ - Erro ao tentar excluir os dados antigos no banco!`);
  }
}

async function insertDataOnDatabase(data) {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(process.env.COLLECTION_NAME);
    return await collection
      .insertMany(data)
      .then((_) => true)
      .catch((_) => false);
  } finally {
  }
}

async function deleteDataOfDatabase() {
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME);
    const collection = db.collection(process.env.COLLECTION_NAME);
    return await collection
      .deleteMany()
      .then((_) => true)
      .catch((_) => false);
  } finally {
    await client.close();
  }
}
