"use strict";

const { getDb } = require("./shared/mongodb");

const COLLECTION_NAME = "pets";
const REQUIRED_FIELDS = [
  "id",
  "nome",
  "especie",
  "raca",
  "sexo",
  "cor",
  "cidade",
  "telefone",
  "status",
  "fotoUrl",
];

function normalizePetPayload(payload) {
  // Normaliza entradas do formulário antes de gravar no banco.
  return {
    id: String(payload.id || `pet-${Date.now()}`).trim(),
    nome: String(payload.nome || "").trim(),
    especie: String(payload.especie || "").trim(),
    raca: String(payload.raca || "").trim(),
    sexo: String(payload.sexo || "").trim(),
    cor: String(payload.cor || "").trim(),
    cidade: String(payload.cidade || "").trim(),
    telefone: String(payload.telefone || "").trim(),
    status: String(payload.status || "").trim(),
    fotoUrl: String(payload.fotoUrl || "").trim(),
  };
}

function isValidPet(pet) {
  return REQUIRED_FIELDS.every((field) => Boolean(pet[field]));
}

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Método não permitido.",
      }),
    };
  }

  try {
    const payload = JSON.parse(event.body || "{}");
    const pet = normalizePetPayload(payload);

    if (!isValidPet(pet)) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          error: "Dados do pet incompletos.",
        }),
      };
    }

    const db = await getDb();
    const documentToInsert = {
      ...pet,
      createdAt: new Date().toISOString(),
    };

    await db.collection(COLLECTION_NAME).insertOne(documentToInsert);

    return {
      statusCode: 201,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pet: documentToInsert,
      }),
    };
  } catch (error) {
    console.error("Erro ao cadastrar pet:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Não foi possível salvar o cadastro no momento.",
      }),
    };
  }
};
