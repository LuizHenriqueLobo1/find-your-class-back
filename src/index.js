const { google } = require('googleapis');
require('dotenv').config();

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

async function run() {
  const { googleSheets, auth, spreadsheetId } = await getAuthSheets();

  const metadata = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });

  const content = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: 'BLOCO A ' // Página da planilha desejada...
  });

  console.log(content.data.values)
}

run()
