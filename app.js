"use strict";

const STORAGE_KEY = "radarpet_reports";
const state = {
  pets: { feed: [], lostFound: [], nearby: [] },
  ongs: [],
  matches: []
};

function showScreen(screenName) {
  const tabOrder = ["feed", "mapa", "achados", "match", "ongs"];
  document.querySelectorAll(".screen").forEach((screen) => screen.classList.remove("active"));
  document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
  document.querySelectorAll(".bnav-item").forEach((item) => item.classList.remove("active"));

  document.getElementById("screen-" + screenName)?.classList.add("active");
  document.querySelectorAll(".tab")[tabOrder.indexOf(screenName)]?.classList.add("active");
  document.getElementById("bnav-" + screenName)?.classList.add("active");
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function loadReports() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveReports(reports) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

async function readJson(path, fallback) {
  try {
    const response = await fetch(path);
    if (!response.ok) throw new Error(path);
    return await response.json();
  } catch {
    return fallback;
  }
}

function renderFeed() {
  const target = document.getElementById("feed-list");
  if (!target) return;
  target.innerHTML = state.pets.feed.map((pet) => `
    <article class="card">
      <div class="card-header">
        <div class="avatar ${pet.avatar === "ONG" ? "ong" : ""}">${escapeHtml(pet.avatar)}</div>
        <div class="card-user">
          <div class="card-user-name">${escapeHtml(pet.author)}</div>
          <div class="card-user-sub">${escapeHtml(pet.time)} • ${escapeHtml(pet.city)}</div>
        </div>
        <span class="badge ${escapeHtml(pet.badgeClass)}">${escapeHtml(pet.badge)}</span>
      </div>
      <div class="card-img">${escapeHtml(pet.emoji)}</div>
      <div class="card-body">
        <div class="card-title">${escapeHtml(pet.title)}</div>
        <div class="card-desc">${escapeHtml(pet.description)}</div>
        <div class="card-location">${escapeHtml(pet.location)}</div>
      </div>
      <div class="card-actions">
        <button class="action-btn" type="button">🐾 ${escapeHtml(pet.likes)}</button>
        <button class="action-btn" type="button">💬 Comentar</button>
        <button class="action-btn primary" type="button">📤 Compartilhar</button>
      </div>
    </article>
  `).join("");
}

function renderLostFound() {
  const target = document.getElementById("lost-found-list");
  if (!target) return;
  target.innerHTML = state.pets.lostFound.map((pet) => `
    <div class="lf-card">
      <div class="lf-pet-img">${escapeHtml(pet.emoji)}</div>
      <div class="lf-info">
        <div class="lf-name">${escapeHtml(pet.name)}</div>
        <div class="lf-detail">${escapeHtml(pet.species)} • ${escapeHtml(pet.location)} • ${escapeHtml(pet.distance)}</div>
        <div class="lf-status ${escapeHtml(pet.statusClass)}">● ${escapeHtml(pet.status)}</div>
      </div>
    </div>
  `).join("");
}

function renderMatches() {
  const target = document.getElementById("match-list");
  if (!target) return;
  target.innerHTML = state.matches.map((pet) => `
    <div class="match-card">
      <div class="match-header">
        <div class="match-img">${escapeHtml(pet.emoji)}</div>
        <div class="match-info">
          <div class="match-name">${escapeHtml(pet.name)}</div>
          <div class="match-breed">${escapeHtml(pet.age)}</div>
          <div class="match-detail">Perto de você</div>
        </div>
        <button class="match-btn" type="button">💕 Match</button>
      </div>
      <div class="match-tags">${pet.traits.map((trait) => `<span class="match-tag">${escapeHtml(trait)}</span>`).join("")}</div>
    </div>
  `).join("");
}

function renderOngs() {
  const target = document.getElementById("ong-list");
  if (!target) return;
  target.innerHTML = state.ongs.map((ong) => `
    <div class="ong-card">
      <div class="ong-header">
        <div class="ong-avatar">${escapeHtml(ong.icon)}</div>
        <div>
          <div class="ong-name">${escapeHtml(ong.name)}</div>
          <div class="ong-city">${escapeHtml(ong.meta)}</div>
        </div>
        <button class="ong-btn" type="button">${escapeHtml(ong.cta)}</button>
      </div>
      <div class="ong-stats">
        <div class="ong-stat"><strong>Ativa</strong>rede local</div>
        <div class="ong-stat"><strong>Pet</strong>proteção</div>
        <div class="ong-stat"><strong>4.9 ★</strong>avaliação</div>
      </div>
    </div>
  `).join("");
}

function renderAll() {
  const reports = loadReports();
  const reportFeed = reports.map((report) => ({
    id: report.id,
    author: "Você",
    avatar: "EU",
    time: "agora",
    city: report.city,
    type: report.type,
    badge: report.badge,
    badgeClass: report.badgeClass,
    emoji: report.emoji,
    title: report.name,
    description: report.description,
    location: "📍 " + report.location,
    likes: 0
  }));
  const reportLostFound = reports
    .filter((report) => report.type === "lost" || report.type === "found")
    .map((report) => ({
      id: report.id,
      name: report.name,
      emoji: report.emoji,
      species: report.species,
      location: report.location,
      status: report.type === "lost" ? "Perdido" : "Encontrado",
      statusClass: report.type === "lost" ? "status-lost" : "status-found",
      distance: "novo alerta"
    }));

  state.pets.feed = [...reportFeed, ...state.pets.feedBase];
  state.pets.lostFound = [...reportLostFound, ...state.pets.lostFoundBase];
  renderFeed();
  renderLostFound();
  renderMatches();
  renderOngs();
}

function openReportModal() {
  document.getElementById("report-modal")?.classList.add("open");
  document.getElementById("report-modal")?.setAttribute("aria-hidden", "false");
}

function closeReportModal() {
  document.getElementById("report-modal")?.classList.remove("open");
  document.getElementById("report-modal")?.setAttribute("aria-hidden", "true");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2400);
}

