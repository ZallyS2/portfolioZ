// Habilita os estilos de animação só quando o JS está ativo
document.documentElement.classList.add("js");

const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// =======================
// NAV: fundo ao rolar, menu mobile, link ativo, barra de progresso
// =======================
const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");
const progress = document.getElementById("progress");

function setMenu(open) {
  navLinks.classList.toggle("open", open);
  navToggle.setAttribute("aria-expanded", String(open));
  navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
}

navToggle.addEventListener("click", () => {
  setMenu(navToggle.getAttribute("aria-expanded") !== "true");
});
navLinks.addEventListener("click", (e) => {
  if (e.target.closest("a")) setMenu(false);
});

let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    nav.classList.toggle("scrolled", y > 20);
    progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
    ticking = false;
  });
}
window.addEventListener("scroll", onScroll, { passive: true });
onScroll();

// Link ativo conforme a seção visível
const sectionLinks = new Map(
  Array.from(navLinks.querySelectorAll('a[href^="#"]')).map((a) => [a.getAttribute("href").slice(1), a])
);
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach((a) => a.classList.remove("active"));
      const link = sectionLinks.get(entry.target.id);
      if (link) link.classList.add("active");
    });
  },
  { rootMargin: "-45% 0px -50% 0px" }
);
// o hero também é observado, só para limpar o link ativo ao voltar ao topo
[...sectionLinks.keys(), "inicio"].forEach((id) => {
  const el = document.getElementById(id);
  if (el) sectionObserver.observe(el);
});

// =======================
// HERO: texto digitando + contadores
// =======================
const typedEl = document.getElementById("typed");
const roles = ["Game Developer", "Back-end Developer", "Game Designer"];

function typeLoop() {
  let r = 0, c = 0, deleting = false;
  (function tick() {
    const word = roles[r];
    typedEl.textContent = word.slice(0, c);

    let delay = deleting ? 45 : 90;
    if (!deleting && c === word.length) { deleting = true; delay = 1600; }
    else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 350; }
    else c += deleting ? -1 : 1;

    setTimeout(tick, delay);
  })();
}
if (prefersReduced) typedEl.textContent = roles.join(" • ");
else typeLoop();

function countUp(el) {
  const target = Number(el.dataset.count);
  if (prefersReduced) { el.textContent = target; return; }
  const start = performance.now();
  const dur = 1200;
  (function step(now) {
    const t = Math.min((now - start) / dur, 1);
    el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
    if (t < 1) requestAnimationFrame(step);
  })(start);
}

// =======================
// Revelar elementos ao rolar
// =======================
const revealEls = document.querySelectorAll(".reveal");
// pequeno atraso em cascata para irmãos
revealEls.forEach((el) => {
  const idx = Array.from(el.parentElement.children).indexOf(el);
  el.style.setProperty("--d", `${Math.min(idx, 6) * 0.08}s`);
});

const revealObserver = new IntersectionObserver(
  (entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in");
      entry.target.querySelectorAll("[data-count]").forEach(countUp);
      obs.unobserve(entry.target);
    });
  },
  { threshold: 0.12 }
);
revealEls.forEach((el) => revealObserver.observe(el));

// =======================
// PROJETOS: tags nos cards + filtro
// =======================
const grid = document.getElementById("projectsGrid");
const cards = Array.from(grid.querySelectorAll(".project-card"));

function splitTech(str) {
  return (str || "").split("•").map((s) => s.trim()).filter(Boolean);
}

cards.forEach((card, i) => {
  // tags
  const tags = document.createElement("div");
  tags.className = "tags";
  splitTech(card.dataset.tech).slice(0, 3).forEach((t) => {
    const s = document.createElement("span");
    s.textContent = t;
    tags.appendChild(s);
  });
  card.querySelector(".card-body").appendChild(tags);

  // selo de destaque
  if (card.dataset.featured) {
    const b = document.createElement("span");
    b.className = "badge";
    b.textContent = card.dataset.featured;
    card.querySelector(".card-media").appendChild(b);
  }

  // entrada em cascata
  card.classList.add("reveal");
  card.style.setProperty("--d", `${(i % 3) * 0.1}s`);
  revealObserver.observe(card);
});

document.querySelector(".filters").addEventListener("click", (e) => {
  const btn = e.target.closest(".filter");
  if (!btn) return;
  document.querySelectorAll(".filter").forEach((b) => b.classList.toggle("active", b === btn));

  const f = btn.dataset.filter;
  cards.forEach((card) => {
    const show = f === "all" || card.dataset.cat.split(" ").includes(f);
    card.classList.toggle("hide", !show);
    if (show) card.classList.add("in");
  });
});

// =======================
// MODAL
// =======================
const modal = document.getElementById("modal");
const title = document.getElementById("modalTitle");
const desc = document.getElementById("modalDesc");
const tech = document.getElementById("modalTech");
const link = document.getElementById("modalLink");
const closeBtn = document.querySelector(".close");
const modalImage = document.getElementById("modalImage");
let lastFocus = null;

