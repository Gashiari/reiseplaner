import { MongoClient } from 'mongodb';
import 'dotenv/config';

const uri = process.env.DB_URI; // Verwendet die Umgebungsvariable DB_URI
const client = new MongoClient(uri);

export const connectToDB = async () => {
  if (!client.isConnected) await client.connect();
  return client.db(); // Die Datenbank wird direkt aus der URI verwendet
};
