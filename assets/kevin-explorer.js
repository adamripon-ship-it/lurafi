(() => {
  "use strict";
  if (customElements.get("kevin-explorer")) return;
  let library;
  const positions = {
    cover: ["-0.067m 0.071m 0.038m", "0 0.335 0.942", "-12deg 78deg 100%"],
    sound: ["0.060m 0.050m 0.046m", "0 0.335 0.942", "15deg 84deg 100%"],
    controls: ["-0.118m 0.136m 0.002m", "0 1 0", "0deg 20deg 90%"],
    bluetooth: ["0.091m 0.136m 0.002m", "0 1 0", "0deg 20deg 90%"],
    lamp: ["0.119m 0.136m 0.002m", "0 1 0", "0deg 20deg 90%"],
    status: ["-0.099m 0.136m 0.002m", "0 1 0", "0deg 20deg 90%"],
    sensing: ["-0.086m 0.136m 0.002m", "0 1 0", "0deg 20deg 90%"],
    light: ["0.090m 0.094m -0.026m", "0 0.349 -0.937", "180deg 78deg 100%"],
    clusters: ["0m 0.052m -0.039m", "0 0.349 -0.937", "180deg 78deg 100%"],
    reflectors: [
      "-0.091m 0.094m -0.026m",
      "0 0.349 -0.937",
      "180deg 78deg 100%",
    ],
    vents: ["0.030m 0.001m 0.008m", "0 -1 0", "0deg 167deg 100%"],
    feet: ["-0.111m 0.001m 0.038m", "0 -1 0", "-20deg 159deg 100%"],
  };
  const paths = {
    cover: "M5 5h14v14H5z M8 8h8v8H8z",
    sound: "M4 10h4l4-4v12l-4-4H4z M16 8q6 4 0 8 M15 11q2 1 0 2",
    controls: "M12 3v9 M7 5a8 8 0 1 0 10 0",
    bluetooth: "m8 7 9 10-5 4V3l5 4L8 17",
    lamp: "M9 17h6 M10 21h4 M9 15c0-3-3-3-3-7a6 6 0 0 1 12 0c0 4-3 4-3 7",
    status: "M12 8v5 M12 17h.01 M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18",
    light:
      "M12 8v8 M8 12h8 M12 2v3 M12 19v3 M2 12h3 M19 12h3 M5 5l2 2 M17 17l2 2 M5 19l2-2 M17 7l2-2",
    clusters:
      "M6 5h2v2H6z M6 11h2v2H6z M6 17h2v2H6z M16 5h2v2h-2z M16 11h2v2h-2z M16 17h2v2h-2z",
    reflectors: "M3 5l8 7-8 7 M13 5l8 7-8 7",
    vents: "M5 4v16 M10 4v16 M15 4v16 M20 4v16",
    feet: "M4 4h5v5H4z M15 4h5v5h-5z M4 15h5v5H4z M15 15h5v5h-5z",
  };
  const icon = (key) =>
    `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[key] || paths.status}"/></svg>`;
  const rootPath = () => window.Shopify?.routes?.root || "/";
  const reduced = () => matchMedia("(prefers-reduced-motion:reduce)").matches;
  async function request(url, options = {}) {
    const controller = new AbortController(),
      timer = setTimeout(() => controller.abort(), 20000);
    try {
      return await fetch(url, {
        ...options,
        credentials: "same-origin",
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timer);
    }
  }
  class KevinExplorer extends HTMLElement {
    connectedCallback() {
      if (this.ready) return;
      const data = this.querySelector("[data-ke-data]");
      if (!data) return;
      this.ready = true;
      this.config = JSON.parse(data.textContent);
      // Liquid translations may contain HTML entities; DOM text must show their characters.
      const decoder = document.createElement("textarea");
      for (const [key, value] of Object.entries(this.config.copy)) {
        decoder.innerHTML = value;
        this.config.copy[key] = decoder.value;
      }
      this.q = (s) => this.querySelector(s);
      this.all = (s) => [...this.querySelectorAll(s)];
      this.model = this.q("[data-ke-model]");
      this.dialog = this.q("dialog");
      this.content = this.q(".ke-content");
      this.colour = "grey";
      this.materialColour = "grey";
      this.originals = new Map();
      this.textures = new Map();
      this.pins = [];
      this.motion = !reduced();
      this.model.setAttribute("disable-zoom", "");
      this.q("[data-ke-load]").onclick = () => this.load();
      this.q("[data-ke-expand]").hidden =
        typeof this.dialog.showModal !== "function";
      this.q("[data-ke-expand]").onclick = () => this.expand();
      this.q("[data-ke-close]").onclick = () => this.close();
      this.q("[data-ke-dismiss]").onclick = () => this.dismissCallout();
      this.q("[data-ke-motion]").onclick = () => {
        this.motion = !this.motion;
        this.updateMotion();
      };
      this.dialog.addEventListener("cancel", (e) => {
        e.preventDefault();
        this.close();
      });
      this.onPop = () => {
        if (this.dialog.open) this.close(false);
      };
      window.addEventListener("popstate", this.onPop);
      this.all("[data-ke-colour]").forEach(
        (b) => (b.onclick = () => this.selectColour(b.dataset.keColour)),
      );
      this.all("[data-ke-feature]").forEach((b) => {
        b.insertAdjacentHTML("afterbegin", icon(b.dataset.keFeature));
        b.onclick = () => this.feature(b.dataset.keFeature, b);
      });
      this.all("[data-ke-orbit]").forEach(
        (b) =>
          (b.onclick = () => {
            this.dismissCallout(false);
            this.view(b.dataset.keOrbit);
          }),
      );
      this.q("[data-ke-placement]").onclick = () => {
        this.step = 0;
        this.guide();
      };
      this.q("[data-ke-prev]").onclick = () => {
        this.step--;
        this.guide();
      };
      this.q("[data-ke-next]").onclick = () => {
        if (this.step === 2) {
          this.q(".ke-guide").hidden = true;
          this.dismissCallout(false);
        } else {
          this.step++;
          this.guide();
        }
      };
      this.q("[data-ke-add]").onclick = () => this.addCover();
      if (this.q("[data-ke-buy]")) {
        this.q("[data-ke-buy]").onclick = () => this.addDevice();
        this.q("[data-ke-extra]").onchange = () => this.renderSelection();
      }
      this.renderSelection();
      this.detail("cover");
      this.updateMotion();
      this.q("[data-ke-feature=cover]").setAttribute("aria-pressed", "true");
      this.resize = new ResizeObserver(() => this.schedulePins());
      this.resize.observe(this.q(".ke-stage"));
      this.visible = new IntersectionObserver(([entry]) => {
        this.toggleAttribute("data-offscreen", !entry.isIntersecting);
      });
      this.visible.observe(this);
      this.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && !this.q("[data-ke-callout]").hidden) {
          event.preventDefault();
          event.stopPropagation();
          this.dismissCallout();
          return;
        }
        if (
          !["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(
            event.key,
          ) ||
          event.composedPath().includes(this.model)
        )
          return;
        const current = event.target.closest("button,summary,a");
        if (!current) return;
        const box = current.getBoundingClientRect(),
          x = box.x + box.width / 2,
          y = box.y + box.height / 2;
        const horizontal = ["ArrowLeft", "ArrowRight"].includes(event.key),
          sign = ["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1;
        const candidates = this.all(
          "button:not(:disabled),summary,a[href]",
        ).filter(
          (el) =>
            el !== current &&
            el.getClientRects().length &&
            !el.closest("model-viewer") &&
            !el.closest("[hidden]"),
        );
        const next = candidates
          .map((el) => {
            const r = el.getBoundingClientRect(),
              dx = r.x + r.width / 2 - x,
              dy = r.y + r.height / 2 - y;
            return {
              el,
              forward: (horizontal ? dx : dy) * sign,
              cross: Math.abs(horizontal ? dy : dx),
            };
          })
          .filter((p) => p.forward > 4)
          .sort(
            (a, b) => a.forward + a.cross * 3 - (b.forward + b.cross * 3),
          )[0];
        if (next) {
          event.preventDefault();
          next.el.focus();
        }
      });
    }
    disconnectedCallback() {
      window.removeEventListener("popstate", this.onPop);
      this.resize?.disconnect();
      this.visible?.disconnect();
      cancelAnimationFrame(this.pinFrame);
      if (this.dialog?.open) this.close(false);
    }
    t(key) {
      return this.config.copy[key] || key;
    }
    status(key) {
      this.q("[data-ke-status]").textContent = key ? this.t(key) : "";
    }
    money(amount) {
      return new Intl.NumberFormat(document.documentElement.lang || "en", {
        style: "currency",
        currency: this.config.currency || "CHF",
      }).format(amount / 100);
    }
    updateMotion() {
      this.toggleAttribute("data-still", !this.motion || reduced());
      const b = this.q("[data-ke-motion]");
      b.setAttribute("aria-pressed", String(this.motion));
      this.q("[data-ke-motion-state]").textContent = this.t(
        this.motion ? "on" : "off",
      );
    }
    animate(el) {
      if (!this.motion || reduced()) return;
      el.animate(
        [
          { opacity: 0.3, transform: "translateY(14px) scale(.98)" },
          { opacity: 1, transform: "translateY(0) scale(1)" },
        ],
        { duration: 320, easing: "cubic-bezier(.2,.7,.2,1)" },
      );
    }
    async load() {
      if (this.loaded) return true;
      if (this.loading) return this.loading;
      this.loading = (async () => {
        const button = this.q("[data-ke-load]");
        button.disabled = true;
        button.textContent = this.t("loading");
        this.setAttribute("aria-busy", "true");
        try {
          library ||= import(this.config.library).catch((error) => {
            library = null;
            throw error;
          });
          await library;
          await customElements.whenDefined("model-viewer");
          this.model.hidden = false;
          await new Promise((resolve, reject) => {
            const done = (error) => {
              clearTimeout(timeout);
              this.model.removeEventListener("load", onLoad);
              this.model.removeEventListener("error", onError);
              error ? reject(error) : resolve();
            };
            const onLoad = () => done(),
              onError = () => done(Error("model"));
            const timeout = setTimeout(() => done(Error("timeout")), 45000);
            this.model.addEventListener("load", onLoad, { once: true });
            this.model.addEventListener("error", onError, { once: true });
            this.model.src =
              matchMedia("(max-width:900px)").matches ||
              navigator.connection?.saveData
                ? this.config.mobile
                : this.config.desktop;
            if (this.model.loaded) done();
          });
          this.loaded = true;
          this.q("[data-ke-poster]").hidden = true;
          button.hidden = true;
          this.q(".ke-angles").hidden = false;
          this.q("[data-ke-marker-hint]").hidden = false;
          for (const mat of this.model.model.materials) {
            if (/Woven grey fabric|Fabric edge/i.test(mat.name))
              this.originals.set(mat, {
                base: mat.pbrMetallicRoughness.baseColorTexture.texture,
                normal: mat.normalTexture.texture,
                factor: [...mat.pbrMetallicRoughness.baseColorFactor],
              });
            if (/Warm white|Moulded rear|Top controls/.test(mat.name)) {
              const p = mat.pbrMetallicRoughness;
              p.setRoughnessFactor(0.64);
              const f = p.baseColorFactor;
              p.setBaseColorFactor([
                f[0] * 0.82,
                f[1] * 0.82,
                f[2] * 0.82,
                f[3],
              ]);
            }
          }
          this.makePins();
          this.model.addEventListener("camera-change", () =>
            this.schedulePins(),
          );
          this.schedulePins();
          return true;
        } catch (error) {
          this.model.hidden = true;
          this.model.removeAttribute("src");
          button.textContent = this.t("retry");
          this.status("failed");
          return false;
        } finally {
          button.disabled = false;
          this.setAttribute("aria-busy", "false");
          this.loading = null;
        }
      })();
      return this.loading;
    }
    renderSelection() {
      this.all("[data-ke-colour]").forEach((b) => {
        b.setAttribute(
          "aria-pressed",
          String(b.dataset.keColour === this.colour),
        );
        b.disabled = Boolean(this.pending);
      });
      this.q("[data-ke-colour-name]").textContent = this.t(this.colour);
      this.q("[data-ke-kind]").textContent = this.t(
        this.colour === "grey" ? "included" : "optional",
      );
      const offer = this.config.covers.find((v) => v.colour === this.colour),
        button = this.q("[data-ke-add]");
      button.hidden = this.colour === "grey";
      button.disabled = Boolean(
        this.pending || this.uncertain || !offer?.available,
      );
      button.textContent = this.t(
        this.pending
          ? "adding"
          : !offer?.available && this.colour !== "grey"
            ? "soldOut"
            : this.dataset.mode === "configure"
              ? "add_order"
              : "addCover",
      );
      this.q("[data-ke-price]").textContent = offer
        ? this.money(offer.amount)
        : "";
      const buy = this.q("[data-ke-buy]");
      if (!buy) return;
      const extra = this.q("[data-ke-extra]");
      if (this.colour === "grey") extra.checked = false;
      this.q("[data-ke-extra-label]").hidden = this.colour === "grey";
      extra.disabled = Boolean(this.pending || !offer?.available);
      this.q("[data-ke-extra-price]").textContent = offer
        ? this.money(offer.amount)
        : "";
      this.q("[data-ke-total]").textContent = this.money(
        this.config.device.amount + (extra.checked && offer ? offer.amount : 0),
      );
      buy.textContent = this.t(
        this.pending ? "adding" : extra.checked ? "add_bundle" : "add_device",
      );
      buy.disabled = Boolean(
        this.pending ||
        this.uncertain ||
        !this.config.device.available ||
        (extra.checked && !offer?.available),
      );
    }
    // Bake a small, evenly focused interior fabric sample into a mirrored tile.
    // This retains the reference weave/colour without projecting a whole perspective photograph.
    async fabricTexture(key) {
      const photo = new Image();
      photo.crossOrigin = "anonymous";
      photo.src = this.config.textures[key];
      await photo.decode();
      const size = Math.round(photo.width * 0.16),
        x = Math.round(photo.width * 0.34),
        y = Math.round(photo.height * 0.42);
      const tile = document.createElement("canvas");
      tile.width = tile.height = 512;
      const c = tile.getContext("2d");
      for (let row = 0; row < 2; row++)
        for (let col = 0; col < 2; col++) {
          c.save();
          c.translate(col ? 512 : 0, row ? 512 : 0);
          c.scale(col ? -1 : 1, row ? -1 : 1);
          c.drawImage(photo, x, y, size, size, 0, 0, 256, 256);
          c.restore();
        }
      const url = tile.toDataURL("image/png");
      return Promise.all([0, 1].map(() => this.model.createTexture(url)));
    }
    async selectColour(key) {
      if (
        !["grey", "white", "blue", "brown", "red"].includes(key) ||
        this.pending
      )
        return;
      this.colour = key;
      this.status("");
      this.renderSelection();
      this.refreshPrices(false);
      if (!(await this.load())) {
        if (this.colour === key) {
          this.colour = this.materialColour;
          this.renderSelection();
        }
        return;
      }
      try {
        let refs;
        if (key !== "grey") {
          if (!this.textures.has(key))
            this.textures.set(
              key,
              this.fabricTexture(key).catch((e) => {
                this.textures.delete(key);
                throw e;
              }),
            );
          refs = await this.textures.get(key);
        }
        if (this.colour !== key) return;
        for (const [mat, original] of this.originals) {
          const front = /Woven grey fabric/.test(mat.name),
            texture = refs ? refs[front ? 0 : 1] : original.base;
          mat.pbrMetallicRoughness.baseColorTexture.setTexture(texture);
          mat.normalTexture.setTexture(refs ? null : original.normal);
          mat.pbrMetallicRoughness.setBaseColorFactor(original.factor);
          if (refs) {
            texture.sampler.setRotation(0);
            texture.sampler.setScale(
              front ? { u: 3, v: 1 } : { u: 0.6, v: 0.15 },
            );
            texture.sampler.setOffset({ u: 0, v: 0 });
          }
        }
        this.materialColour = key;
        this.dataset.material = key;
        this.animate(this.q(".ke-selection"));
      } catch (error) {
        if (this.colour === key) {
          this.colour = this.materialColour;
          this.renderSelection();
          this.status("texture_error");
        }
      }
    }
    async view(orbit) {
      if (!(await this.load())) return;
      const stage = this.q(".ke-stage"),
        bounds = stage.getBoundingClientRect();
      if (bounds.bottom < 160 || bounds.top > innerHeight - 160)
        stage.scrollIntoView({ block: "center", behavior: "instant" });
      this.model.cameraOrbit = orbit;
      await this.model.updateComplete;
      if (!this.motion || reduced()) this.model.jumpCameraToGoal();
      this.schedulePins();
    }
    detail(prefix) {
      this.q("[data-ke-detail]").hidden = false;
      this.q("[data-ke-title]").textContent = this.t(prefix + "_title");
      this.q("[data-ke-body]").textContent = this.t(prefix + "_body");
      this.q("[data-ke-description]").textContent = this.t(prefix + "_detail");
      this.q("[data-ke-detail] details").open = false;
      this.animate(this.q("[data-ke-detail]"));
    }
    visual(key) {
      const type = [
        "light",
        "clusters",
        "reflectors",
        "lamp",
        "status",
        "sensing",
      ].includes(key)
        ? "light"
        : key === "sound" || key === "bluetooth"
          ? "sound"
          : key === "vents"
            ? "air"
            : key === "cover"
              ? "cover"
              : "control";
      return `<svg class="ke-demo ke-demo--${type}" viewBox="0 0 320 72"><rect class="ke-demo-device" x="24" y="22" width="56" height="34" rx="7"/><path class="ke-demo-base" d="M18 60h68 M288 10v52"/><g class="ke-demo-waves"><path d="M101 24q16 14 0 28"/><path d="M123 16q27 22 0 44"/><path d="M147 9q36 29 0 58"/></g><g class="ke-demo-beams"><path d="M82 31 285 12 285 32z"/><path d="M82 39 285 25 285 50z"/><path d="M82 47 285 43 285 64z"/></g><g class="ke-demo-air"><path d="M126 58V16m-7 8 7-8 7 8 M170 58V16m-7 8 7-8 7 8 M214 58V16m-7 8 7-8 7 8"/></g><rect class="ke-demo-cover" x="27" y="25" width="50" height="28" rx="5"/><circle class="ke-demo-press" cx="52" cy="38" r="9"/></svg>`;
    }
    showCallout(key, source) {
      const scrollBefore = window.scrollY;
      const pop = this.q("[data-ke-callout]");
      this.calloutSource = source || document.activeElement;
      this.q("[data-ke-callout-label]").textContent = this.t(key + "_label");
      this.q("[data-ke-callout-title]").textContent = this.t(key + "_title");
      this.q("[data-ke-callout-body]").textContent = this.t(key + "_body");
      this.q("[data-ke-callout-detail]").textContent = this.t(key + "_detail");
      this.q("[data-ke-visual]").innerHTML = this.visual(key);
      pop.querySelector("details").open = false;
      pop.hidden = false;
      if (typeof pop.showPopover === "function") {
        pop.setAttribute("popover", "manual");
        pop.showPopover();
      }
      this.animate(pop);
      this.q("[data-ke-callout-title]").focus({ preventScroll: true });
      window.scrollTo({ top: scrollBefore, behavior: "instant" });
    }
    dismissCallout(focus = true) {
      const pop = this.q("[data-ke-callout]");
      if (pop.hidden) return;
      if (typeof pop.hidePopover === "function" && pop.matches(":popover-open"))
        pop.hidePopover();
      pop.hidden = true;
      this.pins.forEach((p) => p.button.setAttribute("aria-expanded", "false"));
      if (focus && this.calloutSource?.isConnected)
        this.calloutSource.focus({ preventScroll: true });
    }
    async feature(key, source) {
      const target = key === "sensing" ? "status" : key;
      this.activeFeature = key;
      this.q(".ke-guide").hidden = true;
      this.all("[data-ke-feature]").forEach((b) =>
        b.setAttribute("aria-pressed", String(b.dataset.keFeature === target)),
      );
      this.detail(target);
      this.showCallout(target, source);
      this.pins.forEach((p) => {
        p.button.setAttribute("aria-pressed", String(p.key === key));
        p.button.setAttribute("aria-expanded", String(p.key === key));
      });
      await this.view(positions[key][2]);
    }
    makePins() {
      for (const [key, p] of Object.entries(positions)) {
        const anchor = document.createElement("span");
        anchor.slot = "hotspot-" + key;
        anchor.dataset.position = p[0];
        anchor.dataset.normal = p[1];
        anchor.className = "ke-anchor";
        this.model.append(anchor);
        const button = document.createElement("button");
        button.type = "button";
        button.className = "ke-pin";
        button.dataset.kePin = key;
        button.innerHTML = `<span>${icon(key === "sensing" ? "status" : key)}</span>`;
        button.setAttribute(
          "aria-label",
          this.t(
            (key === "sensing"
              ? "status"
              : key === "controls"
                ? "power"
                : key) + "_label",
          ),
        );
        button.setAttribute("aria-pressed", "false");
        button.setAttribute("aria-expanded", "false");
        button.hidden = true;
        button.onclick = () => this.feature(key, button);
        this.q("[data-ke-pins]").append(button);
        const line = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line",
        );
        this.q(".ke-leaders").append(line);
        this.pins.push({
          key,
          button,
          line,
          normal: p[1].split(" ").map(Number),
        });
      }
    }
    schedulePins() {
      if (!this.loaded || this.pinFrame) return;
      this.pinFrame = requestAnimationFrame(() => {
        this.pinFrame = null;
        this.layoutPins();
      });
    }
    layoutPins() {
      const { width: w, height: h } =
        this.q(".ke-stage").getBoundingClientRect();
      if (!w || !h) return;
      const orbit = this.model.getCameraOrbit(),
        camera = [
          Math.sin(orbit.phi) * Math.sin(orbit.theta),
          Math.cos(orbit.phi),
          Math.sin(orbit.phi) * Math.cos(orbit.theta),
        ],
        placed = [];
      for (const p of this.pins) {
        const point = this.model.queryHotspot("hotspot-" + p.key);
        const visible =
          Boolean(point) &&
          p.normal.reduce((v, n, i) => v + n * camera[i], 0) > 0.3;
        p.button.hidden = !visible;
        p.line.style.display = visible ? "" : "none";
        if (!visible) continue;
        const ax = point.canvasPosition.x,
          ay = point.canvasPosition.y,
          clamp = (v, min, max) => Math.max(min, Math.min(max, v));
        let best = null;
        for (const dy of [0, -60, 60, -120, 120])
          for (const dx of [0, -60, 60, -120, 120]) {
            const x = clamp(ax + dx, 30, w - 30),
              y = clamp(ay + dy, 30, h - 30);
            if (placed.some((v) => Math.hypot(v.x - x, v.y - y) < 60)) continue;
            const score = dx * dx + dy * dy;
            if (!best || score < best.score) best = { x, y, score };
          }
        if (!best) {
          p.button.hidden = true;
          p.line.style.display = "none";
          continue;
        }
        placed.push(best);
        p.button.style.left = best.x + "px";
        p.button.style.top = best.y + "px";
        for (const [k, v] of Object.entries({
          x1: ax,
          y1: ay,
          x2: best.x,
          y2: best.y,
        }))
          p.line.setAttribute(k, String(v));
      }
    }
    guide() {
      this.dismissCallout(false);
      this.all("[data-ke-feature]").forEach((b) =>
        b.setAttribute("aria-pressed", "false"),
      );
      this.detail("placement_" + this.step);
      this.q(".ke-guide").hidden = false;
      this.q("[data-ke-step]").textContent = `${this.step + 1} / 3`;
      this.q("[data-ke-prev]").disabled = this.step === 0;
      this.q("[data-ke-next]").textContent = this.t(
        this.step === 2 ? "done" : "next",
      );
      this.q("[data-ke-detail]").scrollIntoView({
        block: "nearest",
        behavior: this.motion && !reduced() ? "smooth" : "instant",
      });
      this.view(
        ["-25deg 77deg 100%", "180deg 78deg 100%", "0deg 167deg 100%"][
          this.step
        ],
      );
    }
    expand() {
      if (this.dialog.open) return;
      this.dismissCallout(false);
      this.focusBefore = document.activeElement;
      this.scrollBefore = window.scrollY;
      this.overflowBefore = document.documentElement.style.overflow;
      this.dialog.append(this.content);
      this.q("[data-ke-close]").hidden = false;
      this.q("[data-ke-expand]").hidden = true;
      this.model.removeAttribute("disable-zoom");
      this.dialog.showModal();
      document.documentElement.style.overflow = "hidden";
      history.pushState(
        { ...history.state, kevinExplorer: this.dataset.instance },
        "",
      );
      this.q("[data-ke-close]").focus();
      this.load();
      this.schedulePins();
    }
    close(back = true) {
      if (!this.dialog.open) return;
      this.dismissCallout(false);
      this.dialog.close();
      this.prepend(this.content);
      this.q("[data-ke-close]").hidden = true;
      this.q("[data-ke-expand]").hidden = false;
      this.model.setAttribute("disable-zoom", "");
      document.documentElement.style.overflow = this.overflowBefore;
      window.scrollTo({ top: this.scrollBefore, behavior: "instant" });
      this.focusBefore?.focus({ preventScroll: true });
      this.schedulePins();
      if (back && history.state?.kevinExplorer === this.dataset.instance)
        history.back();
    }
    async refreshPrices(required = false) {
      const offer = this.config.covers.find((v) => v.colour === this.colour),
        items = [this.config.device, offer].filter((v) => v?.id);
      try {
        await Promise.all(
          items.map(async (item) => {
            const r = await request(rootPath() + `variants/${item.id}.js`);
            if (!r.ok) throw Error("availability");
            const v = await r.json();
            item.available = v.available;
            if (typeof v.price === "number") item.amount = v.price;
          }),
        );
        this.renderSelection();
        return true;
      } catch (error) {
        if (required) throw error;
        return false;
      }
    }
    async addCover() {
      const offer = this.config.covers.find((v) => v.colour === this.colour);
      if (
        this.pending ||
        this.uncertain ||
        this.colour === "grey" ||
        !offer?.available
      )
        return;
      if (this.dataset.mode === "configure") {
        const card = document.querySelector(
            `[data-cover-colour="${this.colour}"]`,
          ),
          plus = card?.querySelector("[data-cover-plus]");
        if (!plus || card.dataset.coverSoon === "1") {
          this.status("soldOut");
          return;
        }
        plus.click();
        this.status("order_added");
        this.animate(this.q("[data-ke-status]"));
        return;
      }
      await this.addItems([offer], "added");
    }
    async addDevice() {
      const offer = this.config.covers.find((v) => v.colour === this.colour);
      const items = [this.config.device];
      if (this.q("[data-ke-extra]").checked && offer) items.push(offer);
      await this.addItems(items, "bundle_added");
    }
    async addItems(items, success) {
      if (
        this.pending ||
        this.uncertain ||
        items.some((i) => !i?.id || !i.available)
      )
        return;
      this.pending = true;
      this.renderSelection();
      this.status("");
      let sent = false;
      try {
        await this.refreshPrices(true);
        if (items.some((i) => !i.available)) {
          this.status("soldOut");
          return;
        }
        sent = true;
        const result = await request(rootPath() + "cart/add.js", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            items: items.map((i) => ({ id: i.id, quantity: 1 })),
          }),
        });
        if (!result.ok) {
          if (result.status >= 400 && result.status < 500) sent = false;
          throw Error("cart");
        }
        this.status(success);
        this.q("[data-ke-cart]").hidden = false;
        window.LurafiCart?.refreshCount()?.catch(() => {});
        this.animate(this.q("[data-ke-status]"));
      } catch (error) {
        this.uncertain = sent;
        this.status(sent ? "cartUnknown" : "cartError");
        this.q("[data-ke-cart]").hidden = !sent;
      } finally {
        this.pending = false;
        this.renderSelection();
      }
    }
  }
  customElements.define("kevin-explorer", KevinExplorer);
  function setupGallery() {
    const gallery = document.querySelector("[data-configure-gallery]");
    if (!gallery || gallery.dataset.keReady) return;
    gallery.dataset.keReady = "true";
    const shell = gallery.querySelector("[data-ke-configurator]"),
      explorer = shell?.querySelector("kevin-explorer");
    if (!explorer) return;
    const photos = gallery.querySelector("[data-ke-photos]"),
      view = gallery.querySelector("[data-ke-view]"),
      parts = gallery.querySelectorAll(
        ".configure-gallery__well,.configure-gallery__thumbs",
      );
    const switchView = (active, colour) => {
      shell.hidden = !active;
      parts.forEach((el) => (el.hidden = active));
      photos.setAttribute("aria-pressed", String(!active));
      view.setAttribute("aria-pressed", String(active));
      if (active) colour ? explorer.selectColour(colour) : explorer.load();
    };
    photos.onclick = () => {
      explorer.dismissCallout(false);
      switchView(false);
    };
    view.onclick = () => switchView(true);
    document.querySelectorAll("[data-ke-preview]").forEach(
      (button) =>
        (button.onclick = () => {
          switchView(true, button.dataset.kePreview);
          gallery.scrollIntoView({
            block: "start",
            behavior: reduced() ? "instant" : "smooth",
          });
          view.focus({ preventScroll: true });
        }),
    );
  }
  setupGallery();
  document.addEventListener("shopify:section:load", setupGallery);
})();
