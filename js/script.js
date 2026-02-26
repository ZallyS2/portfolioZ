// =======================
// CARROSSEL INFINITO (responsivo: 3 desktop / 1 mobile)
// =======================
const track = document.getElementById("track");
const prev = document.getElementById("prev");
const next = document.getElementById("next");

// breakpoint do seu @media (ajuste se precisar)
const MOBILE_BP = 768;

// estado
let visible = getVisible();
let index = 0;
let baseCards = [];   // cards originais (sem clones)
let cards = [];       // cards atuais (com clones)

// Descobre quantos cards são visíveis pelo tamanho da tela
function getVisible() {
  return window.innerWidth <= MOBILE_BP ? 1 : 3;
}

// Pega só os cards "originais" (ignorando clones)
function getBaseCards() {
  return Array.from(track.querySelectorAll(".project-card"))
    .filter(card => !card.dataset.clone);
}

// Remove clones antigos
function clearClones() {
  Array.from(track.querySelectorAll('.project-card[data-clone="1"]'))
    .forEach(el => el.remove());
}

// Cria clones e reinicia o carrossel sem quebrar
function buildCarousel() {
  // tira qualquer animação durante rebuild
  track.style.transition = "none";

  // remove clones anteriores
  clearClones();

  // atualiza base e visible
  visible = getVisible();
  baseCards = getBaseCards();

  // se não tiver cards suficientes, não tenta infinito
  if (baseCards.length === 0) return;

  const v = Math.min(visible, baseCards.length);

  // cria clones (head/tail)
  const headClones = baseCards.slice(0, v).map(c => {
    const clone = c.cloneNode(true);
    clone.dataset.clone = "1";
    return clone;
  });

  const tailClones = baseCards.slice(-v).map(c => {
    const clone = c.cloneNode(true);
    clone.dataset.clone = "1";
    return clone;
  });

  // insere clones
  tailClones.forEach(clone => track.insertBefore(clone, track.firstChild));
  headClones.forEach(clone => track.appendChild(clone));

  // atualiza lista total de cards (incluindo clones)
  cards = Array.from(track.querySelectorAll(".project-card"));

  // posição inicial: depois dos clones do começo
  index = v;
  setPosition(true);

  // reativa transição
  requestAnimationFrame(() => {
    track.style.transition = "transform 0.5s ease";
  });
}

// Move o track (sempre 1 card por clique -> passo correto em qualquer visible)
function setPosition(noAnim = false) {
  if (noAnim) track.style.transition = "none";
  else track.style.transition = "transform 0.5s ease";

  // Cada card ocupa (100 / visible)% do track em largura (porque seu CSS usa flex-basis baseado nisso)
  // Então pular 1 card = 100/visible
  track.style.transform = `translateX(-${(100 / visible) * index}%)`;

  if (noAnim) {
    // força reflow pra garantir que a troca "sem anim" aconteça
    void track.offsetHeight;
    track.style.transition = "transform 0.5s ease";
  }
}

// Botões
next.onclick = () => {
  index++;
  setPosition(false);
};

prev.onclick = () => {
  index--;
  setPosition(false);
};

// Loop infinito (quando cai nos clones, teleporta sem animação)
track.addEventListener("transitionend", () => {
  const v = Math.min(visible, baseCards.length);
  if (baseCards.length === 0) return;

  // cards total = base + 2*v clones
  // área "real" começa em index=v e termina em index=(v + baseCards.length - 1)
  if (index >= baseCards.length + v) {
    index = v;
    setPosition(true);
  }

  if (index < v) {
    index = baseCards.length + v - 1;
    setPosition(true);
  }
});

// Rebuild quando muda de desktop <-> mobile
let resizeTimer = null;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    const newVisible = getVisible();
    if (newVisible !== visible) buildCarousel();
    else setPosition(true); // só recalcula posição
  }, 150);
});

// inicia
buildCarousel();


// =======================
// MODAL (mantém seu comportamento, funciona com clones)
// =======================
const modal = document.getElementById("modal");
const title = document.getElementById("modalTitle");
const desc = document.getElementById("modalDesc");
const tech = document.getElementById("modalTech");
const link = document.getElementById("modalLink");
const closeBtn = document.querySelector(".close");
const modalImage = document.getElementById("modalImage");

function openModalFromCard(card) {
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

  document.body.style.overflow = "hidden";
}

function closeModal() {
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


// =======================
// PARALLAX (seu código, igual)
// =======================
const bg = document.querySelector(".bg-parallax");
const layers = bg ? bg.querySelectorAll(".bg-layer") : [];
const orbs = bg ? bg.querySelectorAll(".bg-orb") : [];

let mx = 0, my = 0;

window.addEventListener(
  "mousemove",
  (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    mx = (e.clientX - cx) / cx; // -1..1
    my = (e.clientY - cy) / cy; // -1..1
  },
  { passive: true }
);

function applyParallax() {
  const sy = window.scrollY || 0;

  layers.forEach((layer, i) => {
    const depth = (i + 1) * 6;
    const px = mx * depth;
    const py = my * depth + sy * (0.02 + i * 0.01);
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