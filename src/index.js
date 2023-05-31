import { google } from 'googleapis';
import { config } from 'dotenv';
import { getFinalData } from './service/service.js';

config();

async function getAuthSheets() {
  const auth = new google.auth.GoogleAuth({
    keyFile: './credentials.json',
    scopes: process.env.SCOPES,
  });

  const client = await auth.getClient();

  const googleSheets = google.sheets({
    version: 'v4',
    auth: client,
  });

  const spreadsheetId = process.env.SHEET_ID;

  return {
    auth,
    googleSheets,
    spreadsheetId
  };
}

async function run(block) {
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

  console.log(finalData);
}

run('BLOCO A ');
