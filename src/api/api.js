import { google } from 'googleapis';

export async function getAuthSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
    },
    scopes: process.env.SCOPES.split(','),
  });

  const client = await auth.getClient();

  const googleSheets = google.sheets({
    version: 'v4',
    auth: client,
  });

  const drive = google.drive({ version: 'v2', auth });

  return {
    auth,
    googleSheets,
    drive,
  };
}