function openModalFromCard(card) {
  const img = card.querySelector("img");
  lastFocus = card;

  modalImage.src = img ? img.src : "";
  modalImage.alt = card.dataset.title || "Capa do projeto";

  title.textContent = card.dataset.title || "";
  desc.textContent = card.dataset.desc || "";
  link.href = card.dataset.link || "#";

  tech.textContent = "";
  splitTech(card.dataset.tech).forEach((t) => {
    const s = document.createElement("span");
    s.textContent = t;
    tech.appendChild(s);
  });

  modal.style.display = "flex";
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  closeBtn.focus();
}

function closeModal() {
  modal.classList.remove("show");
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  if (lastFocus) lastFocus.focus({ preventScroll: true });
}

grid.addEventListener("click", (e) => {
  const card = e.target.closest(".project-card");
  if (card) openModalFromCard(card);
});
grid.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const card = e.target.closest(".project-card");
  if (!card) return;
  e.preventDefault();
  openModalFromCard(card);
});

closeBtn.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });
window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.style.display === "flex") closeModal();
});

// =======================
// PARALLAX do fundo
// =======================
const bg = document.querySelector(".bg-parallax");
const layers = bg ? bg.querySelectorAll(".bg-layer") : [];
const orbs = bg ? bg.querySelectorAll(".bg-orb") : [];
let mx = 0, my = 0;

if (bg && !prefersReduced) {
  window.addEventListener("mousemove", (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    mx = (e.clientX - cx) / cx;
    my = (e.clientY - cy) / cy;
  }, { passive: true });

  (function applyParallax() {
    const sy = window.scrollY || 0;
    layers.forEach((layer, i) => {
      const depth = (i + 1) * 6;
      layer.style.setProperty("--px", `${mx * depth}px`);
      layer.style.setProperty("--py", `${my * depth + sy * (0.02 + i * 0.01)}px`);
    });
    orbs.forEach((orb, i) => {
      const depth = (i + 1) * 10;
      orb.style.setProperty("--ox", `${mx * depth}px`);
      orb.style.setProperty("--oy", `${my * depth + sy * 0.03}px`);
    });
    requestAnimationFrame(applyParallax);
  })();
}

// =======================
// REFERÊNCIAS VISUAIS: Triforce, fadinha (Navi) e Grogu
// =======================

// Divisores com Triforce entre as seções (menos antes da primeira)
document.querySelectorAll("main .section").forEach((sec, i) => {
  if (i === 0) return;
  const div = document.createElement("div");
  div.className = "tri-divider";
  div.setAttribute("aria-hidden", "true");
  div.innerHTML = '<svg viewBox="0 0 60 52"><use href="#triforce"/></svg>';
  sec.parentElement.insertBefore(div, sec);
});

// Grogu: cada clique muda a frase
const grogu = document.getElementById("grogu");
const bubble = document.getElementById("groguBubble");
const quotes = [
  "May the Force be with you ✨",
  "Hmm… bom portfólio, este é.",
  "Mais um projeto, sim?",
  "Café? Sopa? Eu aceito os dois ☕",
];
let q = 0, talkTimer = null;
grogu.addEventListener("click", () => {
  q = (q + 1) % quotes.length;
  bubble.textContent = quotes[q];
  grogu.classList.add("talk");
  clearTimeout(talkTimer);
  talkTimer = setTimeout(() => grogu.classList.remove("talk"), 2500);
});

// Fadinha que segue o mouse (só em telas com mouse e sem "reduzir movimento")
if (!prefersReduced && window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
  const fairy = document.createElement("div");
  fairy.className = "fairy";
  fairy.setAttribute("aria-hidden", "true");
  document.body.appendChild(fairy);

  let tx = 0, ty = 0, fx = 0, fy = 0, lastSpark = 0;
  window.addEventListener("mousemove", (e) => {
    tx = e.clientX; ty = e.clientY;
    fairy.classList.add("on");
  }, { passive: true });
  document.addEventListener("mouseleave", () => fairy.classList.remove("on"));

  (function follow(now) {
    fx += (tx + 18 - fx) * 0.12;
    fy += (ty + 18 - fy) * 0.12;
    fairy.style.transform = `translate(${fx}px, ${fy + Math.sin(now / 300) * 4}px)`;

    // rastro de brilhinhos
    if (fairy.classList.contains("on") && now - lastSpark > 90) {
      lastSpark = now;
      const s = document.createElement("span");
      s.className = "sparkle";
      s.textContent = Math.random() > 0.5 ? "✦" : "✧";
      s.style.left = `${fx + (Math.random() * 10 - 5)}px`;
      s.style.top = `${fy + (Math.random() * 10 - 5)}px`;
      s.style.setProperty("--dx", `${Math.random() * 30 - 15}px`);
      s.style.setProperty("--dy", `${12 + Math.random() * 18}px`);
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 800);
    }
    requestAnimationFrame(follow);
  })(0);
}
