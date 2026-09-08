import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

export function loadNavigation({ reduced = false, desktop = true } = {}) {
  const frames = new Map();
  const timers = new Map();
  const scrolls = [];
  const history = [];
  let sequence = 0;
  let scrollY = 0;
  const document = { documentElement: { scrollHeight: 5000, dataset: {} }, activeElement: null };
  class Element {
    constructor(id, top = 0, tag = 'section') {
      this.id = id;
      this.top = top;
      this.tag = tag;
      this.offsetHeight = 900;
      this.dataset = {};
      this.attributes = new Map();
      this.events = new Map();
      this.children = [];
      const classes = new Set();
      this.classList = {
        toggle(name, active) { if (active) classes.add(name); else classes.delete(name); },
        contains: name => classes.has(name),
      };
    }
    addEventListener(name, callback) {
      this.events.set(name, [...(this.events.get(name) ?? []), callback]);
    }
    emit(name, options = {}) {
      const event = { target: this, button: 0, defaultPrevented: false, preventDefault() { this.defaultPrevented = true; }, ...options };
      this.events.get(name)?.forEach(callback => callback(event));
      return event;
    }
    getAttribute(name) { return this.attributes.get(name) ?? null; }
    hasAttribute(name) { return this.attributes.has(name); }
    setAttribute(name, value) { this.attributes.set(name, value); }
    removeAttribute(name) { this.attributes.delete(name); }
    getBoundingClientRect() { return { top: this.top - scrollY, bottom: this.top + this.offsetHeight - scrollY }; }
    matches(selector) { return selector === '[data-nav]' && this.tag === 'a'; }
    closest(selector) { return selector.split(',').map(item => item.trim()).includes(this.tag) ? this : null; }
    contains(target) { return target === this || this.children.includes(target); }
    focus() { document.activeElement = this; }
    querySelector() { return this.children[0] ?? null; }
    querySelectorAll() { return this.children; }
  }
  const top = new Element('top');
  const about = new Element('about', 900);
  const contact = new Element('contact', 2700);
  const nav = new Element('site-nav', 0, 'nav');
  const menu = new Element('menu-btn', 0, 'button');
  menu.setAttribute('aria-expanded', 'false');
  const links = [about, contact].map(target => {
    const link = new Element(`${target.id}-link`, 0, 'a');
    link.setAttribute('href', `#${target.id}`);
    target.dataset.navSection = `#${target.id}`;
    return link;
  });
  nav.children = links;
  const nodes = [top, about, contact, nav, menu];
  document.querySelector = selector => nodes.find(node => `#${node.id}` === selector) ?? null;
  document.getElementById = id => nodes.find(node => node.id === id) ?? null;
  document.querySelectorAll = selector => {
    if (selector === '[data-nav]' || selector === 'a[href^="#"]') return links;
    if (selector === '[data-nav-section]') return [about, contact];
    if (selector === '[data-snap-panel], [data-chapter-panel]') return [about];
    return [];
  };
  const windowEvents = new Element('window');
  document.addEventListener = windowEvents.addEventListener.bind(windowEvents);
  const motion = { matches: reduced };
  const media = new Element('media');
  media.matches = desktop;
  const window = {
    innerHeight: 900,
    get scrollY() { return scrollY; },
    matchMedia: query => query.includes('reduced-motion') ? motion : media,
    addEventListener: windowEvents.addEventListener.bind(windowEvents),
    requestAnimationFrame(callback) { frames.set(++sequence, callback); return sequence; },
    cancelAnimationFrame: id => frames.delete(id),
    setTimeout(callback) { timers.set(++sequence, callback); return sequence; },
    clearTimeout: id => timers.delete(id),
    scrollTo(options) { scrolls.push(options); scrollY = options.top; },
    history: { pushState: (_state, _unused, href) => history.push(href) },
    location: { hash: '' },
  };
  runInNewContext(readFileSync(new URL('../../main.js', import.meta.url), 'utf8'), {
    window, document, Element, Node: Element, performance: { now: () => 0 }, Date, Math,
    IntersectionObserver: class { observe() {} },
    WheelEvent: { DOM_DELTA_LINE: 1, DOM_DELTA_PAGE: 2 },
  });
  return {
    document, window, motion, media, menu, nav, links, contact, about, frames, timers, scrolls, history,
    emit: (name, event) => windowEvents.emit(name, event),
    frame(now) { const pending = [...frames.values()]; frames.clear(); pending.forEach(callback => callback(now)); },
  };
}
