document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------------- Mobile nav ---------------- */
  const burger = document.getElementById("navBurger");
  const navLinks = document.getElementById("navLinks");
  if (burger && navLinks) {
    burger.addEventListener("click", () => {
      const open = navLinks.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    navLinks.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => navLinks.classList.remove("is-open"))
    );
  }

  /* ---------------- Work grid hover effect ---------------- */
  const workGridList = document.getElementById("workGridList");
  const gridHoverBg = document.getElementById("gridHoverBg");
  if (workGridList && gridHoverBg) {
    const PAD = 12;

    workGridList.addEventListener("mouseover", (e) => {
      const card = e.target.closest(".grid-card");
      if (!card) return;
      gridHoverBg.style.left = `${card.offsetLeft - PAD}px`;
      gridHoverBg.style.top = `${card.offsetTop - PAD}px`;
      gridHoverBg.style.width = `${card.offsetWidth + PAD * 2}px`;
      gridHoverBg.style.height = `${card.offsetHeight + PAD * 2}px`;
      gridHoverBg.classList.add("is-visible");
    });

    workGridList.addEventListener("mouseleave", () => {
      gridHoverBg.classList.remove("is-visible");
    });
  }

  /* ---------------- Boxes background ---------------- */
  const boxesBg = document.getElementById("boxesBg");
  if (boxesBg) {
    const BOX_W = 64;
    const BOX_H = 32;
    const BLEED = 1.6; // grid is bigger than the wrap so the skew never shows edges
    const COLORS = [
      "#ff5d8f", "#7c5cff", "#ffb703", "#22d3ee",
      "#34d399", "#f472b6", "#a78bfa", "#fb923c",
    ];

    function buildBoxesGrid() {
      const wrap = boxesBg.parentElement;
      const rect = wrap.getBoundingClientRect();
      const cols = Math.ceil((rect.width * BLEED) / BOX_W);
      const rows = Math.ceil((rect.height * BLEED) / BOX_H);
      boxesBg.style.gridTemplateColumns = `repeat(${cols}, ${BOX_W}px)`;
      boxesBg.style.width = `${cols * BOX_W}px`;
      boxesBg.style.height = `${rows * BOX_H}px`;
      boxesBg.innerHTML = "";

      const fragment = document.createDocumentFragment();
      for (let i = 0; i < rows * cols; i++) {
        const cell = document.createElement("div");
        cell.className = "box-cell";
        fragment.appendChild(cell);
      }
      boxesBg.appendChild(fragment);
    }

    boxesBg.addEventListener("mouseover", (e) => {
      const cell = e.target.closest(".box-cell");
      if (!cell) return;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      clearTimeout(cell._boxTimeout);
      cell.style.backgroundColor = color;
      cell._boxTimeout = setTimeout(() => {
        cell.style.backgroundColor = "transparent";
      }, 700);
    });

    buildBoxesGrid();
    let boxesResizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(boxesResizeTimer);
      boxesResizeTimer = setTimeout(buildBoxesGrid, 200);
    });
  }

  /* ---------------- Text flip hero ---------------- */
  const words = ["Web Design", "App Design", "Brand Identity", "Social Content"];
  const wordEl = document.getElementById("flipWord");
  const pillEl = document.getElementById("flipPill");
  const measureEl = document.getElementById("flipMeasure");
  let wordIndex = 0;

  function measureWidth(text) {
    measureEl.textContent = text;
    const textWidth = measureEl.offsetWidth;
    const cs = getComputedStyle(pillEl);
    const paddingX = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingRight);
    return textWidth + paddingX;
  }

  function setPillWidth(text, animate) {
    const w = measureWidth(text);
    if (!animate) pillEl.style.transition = "none";
    pillEl.style.width = w + "px";
    if (!animate) {
      // force reflow then restore transition
      void pillEl.offsetWidth;
      pillEl.style.transition = "";
    }
  }

  function flipToNextWord() {
    wordIndex = (wordIndex + 1) % words.length;
    const nextWord = words[wordIndex];

    wordEl.classList.remove("is-in");
    wordEl.classList.add("is-out");

    setTimeout(() => {
      wordEl.textContent = nextWord;
      setPillWidth(nextWord, true);
      wordEl.classList.remove("is-out");
      wordEl.classList.add("is-in");
      setTimeout(() => wordEl.classList.remove("is-in"), 500);
    }, 300);
  }

  if (wordEl && pillEl && measureEl) {
    setPillWidth(words[0], false);
    setInterval(flipToNextWord, 2600);
    window.addEventListener("resize", () => setPillWidth(words[wordIndex], false));
  }

  /* ---------------- Cyclic rows (seamless loop, no gaps) ---------------- */
  // Each row's cards are wrapped into a group, then duplicated twice more
  // (3 groups total). The row is centered in the viewport, so scrolling
  // shifts the visible window away from that centered start toward one
  // edge of the content; two groups alone don't leave enough buffer and
  // run out (a black gap appears at the end). A third group guarantees
  // there's always a full row's worth of cards to slide into view, so the
  // loop stays seamless right through to the end of the pinned range.
  const rowIds = ["row1", "row2", "row3"];
  const rows = rowIds.map((id) => document.getElementById(id)).filter(Boolean);

  function setupCyclicRow(row) {
    const cards = Array.from(row.children);
    const group1 = document.createElement("div");
    group1.className = "parallax-group";
    cards.forEach((card) => group1.appendChild(card));

    const group2 = group1.cloneNode(true);
    group2.setAttribute("aria-hidden", "true");
    const group3 = group1.cloneNode(true);
    group3.setAttribute("aria-hidden", "true");

    row.appendChild(group1);
    row.appendChild(group2);
    row.appendChild(group3);
  }

  function measureShiftMax(row) {
    const group2 = row.children[1];
    return group2 ? group2.offsetLeft : 0;
  }

  rows.forEach(setupCyclicRow);
  let shiftMaxes = rows.map(() => 0);

  function remeasureRows() {
    shiftMaxes = rows.map(measureShiftMax);
  }
  requestAnimationFrame(remeasureRows);

  /* ---------------- Parallax hover halo (same effect as Selected Projects) ---------------- */
  // Each row gets its own halo (appended after the cyclic groups, so it's
  // left untouched by setupCyclicRow). It glides to whichever card in that
  // row is hovered, and rides along with the row's own transforms since
  // it's a normal child of the same row.
  rows.forEach((row) => {
    const halo = document.createElement("div");
    halo.className = "work-hover-bg";
    halo.setAttribute("aria-hidden", "true");
    row.appendChild(halo);
  });

  const HALO_PAD = 14;
  const parallaxRowsEl = document.getElementById("parallaxRows");

  parallaxRowsEl.addEventListener("mouseover", (e) => {
    const card = e.target.closest(".work-card");
    if (!card) return;
    const row = card.closest(".parallax-row");
    const halo = row.querySelector(".work-hover-bg");
    if (!halo) return;
    halo.style.left = `${card.offsetLeft - HALO_PAD}px`;
    halo.style.top = `${card.offsetTop - HALO_PAD}px`;
    halo.style.width = `${card.offsetWidth + HALO_PAD * 2}px`;
    halo.style.height = `${card.offsetHeight + HALO_PAD * 2}px`;
    halo.classList.add("is-visible");
  });

  parallaxRowsEl.addEventListener("mouseout", (e) => {
    const card = e.target.closest(".work-card");
    if (!card) return;
    const row = card.closest(".parallax-row");
    const relatedCard = e.relatedTarget && e.relatedTarget.closest
      ? e.relatedTarget.closest(".work-card")
      : null;
    const relatedRow = relatedCard ? relatedCard.closest(".parallax-row") : null;
    if (relatedRow !== row) {
      row.querySelector(".work-hover-bg").classList.remove("is-visible");
    }
  });

  /* ---------------- Hero parallax scroll effect ---------------- */
  const section = document.getElementById("work");
  const rowsEl = document.getElementById("parallaxRows");

  let ticking = false;

  function updateParallax() {
    ticking = false;
    if (!section) return;

    const rect = section.getBoundingClientRect();
    const scrollableHeight = section.offsetHeight - window.innerHeight;
    const scrolledInto = -rect.top;
    let progress = scrollableHeight > 0 ? scrolledInto / scrollableHeight : 0;
    progress = Math.min(Math.max(progress, 0), 1);

    const rotateX = 34 * (1 - progress);
    const rotateZ = 18 * (1 - progress);
    const scale = 0.78 + 0.22 * progress;
    const translateY = 24 * (1 - progress);
    const rowsOpacity = 0.25 + 0.75 * progress;

    if (rowsEl) {
      rowsEl.style.opacity = rowsOpacity;
      rowsEl.style.transform =
        `translateY(${translateY}px) rotateX(${rotateX}deg) rotateZ(${rotateZ}deg) scale(${scale})`;
    }

    // Rows 1 & 3 drift left, row 2 drifts right. Each row travels exactly
    // its own loop distance (shiftMax) over the full pin duration, so the
    // seam (repeat point) lands precisely when the section un-pins.
    rows.forEach((row, i) => {
      const max = shiftMaxes[i] || 0;
      const shift = progress * max;
      const direction = i === 1 ? 1 : -1;
      row.style.transform = `translateX(${direction * shift}px)`;
    });
  }

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    remeasureRows();
    onScroll();
  });
  updateParallax();

  /* ---------------- Lightbox popup ---------------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxTitle = document.getElementById("lightboxTitle");
  const lightboxCategory = document.getElementById("lightboxCategory");
  const lightboxClose = document.getElementById("lightboxClose");

  function openLightbox(card) {
    const { full, title, category } = card.dataset;
    lightboxImg.src = full;
    lightboxImg.alt = title || "";
    lightboxTitle.textContent = title || "";
    lightboxCategory.textContent = category || "";
    lightbox.classList.add("is-active");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("is-active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".work-card, .grid-card").forEach((card) => {
    card.addEventListener("click", () => openLightbox(card));
  });

  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  /* ---------------- Nav background on scroll ---------------- */
  const nav = document.getElementById("nav");
  function onNavScroll() {
    if (window.scrollY > 10) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  }
  window.addEventListener("scroll", onNavScroll, { passive: true });
  onNavScroll();
});
