/* ============================================================
   Static Surge — time, pointer, and scroll responsive hero field
   ============================================================ */
(() => {
  "use strict";

  const canvas = document.querySelector("#surge-canvas");
  const hero = document.querySelector(".editorial-hero");
  const artwork = document.querySelector(".hero-surge");

  if (!canvas || !hero || !artwork) return;

  const context = canvas.getContext("2d", { alpha: false });
  const field = document.createElement("canvas");
  const fieldContext = field.getContext("2d", { alpha: false });
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!context || !fieldContext) return;

  const palette = {
    ink: [2, 4, 4],
    teal: [5, 43, 45],
    ember: [229, 35, 9],
    orange: [255, 105, 37],
    cream: [247, 237, 217],
  };

  let imageData;
  let fieldWidth = 260;
  let fieldHeight = 390;
  let canvasWidth = 1;
  let canvasHeight = 1;
  let pointerX = 0;
  let pointerY = 0;
  let currentX = 0;
  let currentY = 0;
  let scrollPhase = 0;
  let active = true;
  let frameId = null;
  let lastFrame = 0;
  const frameInterval = 1000 / 24;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const mix = (from, to, amount) => from + (to - from) * amount;
  const smoothstep = (edge0, edge1, value) => {
    const amount = clamp((value - edge0) / (edge1 - edge0));
    return amount * amount * (3 - 2 * amount);
  };
  const hash = (x, y, seed) => {
    const value = Math.sin(x * 12.9898 + y * 78.233 + seed * 37.719) * 43758.5453;
    return value - Math.floor(value);
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvasWidth = Math.max(1, Math.round(rect.width * dpr));
    canvasHeight = Math.max(1, Math.round(rect.height * dpr));
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    const aspect = Math.max(1.1, rect.height / Math.max(rect.width, 1));
    fieldWidth = rect.width < 520 ? 640 : 800;
    fieldHeight = Math.round(fieldWidth * aspect);
    field.width = fieldWidth;
    field.height = fieldHeight;
    imageData = fieldContext.createImageData(fieldWidth, fieldHeight);
    context.imageSmoothingEnabled = true;
    drawField(reduceMotion ? 0.72 : performance.now() * 0.001);
  };

  const colorize = (energy, heat, shadow, grain) => {
    let base = palette.ink;
    let target = palette.teal;
    let amount = clamp(shadow * 0.72 + energy * 0.18);

    if (energy > 0.19) {
      base = [
        mix(palette.ink[0], palette.teal[0], amount),
        mix(palette.ink[1], palette.teal[1], amount),
        mix(palette.ink[2], palette.teal[2], amount),
      ];
      target = palette.ember;
      amount = smoothstep(0.16, 0.52, energy + heat * 0.12);
    }

    let red = mix(base[0], target[0], amount);
    let green = mix(base[1], target[1], amount);
    let blue = mix(base[2], target[2], amount);

    const orangeAmount = smoothstep(0.48, 0.77, energy + heat * 0.2);
    red = mix(red, palette.orange[0], orangeAmount);
    green = mix(green, palette.orange[1], orangeAmount);
    blue = mix(blue, palette.orange[2], orangeAmount);

    const creamAmount = smoothstep(0.76, 1.02, energy + heat * 0.16);
    red = mix(red, palette.cream[0], creamAmount);
    green = mix(green, palette.cream[1], creamAmount);
    blue = mix(blue, palette.cream[2], creamAmount);

    const noise = (grain - 0.5) * (energy > 0.12 ? 54 : 20);
    return [
      clamp(red + noise, 0, 255),
      clamp(green + noise, 0, 255),
      clamp(blue + noise, 0, 255),
    ];
  };

  function drawField(time) {
    if (!imageData) return;

    currentX += (pointerX - currentX) * 0.045;
    currentY += (pointerY - currentY) * 0.045;

    const pixels = imageData.data;
    const seed = Math.floor(time * 18);

    for (let y = 0; y < fieldHeight; y += 1) {
      const v = y / fieldHeight;
      const vertical = v * 2 - 1;

      for (let x = 0; x < fieldWidth; x += 1) {
        const u = x / fieldWidth;
        const horizontal = u * 2 - 1;
        const wave =
          Math.sin(vertical * 3.8 + time * 0.58) * 0.2 +
          Math.sin(vertical * 8.4 - time * 0.24) * 0.07 +
          currentX * 0.18;
        const ribbonCenter = wave + Math.sin(vertical * 1.35 + time * 0.18) * 0.24;
        const ribbonDistance = Math.abs(horizontal - ribbonCenter);
        const ribbon = Math.exp(-Math.pow(ribbonDistance / 0.17, 2));

        const surgeCenter =
          -0.56 +
          Math.sin(vertical * 2.1 - time * 0.42) * 0.13 +
          currentY * 0.08;
        const surgeDistance = Math.abs(horizontal - surgeCenter);
        const surge = Math.exp(-Math.pow(surgeDistance / 0.1, 2));

        const foldCenter = 0.6 + Math.sin(vertical * 5.5 + time * 0.31) * 0.1;
        const fold = Math.exp(-Math.pow(Math.abs(horizontal - foldCenter) / 0.22, 2));
        const flare = Math.exp(
          -(
            Math.pow((horizontal - 0.34 - currentX * 0.1) / 0.52, 2) +
            Math.pow((vertical - 0.45 + Math.sin(time * 0.22) * 0.08) / 0.33, 2)
          )
        );

        const scan = 0.5 + 0.5 * Math.sin(x * 0.18 + y * 0.032 + time * 2.3);
        const breakup = hash(x * 0.73, y * 0.91, seed);
        const sparse = breakup > 0.22 ? 1 : breakup * 0.46;
        const energy = clamp(
          (ribbon * 0.74 + surge * 0.85 + fold * 0.55 + flare * 0.66) *
            (0.74 + scan * 0.26) *
            sparse
        );
        const heat = clamp(flare * 0.7 + fold * 0.32 + Math.max(0, vertical) * 0.12);
        const shadow = clamp(0.28 + (1 - ribbon) * 0.2 + Math.sin(v * 7 + time * 0.2) * 0.08);
        const grain = hash(x, y, seed);
        const [red, green, blue] = colorize(energy, heat, shadow, grain);
        const index = (y * fieldWidth + x) * 4;

        pixels[index] = red;
        pixels[index + 1] = green;
        pixels[index + 2] = blue;
        pixels[index + 3] = 255;
      }
    }

    fieldContext.putImageData(imageData, 0, 0);
    context.fillStyle = "#020404";
    context.fillRect(0, 0, canvasWidth, canvasHeight);
    context.drawImage(field, 0, 0, canvasWidth, canvasHeight);
  }

  const animate = (timestamp) => {
    frameId = null;
    if (!active || document.hidden || reduceMotion) return;

    if (timestamp - lastFrame >= frameInterval) {
      const time = timestamp * 0.001 + scrollPhase * 1.9;
      drawField(time);
      lastFrame = timestamp;
    }

    frameId = requestAnimationFrame(animate);
  };

  const start = () => {
    if (reduceMotion || frameId || !active || document.hidden) return;
    frameId = requestAnimationFrame(animate);
  };

  const stop = () => {
    if (!frameId) return;
    cancelAnimationFrame(frameId);
    frameId = null;
  };

  hero.addEventListener("pointermove", (event) => {
    const rect = hero.getBoundingClientRect();
    pointerX = clamp((event.clientX - rect.left) / rect.width, 0, 1) * 2 - 1;
    pointerY = clamp((event.clientY - rect.top) / rect.height, 0, 1) * 2 - 1;
    artwork.style.setProperty("--surge-tilt-x", `${pointerX * 2.2}deg`);
    artwork.style.setProperty("--surge-tilt-y", `${pointerY * -1.8}deg`);
  });

  hero.addEventListener("pointerleave", () => {
    pointerX = 0;
    pointerY = 0;
    artwork.style.setProperty("--surge-tilt-x", "0deg");
    artwork.style.setProperty("--surge-tilt-y", "0deg");
  });

  window.addEventListener(
    "scroll",
    () => {
      scrollPhase = clamp(window.scrollY / Math.max(window.innerHeight, 1), 0, 1.5);
    },
    { passive: true }
  );

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

  const observer = new IntersectionObserver(
    ([entry]) => {
      active = entry.isIntersecting;
      if (active) start();
      else stop();
    },
    { threshold: 0.02 }
  );

  observer.observe(hero);
  window.addEventListener("resize", resize, { passive: true });
  resize();
  start();
})();
