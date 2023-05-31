import { config } from 'dotenv';
import express from 'express';
import { getFinalData } from './service/service.js';
import { getAuthSheets } from './api/api.js';

config();

const app = express();
const PORT = process.env.PORT || 8081;

app.use(express.json());

app.post("/", verifyToken, async (req, res) => {
  const { block } = req.body;
  
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();
  
  await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });

  const content = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: block // Página da planilha desejada...
  });

  const rawData = content.data.values;

  const finalData = getFinalData(rawData, block);

  res.status(200).send({ message: "OK!", data: finalData });
});

function verifyToken(req, res, next) {
  const { token } = req.body;
  if(token !== process.env.SECRET) {
    return res.status(401).send({ message: "Unauthorized!" });
  }
  return next();
}

app.listen(PORT, () => console.log(`Server open on port ${PORT}!`));
