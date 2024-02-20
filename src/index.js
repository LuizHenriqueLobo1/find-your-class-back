import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import { getAuthSheets } from './api/api.js';
import { getDataOfDatabase, updateDataOnDatabase } from './db/db.js';
import { getData, getFormattedData } from './service/service.js';

config();

const app = express();
const PORT = process.env.PORT || 8081;

app.use(express.json());
app.use(cors());

app.get('/', async (_, res) => {
  res.status(200).send({ message: 'All right here!' });
});

app.get('/get-sheet-data', verifyToken, async (_, res) => {
  try {
    const data = await getDataOfDatabase().catch((_) => []);
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send({ message: 'Internal server error!', error });
  }
});

app.post('/get-sheet-data-to-calendar', verifyToken, async (req, res) => {
  try {
    const { disciplines } = req.body;
    if (!disciplines || !disciplines.length) {
      return res.status(400).send({ message: 'Invalid request body!' });
    }
    const data = await getDataOfDatabase().catch((_) => []);
    const filteredData = [];
    for (const discipline of disciplines) {
      for (const element of data) {
        if (element[element.day].includes(discipline)) {
          filteredData.push(element);
        }
      }
    }
    res.status(200).send(filteredData);
  } catch (error) {
    res.status(500).send({ message: 'Internal server error!', error });
  }
});

app.get('/update-database', async (req, res) => {
  if (req.headers['Authorization'] !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).send('Unauthorized!');
  }
  try {
    const data = await getFinalData().catch((_) => []);
    const response = await updateDataOnDatabase(data);
    res.status(response ? 200 : 400).send(response);
  } catch (error) {
    res.status(500).send({ message: 'Internal server error!', error });
  }
});

async function getFinalData() {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });

  const blocks = process.env.BLOCKS.split(',');

  const dataArray = [];
  for (const block of blocks) {
    const content = await googleSheets.spreadsheets.values
      .get({
        auth,
        spreadsheetId,
        range: block,
      })
      .catch((error) => {
        console.error({ message: 'Erro ao tentar obter os dados da planilha!', error });
        return null;
      });
    if (!content.data.values.length) {
      return [];
    }
    const data = getData(content.data.values, block);
    dataArray.push(data);
  }
  return getFormattedData(dataArray.flatMap((element) => element));
}

function verifyToken(req, res, next) {
  const { token } = req.headers;
  if (token !== process.env.SECRET) {
    return res.status(401).send({ message: 'Unauthorized!' });
  }
  return next();
}

app.listen(PORT, () => console.log(`Server open on port ${PORT}!`));
