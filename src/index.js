import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import fs from 'fs';
import { v4 } from 'uuid';
import { getAuthSheets } from './api/api.js';
import { getDataOfDatabase, getLastLog, getLogs, updateDataOnDatabase } from './db/db.js';
import { getData, getFormattedData } from './service/service.js';

config();

const app = express();
const PORT = process.env.PORT || 8081;

app.use(express.json());
app.use(cors());

app.get('/', async (_, res) => {
  res.status(200).send({ message: 'All right here!' });
});

app.get('/get-sheet-data', verifyToken, async (req, res) => {
  try {
    const { page, pageSize } = req.query;
    const data = await getDataOfDatabase(page, pageSize).catch((_) => []);
    res.status(200).send(data);
  } catch (error) {
    res.status(500).send({ message: 'Internal server error!', error });
  }
});

app.get('/update-database', async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).send({ message: 'Unauthorized!' });
  }
  try {
    const data = await getFinalData();
    const response = await updateDataOnDatabase(data);
    res.status(response ? 200 : 400).send({ success: response });
  } catch (error) {
    res.status(500).send({ message: 'Internal server error!', error });
  }
});

app.get('/get-logs', verifyToken, async (req, res) => {
  try {
    const data = await getLogs().catch((_) => []);
    return res.status(200).send(data);
  } catch (error) {
    res.status(500).send({ message: 'Internal server error!', error });
  }
});

app.get('/get-last-log', verifyToken, async (req, res) => {
  try {
    const data = await getLastLog().catch((_) => null);
    return res.status(200).send(data);
  } catch (error) {
    res.status(500).send({ message: 'Internal server error!', error });
  }
});

async function getFinalData() {
  const baseSheetId = process.env.SHEET_ID;

  const { auth, drive, googleSheets } = await getAuthSheets();

  const filePath = `./tmp/temp.xlsx`;
  const dest = fs.createWriteStream(filePath);

  // Baixa o arquivo .xlsx
  await drive.files.get({ fileId: baseSheetId, alt: 'media' }, { responseType: 'stream' }).then(
    (res) =>
      new Promise((resolve, reject) => {
        res.data
          .on('end', () => resolve())
          .on('error', (err) => reject(err))
          .pipe(dest);
      })
  );

  // Cria a planilha no formato correto
  const response = await drive.files.insert({
    requestBody: {
      title: v4(),
      mimeType: 'application/vnd.google-apps.spreadsheet',
    },
    media: {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      body: fs.createReadStream(filePath),
    },
    fields: 'id, webViewLink',
  });
  if (response.status !== 200 || !response.data || !response.data.id) return;

  const fileId = response.data.id;

  fs.unlinkSync(filePath);

  const spreadsheet = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId: fileId,
  });
  if (spreadsheet.status !== 200) return;

  const pages = spreadsheet.data.sheets.map(({ properties }) => properties.title);

  const dataArray = [];
  for (const block of pages) {
    const content = await googleSheets.spreadsheets.values
      .get({
        auth,
        spreadsheetId: fileId,
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

  await drive.files.delete({ fileId });

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
