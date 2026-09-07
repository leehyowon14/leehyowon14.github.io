import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

export function loadHero({ width = 562, height = 630, reduced = false, source } = {}) {
  const events = new Map();
  const frames = new Map();
  const allocations = [];
  const styles = new Map();
  const bounds = { width, height, left: 0, top: 0 };
  let frameId = 0;
  let draws = 0;
  let observer;
  const listen = (name, callback) => events.set(name, callback);
  const context = {
    createImageData(w, h) {
      const data = new Uint8ClampedArray(w * h * 4);
      allocations.push({ width: w, height: h, data });
      return { data };
    },
    putImageData() { draws += 1; },
    fillRect() {},
    drawImage() {},
  };
  const canvas = { getContext: () => context, getBoundingClientRect: () => bounds };
  const hero = { addEventListener: listen, getBoundingClientRect: () => bounds };
  const artwork = { style: { setProperty: (name, value) => styles.set(name, value) } };
  const motion = { matches: reduced, addEventListener: listen };
  const document = {
    hidden: false,
    querySelector: selector => ({ '#surge-canvas': canvas, '.editorial-hero': hero, '.hero-surge': artwork })[selector],
    createElement: () => ({ getContext: () => context }),
    addEventListener: listen,
  };
  const sandbox = {
    Math, performance, document,
    window: { matchMedia: () => motion, devicePixelRatio: 2, addEventListener: listen, scrollY: 0, innerHeight: 900 },
    requestAnimationFrame(callback) { frames.set(++frameId, callback); return frameId; },
    cancelAnimationFrame(id) { frames.delete(id); },
    IntersectionObserver: class { constructor(callback) { observer = callback; } observe() {} },
  };
  runInNewContext(source ?? readFileSync(new URL('../../hero-texture.js', import.meta.url), 'utf8'), sandbox);
  return {
    allocations, frames, styles, bounds, document, motion,
    get draws() { return draws; },
    emit: (name, event) => events.get(name)?.(event),
    intersect: isIntersecting => observer([{ isIntersecting }]),
    frame(timestamp) {
      const pending = [...frames.values()];
      frames.clear();
      pending.forEach(callback => callback(timestamp));
    },
  };
}
