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
  if (!data || !data.length) {
    return false;
  }
  try {
    await client.connect();
    const session = client.startSession();
    try {
      session.startTransaction();

      const db = client.db(process.env.DB_NAME);
      const collection = db.collection(process.env.COLLECTION_NAME);
      const logsCollection = db.collection('logs');

      const deleteResponse = await collection.deleteMany({}, { session });

      const insertResponse = await collection.insertMany(data, { session });

      await logsCollection.insertOne(
        {
          dateTime: new Date(),
          deletedCount: deleteResponse.deletedCount,
          insertedCount: insertResponse.insertedCount,
          environment: process.env.ENVIRONMENT,
        },
        { session }
      );

      await session.commitTransaction();

      console.log('✅ - Transação concluída com sucesso!');
      return true;
    } catch (error) {
      await session.abortTransaction();
      console.log('Erro na transação: ' + error);
      return false;
    } finally {
      session.endSession();
    }
  } catch (error) {
    console.log('Erro na conexão: ' + error);
    return false;
  } finally {
    await client.close();
  }
}
