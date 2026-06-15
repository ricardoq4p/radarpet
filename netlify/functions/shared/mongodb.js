"use strict";

const { MongoClient } = require("mongodb");

let cachedClient;
let cachedDb;

async function getDb() {
  // Reaproveita a conexão entre invocações quentes da Function.
  if (cachedDb) {
    return cachedDb;
  }

  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB;

  if (!uri || !dbName) {
    throw new Error("As variáveis MONGODB_URI e MONGODB_DB precisam estar configuradas.");
  }

  if (!cachedClient) {
    cachedClient = new MongoClient(uri);
    await cachedClient.connect();
  }

  cachedDb = cachedClient.db(dbName);
  return cachedDb;
}

module.exports = {
  getDb,
};
