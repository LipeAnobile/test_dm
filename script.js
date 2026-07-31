"use strict";

(() => {
  const galleryImages = [
    { src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=85", alt: "Vista externa do pesqueiro em meio à natureza" },
    { src: "https://images.unsplash.com/photo-1544551763-77ef2d0cfc6c?auto=format&fit=crop&w=1200&q=85", alt: "Lago tranquilo com área de pesca" },
    { src: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=85", alt: "Prato de peixe fresco preparado no restaurante" },
    { src: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=85", alt: "Área externa do restaurante com mesas" },
    { src: "https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=85", alt: "Ambiente familiar cercado pela natureza" }
  ];

  // Dados fictícios usados somente para demonstrar a experiência de stories.
  const stories = [
    { image: galleryImages[0].src, title: "Um dia em meio à natureza", description: "Conheça nosso lago e aproveite momentos de tranquilidade" },
    { image: galleryImages[1].src, title: "Pesca para toda a família", description: "Uma experiência de lazer para adultos e crianças" },
    { image: galleryImages[2].src, title: "Peixes frescos", description: "Pratos preparados com sabores da culinária brasileira" },
    { image: galleryImages[3].src, title: "Área ao ar livre", description: "Mesas externas, natureza e espaço para relaxar" },
    { image: galleryImages[4].src, title: "Planeje sua visita", description: "Estamos abertos hoje das 06:30 às 18:00" }
  ];

  let toastTimer;
  const icon = (name) => `<svg aria-hidden="true"><use href="#${name}"></use></svg>`;

  function handleImageError(event) {
    const image = event.currentTarget;
    image.hidden = true;
    image.parentElement.classList.add("image-fallback");
    image.parentElement.setAttribute("aria-label", image.alt || "Imagem indisponível");
  }

  function initGallery() {
    const track = document.querySelector("#galleryTrack");
    const dots = document.querySelector("#galleryDots");
    const count = document.querySelector("#galleryCount");
    let current = 0;
    let touchStart = 0;
    galleryImages.forEach((item, index) => {
      const slide = document.createElement("div");
      slide.className = "gallery-slide";
      const image = new Image();
      image.src = item.src; image.alt = item.alt; image.draggable = false;
      image.addEventListener("error", handleImageError);
      slide.append(image); track.append(slide);
      const dot = document.createElement("button");
      dot.type = "button"; dot.setAttribute("aria-label", `Mostrar imagem ${index + 1}`);
      dot.addEventListener("click", () => show(index)); dots.append(dot);
    });
    const show = (index) => {
      current = (index + galleryImages.length) % galleryImages.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      count.textContent = `${current + 1}/${galleryImages.length}`;
      [...dots.children].forEach((dot, i) => dot.classList.toggle("active", i === current));
    };
    document.querySelector("#galleryPrev").addEventListener("click", () => show(current - 1));
    document.querySelector("#galleryNext").addEventListener("click", () => show(current + 1));
    track.addEventListener("touchstart", (event) => { touchStart = event.changedTouches[0].clientX; }, { passive: true });
    track.addEventListener("touchend", (event) => {
      const distance = event.changedTouches[0].clientX - touchStart;
      if (Math.abs(distance) > 45) show(current + (distance < 0 ? 1 : -1));
    }, { passive: true });
    show(0);
    document.querySelector("#backButton").addEventListener("click", () => {
      if (window.history.length > 1) window.history.back(); else window.location.href = "#";
    });
  }

  function initStories() {
    const viewer = document.querySelector("#storyViewer");
    const avatar = document.querySelector("#storyAvatar");
    const hint = document.querySelector("#storyHint");
    const progress = document.querySelector("#storyProgress");
    let current = 0, timer = 0, startedAt = 0, remaining = 5000, paused = false, lastFocus = null;

    stories.forEach(() => {
      const track = document.createElement("div"); track.className = "progress-track";
      const fill = document.createElement("div"); fill.className = "progress-fill";
      track.append(fill); progress.append(track);
    });
    const fills = [...progress.querySelectorAll(".progress-fill")];

    function updateProgress(duration) {
      fills.forEach((fill, i) => {
        fill.style.transition = "none";
        fill.style.width = i < current ? "100%" : "0%";
      });
      const fill = fills[current];
      requestAnimationFrame(() => requestAnimationFrame(() => {
        fill.style.transition = `width ${duration}ms linear`;
        fill.style.width = "100%";
      }));
    }
    function showStory(index) {
      clearTimeout(timer); current = index; remaining = 5000; paused = false;
      const story = stories[current];
      document.querySelector("#storyBackground").style.backgroundImage = `url("${story.image}")`;
      document.querySelector("#storyTitle").textContent = story.title;
      document.querySelector("#storyDescription").textContent = story.description;
      document.querySelector("#storyIndex").textContent = `Story ${current + 1} de ${stories.length}`;
      updateProgress(remaining); startedAt = Date.now(); timer = window.setTimeout(nextStory, remaining);
    }
    function openStoryViewer() {
      lastFocus = document.activeElement; viewer.hidden = false; document.body.classList.add("story-open");
      showStory(0); document.querySelector("#storyClose").focus();
    }
    function closeStoryViewer() {
      clearTimeout(timer); viewer.hidden = true; document.body.classList.remove("story-open");
      hint.hidden = true; avatar.classList.add("story-viewed");
      lastFocus?.focus();
    }
    function nextStory() { if (current < stories.length - 1) showStory(current + 1); else closeStoryViewer(); }
    function previousStory() { showStory(Math.max(0, current - 1)); }
    function pauseStory() {
      if (paused || viewer.hidden) return; paused = true; clearTimeout(timer);
      remaining = Math.max(0, remaining - (Date.now() - startedAt));
      const fill = fills[current]; const width = getComputedStyle(fill).width;
      fill.style.transition = "none"; fill.style.width = width;
    }
    function resumeStory() {
      if (!paused || viewer.hidden) return; paused = false; startedAt = Date.now();
      const fill = fills[current]; requestAnimationFrame(() => { fill.style.transition = `width ${remaining}ms linear`; fill.style.width = "100%"; });
      timer = window.setTimeout(nextStory, remaining);
    }
    avatar.addEventListener("click", openStoryViewer);
    document.querySelector("#storyClose").addEventListener("click", closeStoryViewer);
    document.querySelector("#storyBack").addEventListener("click", closeStoryViewer);
    document.querySelector("#storyNext").addEventListener("click", nextStory);
    document.querySelector("#storyPrevious").addEventListener("click", previousStory);
    viewer.addEventListener("pointerdown", (event) => { if (event.target.classList.contains("story-side")) pauseStory(); });
    viewer.addEventListener("pointerup", resumeStory); viewer.addEventListener("pointercancel", resumeStory);
    document.addEventListener("keydown", (event) => {
      if (viewer.hidden) return;
      if (event.key === "Escape") closeStoryViewer();
      if (event.key === "ArrowRight") nextStory();
      if (event.key === "ArrowLeft") previousStory();
    });
  }

  function showToast(message) {
    const toast = document.querySelector("#toast");
    clearTimeout(toastTimer); toast.textContent = message; toast.classList.add("show");
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2400);
  }

  function initFavorite() {
    const button = document.querySelector("#favoriteButton");
    button.addEventListener("click", () => {
      const active = button.getAttribute("aria-pressed") === "true";
      button.setAttribute("aria-pressed", String(!active));
      button.setAttribute("aria-label", active ? "Adicionar aos favoritos" : "Remover dos favoritos");
      showToast(active ? "Removido dos favoritos" : "Adicionado aos favoritos");
    });
  }

  function initShare() {
    document.querySelector("#shareButton").addEventListener("click", async () => {
      const data = { title: "Pesqueiro Esfera Clube", text: "Conheça o Pesqueiro Esfera Clube", url: "https://app.digitalmapas.com.br/esfera-clube" };
      try {
        if (navigator.share) { await navigator.share(data); return; }
        if (!navigator.clipboard) throw new Error("Clipboard indisponível");
        await navigator.clipboard.writeText(data.url); showToast("Link copiado");
      } catch (error) {
        if (error.name !== "AbortError") showToast("Não foi possível compartilhar");
      }
    });
  }

  function initSchedule() {
    const toggle = document.querySelector("#scheduleToggle"); const panel = document.querySelector("#weeklySchedule");
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!expanded)); panel.hidden = expanded;
    });
  }

  function initSectionNavigation() {
    const buttons = [...document.querySelectorAll(".section-nav button")];
    const setActive = (id) => buttons.forEach((item) => item.classList.toggle("active", item.dataset.section === id));
    buttons.forEach((button) => button.addEventListener("click", () => {
      setActive(button.dataset.section);
      document.getElementById(button.dataset.section).scrollIntoView({ behavior: "smooth", block: "start" });
    }));
    if (!("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver((entries) => {
      if (Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 20) {
        setActive("resources");
        return;
      }
      entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio).slice(0, 1).forEach((entry) => {
        setActive(entry.target.id);
      });
    }, { rootMargin: "-20% 0px -60%", threshold: [0, .25, .6] });
    ["overview", "information", "resources"].forEach((id) => observer.observe(document.getElementById(id)));
  }

  function initDemoActions() {
    document.querySelectorAll("[data-demo]").forEach((button) => button.addEventListener("click", () => showToast(button.dataset.demo)));
    document.querySelector("#routeButton").addEventListener("click", () => showToast("Abrindo rota"));
    document.querySelectorAll("img").forEach((image) => image.addEventListener("error", handleImageError));
  }

  initGallery(); initStories(); initFavorite(); initShare(); initSchedule(); initSectionNavigation(); initDemoActions();
})();
