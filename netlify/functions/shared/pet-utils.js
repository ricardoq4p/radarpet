"use strict";

const VALID_SPECIES = new Set(["Cachorro", "Gato", "Outro"]);
const VALID_SEXES = new Set(["Macho", "Femea"]);
const VALID_STATUSES = new Set(["Perdido", "Encontrado", "Disponivel"]);
const CLOUDINARY_HOST_PREFIX = "https://res.cloudinary.com/daw3up5vu/";

function normalizePhone(phone) {
  return String(phone || "").replace(/\D/g, "");
}

function normalizeChoice(value) {
  return String(value || "")
    .trim()
    .replace("Fêmea", "Femea")
    .replace("FÃªmea", "Femea")
    .replace("Disponível", "Disponivel")
    .replace("DisponÃ­vel", "Disponivel");
}

function maskPhone(phone) {
  const digits = normalizePhone(phone);
  if (digits.length < 4) {
    return "Contato protegido";
  }

  const prefix = digits.slice(0, Math.min(2, digits.length));
  const suffix = digits.slice(-2);
  const hiddenSize = Math.max(digits.length - (prefix.length + suffix.length), 2);
  return `${prefix}${"*".repeat(hiddenSize)}${suffix}`;
}

function normalizePetPayload(payload) {
  return {
    id: String(payload.id || `pet-${Date.now()}`).trim(),
    nome: String(payload.nome || "").trim(),
    nomeTutor: String(payload.nomeTutor || "").trim(),
    especie: normalizeChoice(payload.especie || ""),
    raca: String(payload.raca || "").trim(),
    sexo: normalizeChoice(payload.sexo || ""),
    cor: String(payload.cor || "").trim(),
    cidade: String(payload.cidade || "").trim(),
    telefone: normalizePhone(payload.telefone || ""),
    status: normalizeChoice(payload.status || ""),
    fotoUrl: String(payload.fotoUrl || "").trim(),
    website: String(payload.website || "").trim(),
  };
}

function isAllowedLength(value, min, max) {
  return value.length >= min && value.length <= max;
}

function isValidPhotoUrl(url) {
  return url.startsWith(CLOUDINARY_HOST_PREFIX);
}

function validatePet(pet) {
  if (pet.website) return "Cadastro invalido.";
  if (!isAllowedLength(pet.id, 5, 80)) return "Identificador invalido.";
  if (!isAllowedLength(pet.nome, 2, 80)) return "Nome invalido.";
  if (!isAllowedLength(pet.nomeTutor, 2, 80)) return "Nome do tutor invalido.";
  if (!VALID_SPECIES.has(pet.especie)) return "Especie invalida.";
  if (!isAllowedLength(pet.raca, 2, 80)) return "Raca invalida.";
  if (!VALID_SEXES.has(pet.sexo)) return "Sexo invalido.";
  if (!isAllowedLength(pet.cor, 2, 50)) return "Cor invalida.";
  if (!isAllowedLength(pet.cidade, 2, 80)) return "Cidade invalida.";
  if (!(pet.telefone.length >= 10 && pet.telefone.length <= 13)) return "Telefone invalido.";
  if (!VALID_STATUSES.has(pet.status)) return "Status invalido.";
  if (!isValidPhotoUrl(pet.fotoUrl)) return "Foto invalida.";
  return null;
}

function toPublicPet(pet) {
  return {
    id: pet.id || String(pet._id || ""),
    nome: pet.nome || "",
    nomeTutor: pet.nomeTutor || "",
    especie: pet.especie || "",
    raca: pet.raca || "",
    sexo: pet.sexo || "",
    cor: pet.cor || "",
    cidade: pet.cidade || "",
    telefoneMascara: maskPhone(pet.telefone || ""),
    status: pet.status || "",
    fotoUrl: pet.fotoUrl || "",
    createdAt: pet.createdAt || null,
  };
}

module.exports = {
  maskPhone,
  normalizePetPayload,
  toPublicPet,
  validatePet,
};
