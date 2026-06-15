"use strict";

const { getDb } = require("./shared/mongodb");
const { toPublicPet } = require("./shared/pet-utils");
const { buildHeaders } = require("./shared/security");

const COLLECTION_NAME = "pets";

exports.handler = async function handler(event) {
  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: buildHeaders(),
      body: JSON.stringify({
        error: "Metodo nao permitido.",
      }),
    };
  }

  try {
    const db = await getDb();
    const pets = await db
      .collection(COLLECTION_NAME)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return {
      statusCode: 200,
      headers: buildHeaders(),
      body: JSON.stringify({
        pets: pets.map(toPublicPet),
      }),
    };
  } catch (error) {
    console.error("Erro ao listar pets:", error);

    return {
      statusCode: 500,
      headers: buildHeaders(),
      body: JSON.stringify({
        error: "Nao foi possivel carregar os pets no momento.",
      }),
    };
  }
};
