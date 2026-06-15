"use strict";

const { getDb } = require("./shared/mongodb");
const {
  CONTACT_LIMIT,
  buildHeaders,
  enforceRateLimit,
  getClientIp,
} = require("./shared/security");

const COLLECTION_NAME = "pets";

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: buildHeaders(),
      body: JSON.stringify({
        error: "Metodo nao permitido.",
      }),
    };
  }

  try {
    const ip = getClientIp(event.headers || {});
    if (!enforceRateLimit(ip, "get-pet-contact", CONTACT_LIMIT)) {
      return {
        statusCode: 429,
        headers: buildHeaders(),
        body: JSON.stringify({
          error: "Muitas tentativas. Aguarde alguns minutos.",
        }),
      };
    }

    const payload = JSON.parse(event.body || "{}");
    const petId = String(payload.id || "").trim();

    if (!petId) {
      return {
        statusCode: 400,
        headers: buildHeaders(),
        body: JSON.stringify({
          error: "Pet invalido.",
        }),
      };
    }

    const db = await getDb();
    const pet = await db.collection(COLLECTION_NAME).findOne(
      { id: petId },
      { projection: { _id: 0, telefone: 1 } }
    );

    if (!pet?.telefone) {
      return {
        statusCode: 404,
        headers: buildHeaders(),
        body: JSON.stringify({
          error: "Contato nao encontrado.",
        }),
      };
    }

    return {
      statusCode: 200,
      headers: buildHeaders(),
      body: JSON.stringify({
        telefone: String(pet.telefone),
      }),
    };
  } catch (error) {
    console.error("Erro ao carregar contato:", error);

    return {
      statusCode: 500,
      headers: buildHeaders(),
      body: JSON.stringify({
        error: "Nao foi possivel carregar o contato no momento.",
      }),
    };
  }
};
