import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import { getAuthSheets } from './api/api.js';
import { getFinalData } from './service/service.js';

config();

const app = express();
const PORT = process.env.PORT || 8081;

app.use(express.json());
app.use(cors());

app.get('/', async (_, res) => {
  res.status(200).send({ message: 'All right here!' });
});

app.get('/get-sheet-data', verifyToken, async (req, res) => {
  const { block } = req.query;

  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });

  const content = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: block,
  });

  const rawData = content.data.values;

  const finalData = getFinalData(rawData, block);

  res.status(200).send({ message: 'OK!', data: finalData });
});

function verifyToken(req, res, next) {
  const { token } = req.headers;
  if (token !== process.env.SECRET) {
    return res.status(401).send({ message: 'Unauthorized!' });
  }
  return next();
}

app.listen(PORT, () => console.log(`Server open on port ${PORT}!`));
