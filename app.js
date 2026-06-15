"use strict";

const STORAGE_KEY = "radarpet_reports";
const LIKES_KEY = "radarpet_likes";
const FOLLOWS_KEY = "radarpet_follows";
const MATCHES_KEY = "radarpet_matches";
const state = {
  pets: { feed: [], lostFound: [], nearby: [] },
  ongs: [],
  matches: [],
  query: "",
  mapFilter: "all",
  lostFilter: "all",
  matchFilter: "all",
  liked: new Set(),
  followed: new Set(),
  matched: new Set()
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

function readArray(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

function writeArray(key, values) {
  localStorage.setItem(key, JSON.stringify([...values]));
}

function loadReports() {
  return readArray(STORAGE_KEY);
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

function matchesQuery(...values) {
  if (!state.query) return true;
  return values.join(" ").toLowerCase().includes(state.query);
}

function setChipActive(selector, value) {
  document.querySelectorAll(selector).forEach((chip) => chip.classList.toggle("on", chip.dataset[selector.includes("map") ? "mapFilter" : selector.includes("lost") ? "lostFilter" : "matchFilter"] === value));
}

function openInfoModal(title, subtitle, body) {
  document.getElementById("info-modal-title").textContent = title;
  document.getElementById("info-modal-subtitle").textContent = subtitle;
  document.getElementById("info-modal-body").textContent = body;
  document.getElementById("info-modal")?.classList.add("open");
  document.getElementById("info-modal")?.setAttribute("aria-hidden", "false");
}

function closeInfoModal() {
  document.getElementById("info-modal")?.classList.remove("open");
  document.getElementById("info-modal")?.setAttribute("aria-hidden", "true");
}

function renderFeed() {
  const target = document.getElementById("feed-list");
  if (!target) return;
  const feed = state.pets.feed.filter((pet) => matchesQuery(pet.author, pet.title, pet.description, pet.city, pet.badge));
  target.innerHTML = feed.map((pet) => {
    const liked = state.liked.has(pet.id);
    const likes = Number(pet.likes || 0) + (liked ? 1 : 0);
    return `
      <article class="card" data-pet-id="${escapeHtml(pet.id)}">
        <div class="card-header">
          <div class="avatar ${pet.avatar === "ONG" ? "ong" : ""}">${escapeHtml(pet.avatar)}</div>
          <div class="card-user">
            <div class="card-user-name">${escapeHtml(pet.author)}</div>
            <div class="card-user-sub">${escapeHtml(pet.time)} • ${escapeHtml(pet.city)}</div>
          </div>
          <span class="badge ${escapeHtml(pet.badgeClass)}">${escapeHtml(pet.badge)}</span>
        </div>
        <div class="card-img" data-action="pet-detail" data-pet-id="${escapeHtml(pet.id)}">${escapeHtml(pet.emoji)}</div>
        <div class="card-body">
          <div class="card-title">${escapeHtml(pet.title)}</div>
          <div class="card-desc">${escapeHtml(pet.description)}</div>
          <div class="card-location">${escapeHtml(pet.location)}</div>
        </div>
        <div class="card-actions">
          <button class="action-btn ${liked ? "selected" : ""}" type="button" data-action="like" data-pet-id="${escapeHtml(pet.id)}">🐾 ${likes}</button>
          <button class="action-btn" type="button" data-action="comment" data-pet-id="${escapeHtml(pet.id)}">💬 Comentar</button>
          <button class="action-btn primary" type="button" data-action="share" data-pet-id="${escapeHtml(pet.id)}">📤 Compartilhar</button>
        </div>
      </article>
    `;
  }).join("") || `<div class="empty-state">Nenhum pet encontrado nessa busca.</div>`;
}

function renderLostFound() {
  const target = document.getElementById("lost-found-list");
  if (!target) return;
  const pets = state.pets.lostFound.filter((pet) => {
    const type = pet.type || (pet.statusClass === "status-lost" ? "lost" : "found");
    return (state.lostFilter === "all" || type === state.lostFilter) && matchesQuery(pet.name, pet.species, pet.location, pet.status);
  });
  target.innerHTML = pets.map((pet) => `
    <button class="lf-card clickable-card" type="button" data-action="lost-detail" data-lost-id="${escapeHtml(pet.id)}">
      <div class="lf-pet-img">${escapeHtml(pet.emoji)}</div>
      <div class="lf-info">
        <div class="lf-name">${escapeHtml(pet.name)}</div>
        <div class="lf-detail">${escapeHtml(pet.species)} • ${escapeHtml(pet.location)} • ${escapeHtml(pet.distance)}</div>
        <div class="lf-status ${escapeHtml(pet.statusClass)}">● ${escapeHtml(pet.status)}</div>
      </div>
    </button>
  `).join("") || `<div class="empty-state">Nenhum caso encontrado.</div>`;
}

function renderMapNearby() {
  const target = document.getElementById("map-nearby-list");
  if (!target) return;
  const items = (state.pets.nearby || []).filter((item) =>
    (state.mapFilter === "all" || item.type === state.mapFilter) && matchesQuery(item.title, item.meta, item.type)
  );
  target.innerHTML = items.map((item) => `
    <button class="lf-card clickable-card" type="button" data-action="map-detail" data-map-id="${escapeHtml(item.id)}">
      <div class="lf-pet-img">${escapeHtml(item.emoji)}</div>
      <div class="lf-info">
        <div class="lf-name">${escapeHtml(item.title)}</div>
        <div class="lf-detail">${escapeHtml(item.meta)}</div>
      </div>
      <span class="badge ${escapeHtml(item.badgeClass)}">${escapeHtml(item.badge)}</span>
    </button>
  `).join("") || `<div class="empty-state">Nenhum ponto nesse filtro.</div>`;
}

function renderMatches() {
  const target = document.getElementById("match-list");
  if (!target) return;
  const matches = state.matches.filter((pet) =>
    (state.matchFilter === "all" || pet.species === state.matchFilter) && matchesQuery(pet.name, pet.age, pet.species, ...(pet.traits || []))
  );
  target.innerHTML = matches.map((pet) => {
    const matched = state.matched.has(pet.id);
    return `
      <div class="match-card" data-match-id="${escapeHtml(pet.id)}">
        <div class="match-header">
          <div class="match-img" data-action="match-detail" data-match-id="${escapeHtml(pet.id)}">${escapeHtml(pet.emoji)}</div>
          <div class="match-info">
            <div class="match-name">${escapeHtml(pet.name)}</div>
            <div class="match-breed">${escapeHtml(pet.species || "Pet")} • ${escapeHtml(pet.age)}</div>
            <div class="match-detail">Perto de você</div>
          </div>
          <button class="match-btn ${matched ? "selected" : ""}" type="button" data-action="match" data-match-id="${escapeHtml(pet.id)}">${matched ? "✓ Match" : "💕 Match"}</button>
        </div>
        <div class="match-tags">${(pet.traits || []).map((trait) => `<span class="match-tag">${escapeHtml(trait)}</span>`).join("")}</div>
      </div>
    `;
  }).join("") || `<div class="empty-state">Nenhum PetMatch nesse filtro.</div>`;
}

function renderOngs() {
  const target = document.getElementById("ong-list");
  if (!target) return;
  const ongs = state.ongs.filter((ong) => matchesQuery(ong.name, ong.meta, ong.cta));
  target.innerHTML = ongs.map((ong) => {
    const followed = state.followed.has(ong.id);
    return `
      <div class="ong-card" data-ong-id="${escapeHtml(ong.id)}">
        <div class="ong-header">
          <div class="ong-avatar" data-action="ong-detail" data-ong-id="${escapeHtml(ong.id)}">${escapeHtml(ong.icon)}</div>
          <div>
            <div class="ong-name">${escapeHtml(ong.name)}</div>
            <div class="ong-city">${escapeHtml(ong.meta)}</div>
          </div>
          <button class="ong-btn ${followed ? "following" : ""}" type="button" data-action="follow" data-ong-id="${escapeHtml(ong.id)}">${followed ? "Seguindo" : escapeHtml(ong.cta)}</button>
        </div>
        <div class="ong-stats">
          <button class="ong-stat" type="button" data-action="ong-detail" data-ong-id="${escapeHtml(ong.id)}"><strong>Ativa</strong>rede local</button>
          <button class="ong-stat" type="button" data-action="ong-detail" data-ong-id="${escapeHtml(ong.id)}"><strong>Pet</strong>proteção</button>
          <button class="ong-stat" type="button" data-action="ong-detail" data-ong-id="${escapeHtml(ong.id)}"><strong>4.9 ★</strong>avaliação</button>
        </div>
      </div>
    `;
  }).join("") || `<div class="empty-state">Nenhuma ONG encontrada.</div>`;
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
      distance: "novo alerta",
      type: report.type
    }));
  const reportMap = reports.map((report) => ({
    id: "map-" + report.id,
    emoji: report.emoji,
    title: report.name,
    meta: `${report.location} • novo alerta`,
    type: report.type === "lost" || report.type === "found" ? report.type : "alert",
    badge: report.badge,
    badgeClass: report.badgeClass
  }));

  state.pets.feed = [...reportFeed, ...state.pets.feedBase];
  state.pets.lostFound = [...reportLostFound, ...state.pets.lostFoundBase];
  state.pets.nearby = [...reportMap, ...state.pets.nearbyBase];
  renderFeed();
  renderLostFound();
  renderMapNearby();
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

function findPet(id) {
  return state.pets.feed.find((pet) => pet.id === id);
}

function setupInteractions() {
  const search = document.getElementById("app-search");
  search?.addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    renderAll();
  });

  document.addEventListener("click", async (event) => {
    const target = event.target.closest("[data-action], [data-map-filter], [data-lost-filter], [data-match-filter]");
    if (!target) return;

    if (target.dataset.mapFilter) {
      state.mapFilter = target.dataset.mapFilter;
      setChipActive("[data-map-filter]", state.mapFilter);
      renderMapNearby();
      showScreen("mapa");
      showToast("Mapa filtrado");
      return;
    }

    if (target.dataset.lostFilter) {
      state.lostFilter = target.dataset.lostFilter;
      setChipActive("[data-lost-filter]", state.lostFilter);
      renderLostFound();
      return;
    }

    if (target.dataset.matchFilter) {
      state.matchFilter = target.dataset.matchFilter;
      setChipActive("[data-match-filter]", state.matchFilter);
      renderMatches();
      return;
    }

    const action = target.dataset.action;

    if (action === "close-info") {
      closeInfoModal();
      return;
    }

    if (action === "notifications") {
      openInfoModal("Notificações", "Alertas próximos", "Você tem alertas ativos de pets encontrados, perdidos e ONGs próximas.");
      return;
    }

    if (action === "messages") {
      openInfoModal("Mensagens", "Conversas", "As conversas com tutores e ONGs ficam centralizadas aqui.");
      return;
    }

    if (action === "story") {
      openInfoModal(target.dataset.story, "História do pet", `Você abriu a história de ${target.dataset.story}.`);
      return;
    }

    if (action === "show-map-alert") {
      state.mapFilter = "alert";
      setChipActive("[data-map-filter]", "alert");
      showScreen("mapa");
      renderMapNearby();
      showToast("Mostrando alertas no mapa");
      return;
    }

    if (action === "map") {
      openInfoModal("Mapa RadarPet", "Pontos próximos", "Use os filtros para ver pets perdidos, encontrados, alertas e ONGs na região.");
      return;
    }

    if (action === "map-detail") {
      const item = state.pets.nearby.find((entry) => entry.id === target.dataset.mapId);
      if (item) openInfoModal(item.title, item.badge, item.meta);
      return;
    }

    if (action === "lost-detail") {
      const pet = state.pets.lostFound.find((entry) => entry.id === target.dataset.lostId);
      if (pet) openInfoModal(pet.name, pet.status, `${pet.species} em ${pet.location}. Distância: ${pet.distance}.`);
      return;
    }

    if (action === "pet-detail") {
      const pet = findPet(target.dataset.petId);
      if (pet) openInfoModal(pet.title, pet.badge, pet.description);
      return;
    }

    if (action === "like") {
      const id = target.dataset.petId;
      state.liked.has(id) ? state.liked.delete(id) : state.liked.add(id);
      writeArray(LIKES_KEY, state.liked);
      renderFeed();
      showToast(state.liked.has(id) ? "Curtido" : "Curtida removida");
      return;
    }

    if (action === "comment") {
      const pet = findPet(target.dataset.petId);
      openInfoModal("Comentário", pet?.title || "Post", "Comentários estarão conectados ao backend quando ele for adicionado.");
      return;
    }

    if (action === "share") {
      const pet = findPet(target.dataset.petId);
      const text = `${pet?.title || "RadarPet"} - ${pet?.description || "Ajude um pet próximo."}`;
      if (navigator.share) {
        await navigator.share({ title: "RadarPet", text }).catch(() => {});
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(text).catch(() => {});
        showToast("Texto copiado para compartilhar");
      } else {
        showToast("Compartilhamento preparado");
      }
      return;
    }

    if (action === "match") {
      const id = target.dataset.matchId;
      state.matched.has(id) ? state.matched.delete(id) : state.matched.add(id);
      writeArray(MATCHES_KEY, state.matched);
      renderMatches();
      showToast(state.matched.has(id) ? "Match enviado" : "Match removido");
      return;
    }

    if (action === "match-detail") {
      const pet = state.matches.find((entry) => entry.id === target.dataset.matchId);
      if (pet) openInfoModal(pet.name, "PetMatch", `${pet.species || "Pet"}, ${pet.age}. Perfil com ${pet.traits.join(", ")}.`);
      return;
    }

    if (action === "follow") {
      const id = target.dataset.ongId;
      state.followed.has(id) ? state.followed.delete(id) : state.followed.add(id);
      writeArray(FOLLOWS_KEY, state.followed);
      renderOngs();
      showToast(state.followed.has(id) ? "ONG seguida" : "ONG removida");
      return;
    }

    if (action === "ong-detail") {
      const ong = state.ongs.find((entry) => entry.id === target.dataset.ongId);
      if (ong) openInfoModal(ong.name, "ONG parceira", ong.meta);
    }
  });
}

