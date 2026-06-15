"use strict";

const { getDb } = require("./shared/mongodb");

const COLLECTION_NAME = "pets";

exports.handler = async function handler(event) {
  if (event.httpMethod !== "GET") {
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
    const db = await getDb();
    // O feed principal mostra os pets mais recentes primeiro.
    const pets = await db
      .collection(COLLECTION_NAME)
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const normalizedPets = pets.map((pet) => ({
      id: pet.id || String(pet._id),
      nome: pet.nome || "",
      especie: pet.especie || "",
      raca: pet.raca || "",
      sexo: pet.sexo || "",
      cor: pet.cor || "",
      cidade: pet.cidade || "",
      telefone: pet.telefone || "",
      status: pet.status || "",
      fotoUrl: pet.fotoUrl || "",
      createdAt: pet.createdAt || null,
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        pets: normalizedPets,
      }),
    };
  } catch (error) {
    console.error("Erro ao listar pets:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: "Não foi possível carregar os pets no momento.",
      }),
    };
  }
};
