(function () {
  const MANUAL_PATHS = {
    es: "../reference/user/manual.md",
    en: "../reference/user/manual.en.md",
    ca: "../reference/user/manual.ca.md"
  };

  const TEXT = {
    es: {
      title: "Ayuda",
      kicker: "EdEX",
      loading: "Cargando ayuda...",
      error: "No se pudo cargar la ayuda."
    },
    en: {
      title: "Help",
      kicker: "EdEX",
      loading: "Loading help...",
      error: "Could not load help."
    },
    ca: {
      title: "Ajuda",
      kicker: "EdEX",
      loading: "Carregant ajuda...",
      error: "No s'ha pogut carregar l'ajuda."
    }
  };

  function normalizeLang(lang) {
    const clean = String(lang || "").trim().toLowerCase().split("-")[0];
    return MANUAL_PATHS[clean] ? clean : "es";
  }

  function getLang() {
    try {
      const params = new URLSearchParams(window.location.search || "");
      return normalizeLang(params.get("lang") || "");
    } catch {
      return "es";
    }
  }

  function escapeHtml(text) {
    return String(text || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function renderInline(text) {
    let html = escapeHtml(text);
    html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
    return html;
  }

  function flushParagraph(paragraph, out) {
    if (!paragraph.length) return;
    out.push(`<p>${renderInline(paragraph.join(" "))}</p>`);
    paragraph.length = 0;
  }

  function flushList(list, out) {
    if (!list.items.length) return;
    const tag = list.type === "ol" ? "ol" : "ul";
    out.push(`<${tag}>${list.items.map((item) => `<li>${renderInline(item)}</li>`).join("")}</${tag}>`);
    list.type = "";
    list.items = [];
  }

  function renderMarkdown(md) {
    const out = [];
    const paragraph = [];
    const list = { type: "", items: [] };
    const lines = String(md || "").replace(/\r/g, "").split("\n");

    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      const trimmed = line.trim();

      if (!trimmed) {
        flushParagraph(paragraph, out);
        flushList(list, out);
        continue;
      }

      const heading = trimmed.match(/^(#{1,3})\s+(.*)$/);
      if (heading) {
        flushParagraph(paragraph, out);
        flushList(list, out);
        const level = heading[1].length;
        out.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
        continue;
      }

      const ordered = trimmed.match(/^\d+\.\s+(.*)$/);
      if (ordered) {
        flushParagraph(paragraph, out);
        if (list.type && list.type !== "ol") flushList(list, out);
        list.type = "ol";
        list.items.push(ordered[1]);
        continue;
      }

      const bullet = trimmed.match(/^-\s+(.*)$/);
      if (bullet) {
        flushParagraph(paragraph, out);
        if (list.type && list.type !== "ul") flushList(list, out);
        list.type = "ul";
        list.items.push(bullet[1]);
        continue;
      }

      flushList(list, out);
      paragraph.push(trimmed);
    }

    flushParagraph(paragraph, out);
    flushList(list, out);
    return out.join("\n");
  }

  async function boot() {
    const lang = getLang();
    const text = TEXT[lang] || TEXT.es;
    const titleEl = document.getElementById("helpTitle");
    const kickerEl = document.getElementById("helpKicker");
    const contentEl = document.getElementById("helpContent");
    document.documentElement.lang = lang;
    document.title = `${text.title} · EdEX`;
    if (titleEl) titleEl.textContent = text.title;
    if (kickerEl) kickerEl.textContent = text.kicker;
    if (contentEl) contentEl.innerHTML = `<p class="help-status">${text.loading}</p>`;

    try {
      const response = await fetch(MANUAL_PATHS[lang], { cache: "no-store" });
      if (!response.ok) throw new Error(String(response.status));
      const markdown = await response.text();
      if (!contentEl) return;
      contentEl.innerHTML = renderMarkdown(markdown);
      const firstHeading = contentEl.querySelector("h1");
      if (firstHeading instanceof HTMLElement) {
        document.title = `${firstHeading.textContent || text.title} · EdEX`;
      }
    } catch (error) {
      if (!contentEl) return;
      contentEl.innerHTML = `<p class="help-error">${text.error}</p>`;
      console.error(error);
    }
  }

  boot();
})();