async function boot() {
  const [pets, ongs, matches] = await Promise.all([
    readJson("data/pets.json", {"feed":[{"id":"cao-rua-xv","author":"Marina S.","avatar":"M","time":"há 12 min","city":"Blumenau, SC","type":"found","badge":"Encontrado","badgeClass":"badge-found","emoji":"🐕","title":"Cãozinho encontrado na Rua XV","description":"Macho, porte médio, cor caramelo. Parece bem de saúde. Alguém reconhece?","location":"📍 Próximo a você (380m)","likes":34},{"id":"luna-adocao","author":"Patinhas Felizes","avatar":"ONG","time":"há 45 min","city":"Blumenau, SC","type":"adopt","badge":"Adoção","badgeClass":"badge-adopt","emoji":"🐱","title":"Luna procura uma família","description":"Gatinha castrada, 8 meses, muito carinhosa. Ideal para apartamento.","location":"📍 ONG Patinhas Felizes","likes":89},{"id":"ratinho-tobby","author":"Ana Paula","avatar":"A","time":"há 1h","city":"Blumenau, SC","type":"day","badge":"Meu pet","badgeClass":"badge-alert","emoji":"🐭","title":"Tobby no passeio de hoje","description":"Meu ratinho explorador aproveitando o sol da manhã. Eles também são família!","location":"📍 Parque Ramiro","likes":156}],"lostFound":[{"id":"rex","name":"Rex","emoji":"🐕","species":"Cachorro","location":"Vila Nova","status":"Perdido","statusClass":"status-lost","distance":"1.2 km","type":"lost"},{"id":"mimi","name":"Mimi","emoji":"🐱","species":"Gato","location":"Centro","status":"Encontrado","statusClass":"status-found","distance":"800 m","type":"found"}],"nearby":[{"id":"map-found-dog","emoji":"🐕","title":"Cão encontrado","meta":"Centro - 380m","type":"found","badge":"280m","badgeClass":"badge-found"}]}),
    readJson("data/ongs.json", [{"id":"patinhas","icon":"🐾","name":"Patinhas Felizes","meta":"12 pets para adoção","cta":"Ver pets"},{"id":"amigos","icon":"🏠","name":"Amigos de Pata","meta":"Precisa de ração","cta":"Ajudar"},{"id":"vet","icon":"🩺","name":"Vet Solidário","meta":"Mutirão sábado","cta":"Agendar"},{"id":"shop","icon":"🛒","name":"PetShop Amigo","meta":"20% para adotantes","cta":"Cupom"}]),
    readJson("data/matches.json", [{"id":"thor","emoji":"🐕","name":"Thor","age":"2 anos","species":"Cachorro","traits":["Brincalhão","Crianças","Casa"]},{"id":"bella","emoji":"🐱","name":"Bella","age":"1 ano","species":"Gato","traits":["Calma","Apartamento","Castrada"]},{"id":"simba","emoji":"🐰","name":"Simba","age":"6 meses","species":"Coelho","traits":["Dócil","Silencioso","Família"]}])
  ]);

  state.pets = {
    ...pets,
    feedBase: pets.feed || [],
    lostFoundBase: pets.lostFound || [],
    nearbyBase: pets.nearby || []
  };
  state.ongs = ongs;
  state.matches = matches.map((pet) => ({ ...pet, species: pet.species || (pet.emoji === "🐱" ? "Gato" : pet.emoji === "🐰" ? "Coelho" : pet.emoji === "🦜" ? "Ave" : "Cachorro") }));
  state.liked = new Set(readArray(LIKES_KEY));
  state.followed = new Set(readArray(FOLLOWS_KEY));
  state.matched = new Set(readArray(MATCHES_KEY));
  setupReportForm();
  setupInteractions();
  renderAll();

  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("sw.js").catch(() => {});
  }
}

document.addEventListener("DOMContentLoaded", boot);
window.showScreen = showScreen;
window.openReportModal = openReportModal;
window.closeReportModal = closeReportModal;