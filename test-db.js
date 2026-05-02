import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  tls: true,
  tlsAllowInvalidCertificates: true,
  serverSelectionTimeoutMS: 5000,
});

async function run() {
  try {
    console.log("Attempting to connect to:", uri.replace(/:([^@]+)@/, ":****@"));
    await client.connect();
    console.log("Connected successfully to server");
    const ping = await client.db("admin").command({ ping: 1 });
    console.log("Ping response:", ping);
  } catch (err) {
    console.error("Connection error detail:", err);
    if (err.cause) console.error("Cause:", err.cause);
  } finally {
    await client.close();
  }
}
run();
