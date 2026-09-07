import assert from 'node:assert/strict';
import test from 'node:test';
import { loadHero } from './helpers/hero-env.mjs';

test('procedural rendering stays within a fixed pixel budget at any viewport', () => {
  for (const [width, height] of [[562, 630], [273, 439], [4000, 6000], [1, 10000], [10000, 1], [0.2, 0.2]]) {
    const { allocations } = loadHero({ width, height });
    assert.equal(allocations.length, 1);
    const field = allocations[0];
    assert.ok(field.width * field.height <= 100_000, `pixel budget exceeded for ${width} × ${height}`);
    assert.ok(field.data.every((value, index) => index % 4 !== 3 || value === 255), 'the entire image must be opaque');
  }
});

test('a hidden canvas avoids allocation and recovers when made visible', () => {
  const env = loadHero({ width: 0, height: 0 });
  assert.equal(env.allocations.length, 0);
  Object.assign(env.bounds, { width: 273, height: 439 });
  env.emit('resize');
  assert.equal(env.allocations.length, 1);
  assert.equal(env.draws, 1);
  assert.ok(new Set(env.allocations[0].data).size > 10, 'the recovered artwork must contain color variation');
});

test('reduced motion disables animation and pointer tilt, including live changes', () => {
  const env = loadHero({ reduced: true });
  assert.equal(env.frames.size, 0);
  env.emit('pointermove', { clientX: 10, clientY: 10 });
  assert.equal(env.styles.size, 0);
  env.motion.matches = false;
  env.emit('change');
  assert.equal(env.frames.size, 1);
  env.emit('pointermove', { clientX: 10, clientY: 10 });
  assert.notEqual(env.styles.get('--surge-tilt-x'), '0deg');
  env.motion.matches = true;
  env.emit('change');
  assert.equal(env.frames.size, 0);
  assert.equal(env.styles.get('--surge-tilt-x'), '0deg');
  env.intersect(true);
  assert.equal(env.frames.size, 0, 'intersection must not restart reduced-motion animation');
});

test('hidden tabs and offscreen heroes suspend animation', () => {
  const env = loadHero();
  env.document.hidden = true;
  env.emit('visibilitychange');
  assert.equal(env.frames.size, 0);
  env.intersect(false);
  env.document.hidden = false;
  env.emit('visibilitychange');
  assert.equal(env.frames.size, 0);
  env.intersect(true);
  assert.equal(env.frames.size, 1);
});
