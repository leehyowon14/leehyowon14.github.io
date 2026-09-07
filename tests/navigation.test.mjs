import assert from 'node:assert/strict';
import test from 'node:test';
import { loadNavigation } from './helpers/navigation-env.mjs';

test('reduced-motion anchors reach the destination without scheduling animation', () => {
  for (const desktop of [true, false]) {
    const env = loadNavigation({ reduced: true, desktop });
    assert.equal(env.links[1].emit('click').defaultPrevented, true);
    assert.equal(env.frames.size, 0);
    assert.equal(env.scrolls.at(-1).top, 2700);
    assert.equal(env.scrolls.at(-1).behavior, 'instant');
    assert.equal(env.document.documentElement.dataset.pageSnap, undefined);
    assert.deepEqual(env.history, ['#contact']);
  }
});

test('enabling reduced motion during an animation immediately settles it', () => {
  const env = loadNavigation();
  env.links[1].emit('click');
  env.frame(100);
  assert.ok(env.window.scrollY > 0 && env.window.scrollY < 2700);
  env.motion.matches = true;
  env.frame(120);
  assert.equal(env.window.scrollY, 2700);
  assert.equal(env.frames.size, 0);
});

test('modified clicks keep native browser behavior', () => {
  const env = loadNavigation();
  for (const modifier of ['metaKey', 'ctrlKey', 'altKey', 'shiftKey']) {
    assert.equal(env.links[1].emit('click', { [modifier]: true }).defaultPrevented, false);
  }
  assert.equal(env.links[1].emit('click', { button: 1 }).defaultPrevented, false);
  assert.equal(env.frames.size, 0);
  assert.equal(env.history.length, 0);
});

test('opening the mobile menu focuses a link and Escape returns to its button', () => {
  const env = loadNavigation({ desktop: false });
  env.menu.focus();
  env.menu.emit('click');
  assert.equal(env.menu.getAttribute('aria-expanded'), 'true');
  assert.equal(env.document.activeElement, env.links[0]);
  env.emit('keydown', { key: 'Escape' });
  assert.equal(env.menu.getAttribute('aria-expanded'), 'false');
  assert.equal(env.document.activeElement, env.menu);
  env.contact.focus();
  env.emit('keydown', { key: 'Escape' });
  assert.equal(env.document.activeElement, env.contact, 'Escape on a closed menu must not steal focus');
});

test('the mobile menu closes when focus or a click moves outside it', () => {
  const env = loadNavigation({ desktop: false });
  env.menu.emit('click');
  env.nav.emit('focusout', { relatedTarget: env.links[1] });
  assert.equal(env.menu.getAttribute('aria-expanded'), 'true');
  env.nav.emit('focusout', { relatedTarget: env.contact });
  assert.equal(env.menu.getAttribute('aria-expanded'), 'false');
  env.menu.emit('click');
  env.emit('click', { target: env.contact });
  assert.equal(env.menu.getAttribute('aria-expanded'), 'false');
  for (const relatedTarget of [null, env.window]) {
    env.menu.emit('click');
    env.nav.emit('focusout', { relatedTarget });
    assert.equal(env.menu.getAttribute('aria-expanded'), 'false', 'focus leaving the document must close the menu');
  }
});

test('anchor navigation moves keyboard focus to its destination after scrolling', () => {
  for (const reduced of [true, false]) {
    const env = loadNavigation({ reduced });
    env.links[1].focus();
    env.links[1].emit('click');
    if (!reduced) {
      assert.equal(env.document.activeElement, env.links[1]);
      env.frame(1000);
    }
    assert.equal(env.document.activeElement, env.contact);
    assert.equal(env.contact.getAttribute('tabindex'), '-1');
    env.contact.emit('blur');
    assert.equal(env.contact.hasAttribute('tabindex'), false);
  }
});

test('anchors focus an already visible destination without another animation', () => {
  const env = loadNavigation();
  env.window.scrollTo({ top: 2700 });
  env.contact.setAttribute('tabindex', '0');
  env.links[1].emit('click');
  assert.equal(env.frames.size, 0);
  assert.equal(env.document.activeElement, env.contact);
  env.contact.emit('blur');
  assert.equal(env.contact.getAttribute('tabindex'), '0', 'authored focusability must be preserved');
});