function reportTypeMeta(type) {
  return {
    lost: { badge: "Perdido", badgeClass: "badge-lost", species: "Pet" },
    found: { badge: "Encontrado", badgeClass: "badge-found", species: "Pet" },
    adopt: { badge: "Adoção", badgeClass: "badge-adopt", species: "Pet" },
    alert: { badge: "Alerta", badgeClass: "badge-alert", species: "Pet" }
  }[type] || { badge: "Alerta", badgeClass: "badge-alert", species: "Pet" };
}

function setupReportForm() {
  const form = document.getElementById("report-form");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const type = data.get("type");
    const meta = reportTypeMeta(type);
    const report = {
      id: "report-" + Date.now(),
      name: data.get("name"),
      type,
      badge: meta.badge,
      badgeClass: meta.badgeClass,
      emoji: data.get("emoji"),
      species: meta.species,
      location: data.get("location"),
      city: data.get("location"),
      description: data.get("description")
    };
    saveReports([report, ...loadReports()]);
    form.reset();
    closeReportModal();
    renderAll();
    showToast("Alerta salvo no RadarPet");
  });
}

async function boot() {
  const [pets, ongs, matches] = await Promise.all([
    readJson("data/pets.json", {"feed":[{"id":"cao-rua-xv","author":"Marina S.","avatar":"M","time":"há 12 min","city":"Blumenau, SC","type":"found","badge":"Encontrado","badgeClass":"badge-found","emoji":"🐕","title":"Cãozinho encontrado na Rua XV","description":"Macho, porte médio, cor caramelo. Parece bem de saúde. Alguém reconhece?","location":"📍 Próximo a você (380m)","likes":34},{"id":"luna-adocao","author":"Patinhas Felizes","avatar":"ONG","time":"há 45 min","city":"Blumenau, SC","type":"adopt","badge":"Adoção","badgeClass":"badge-adopt","emoji":"🐱","title":"Luna procura uma família","description":"Gatinha castrada, 8 meses, muito carinhosa. Ideal para apartamento.","location":"📍 ONG Patinhas Felizes","likes":89},{"id":"ratinho-tobby","author":"Ana Paula","avatar":"A","time":"há 1h","city":"Blumenau, SC","type":"day","badge":"Meu pet","badgeClass":"badge-alert","emoji":"🐭","title":"Tobby no passeio de hoje","description":"Meu ratinho explorador aproveitando o sol da manhã. Eles também são família!","location":"📍 Parque Ramiro","likes":156}],"lostFound":[{"id":"rex","name":"Rex","emoji":"🐕","species":"Cachorro","location":"Vila Nova","status":"Perdido","statusClass":"status-lost","distance":"1.2 km"},{"id":"mimi","name":"Mimi","emoji":"🐱","species":"Gato","location":"Centro","status":"Encontrado","statusClass":"status-found","distance":"800 m"},{"id":"nevinho","name":"Nevinho","emoji":"🐰","species":"Coelho","location":"Garcia","status":"Perdido","statusClass":"status-lost","distance":"2.4 km"},{"id":"pipoca","name":"Pipoca","emoji":"🦜","species":"Ave","location":"Itoupava","status":"Encontrado","statusClass":"status-found","distance":"3.1 km"}],"nearby":[{"emoji":"🐕","title":"Cão encontrado","meta":"Centro - 380m","type":"found"},{"emoji":"🐱","title":"Gata perdida","meta":"Vila Nova - 1.2km","type":"lost"}]}),
    readJson("data/ongs.json", [{"id":"patinhas","icon":"🐾","name":"Patinhas Felizes","meta":"12 pets para adoção","cta":"Ver pets"},{"id":"amigos","icon":"🏠","name":"Amigos de Pata","meta":"Precisa de ração","cta":"Ajudar"},{"id":"vet","icon":"🩺","name":"Vet Solidário","meta":"Mutirão sábado","cta":"Agendar"},{"id":"shop","icon":"🛒","name":"PetShop Amigo","meta":"20% para adotantes","cta":"Cupom"}]),
    readJson("data/matches.json", [{"id":"thor","emoji":"🐕","name":"Thor","age":"2 anos","traits":["Brincalhão","Crianças","Casa"]},{"id":"bella","emoji":"🐱","name":"Bella","age":"1 ano","traits":["Calma","Apartamento","Castrada"]},{"id":"simba","emoji":"🐰","name":"Simba","age":"6 meses","traits":["Dócil","Silencioso","Família"]}])
  ]);

  state.pets = {
    ...pets,
    feedBase: pets.feed || [],
    lostFoundBase: pets.lostFound || []
  };
  state.ongs = ongs;
  state.matches = matches;
  setupReportForm();
  renderAll();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

document.addEventListener("DOMContentLoaded", boot);
window.showScreen = showScreen;
window.openReportModal = openReportModal;
window.closeReportModal = closeReportModal;
