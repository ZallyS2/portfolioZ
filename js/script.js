// script.js

// ===== CARROSSEL INFINITO (3 visíveis) =====
const track = document.getElementById("track");
const prev = document.getElementById("prev");
const next = document.getElementById("next");

let cards = Array.from(document.querySelectorAll(".project-card"));
const visible = 3;

// Clones para infinito
const headClones = cards.slice(0, visible).map(c => c.cloneNode(true));
const tailClones = cards.slice(-visible).map(c => c.cloneNode(true));

tailClones.forEach(clone => track.insertBefore(clone, track.firstChild));
headClones.forEach(clone => track.appendChild(clone));

// Atualiza lista completa
cards = Array.from(document.querySelectorAll(".project-card"));

// Começa no "miolo"
let index = visible;

function setPosition(noAnim = false){
  if (noAnim) track.style.transition = "none";
  else track.style.transition = "0.5s";

  track.style.transform = `translateX(-${(100 / visible) * index}%)`;
}

setPosition(true);

next.onclick = () => {
  index++;
  setPosition(false);
};

prev.onclick = () => {
  index--;
  setPosition(false);
};

track.addEventListener("transitionend", () => {
  // quando passa do final, volta pro miolo
  if (index >= cards.length - visible) {
    index = visible;
    setPosition(true);
  }

  // quando passa do começo, volta pro final do miolo
  if (index <= 0) {
    index = cards.length - visible * 2;
    setPosition(true);
  }
});


// ===== MODAL (com capa do card) =====
const modal = document.getElementById("modal");
const title = document.getElementById("modalTitle");
const desc = document.getElementById("modalDesc");
const tech = document.getElementById("modalTech");
const link = document.getElementById("modalLink");
const closeBtn = document.querySelector(".close");
const modalImage = document.getElementById("modalImage");

function openModalFromCard(card){
  const img = card.querySelector("img");

  modalImage.src = img ? img.src : "";
  modalImage.alt = card.dataset.title || "Capa do projeto";

  title.textContent = card.dataset.title || "";
  desc.textContent = card.dataset.desc || "";
  tech.textContent = card.dataset.tech || "";
  link.href = card.dataset.link || "#";

  modal.style.display = "flex";
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");

  // trava scroll do fundo
  document.body.style.overflow = "hidden";
}

function closeModal(){
  modal.classList.remove("show");
  modal.style.display = "none";
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

// Abre ao clicar em qualquer card (incluindo clones)
track.addEventListener("click", (e) => {
  const card = e.target.closest(".project-card");
  if (!card) return;
  openModalFromCard(card);
});

closeBtn.onclick = closeModal;
modal.onclick = (e) => {
  if (e.target === modal) closeModal();
};

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.style.display === "flex") closeModal();
});


// ===== PARALLAX BACKGROUND (mouse + scroll, leve) =====
const bg = document.querySelector(".bg-parallax");
const layers = bg ? bg.querySelectorAll(".bg-layer") : [];
const orbs = bg ? bg.querySelectorAll(".bg-orb") : [];

let mx = 0, my = 0;

window.addEventListener("mousemove", (e) => {
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  mx = (e.clientX - cx) / cx; // -1..1
  my = (e.clientY - cy) / cy; // -1..1
}, { passive: true });

function applyParallax(){
  const sy = window.scrollY || 0;

  layers.forEach((layer, i) => {
    const depth = (i + 1) * 6;
    const px = mx * depth;
    const py = my * depth + (sy * (0.02 + i * 0.01));
    layer.style.setProperty("--px", `${px}px`);
    layer.style.setProperty("--py", `${py}px`);
  });

  orbs.forEach((orb, i) => {
    const depth = (i + 1) * 10;
    orb.style.setProperty("--ox", `${mx * depth}px`);
    orb.style.setProperty("--oy", `${my * depth + sy * 0.03}px`);
  });

  requestAnimationFrame(applyParallax);
}

if (bg) requestAnimationFrame(applyParallax);
