import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildUniversityEmail,
  generateUniversityPassword,
  generateUniversitySlug,
  resolveUniqueSlug,
} from './university-credentials';

test('generateUniversitySlug returns known Colombian university acronyms', () => {
  assert.equal(generateUniversitySlug('Universidad Popular del Cesar'), 'upc');
  assert.equal(generateUniversitySlug('Universidad Nacional de Colombia'), 'unal');
  assert.equal(generateUniversitySlug('Universidad Nacional Abierta y a Distancia'), 'unad');
  assert.equal(generateUniversitySlug('Fundacion Universidad de Bogota Jorge Tadeo Lozano'), 'utadeo');
});

test('resolveUniqueSlug appends numeric suffixes for collisions', () => {
  const existing = new Set(['upc', 'upc-2', 'unal']);

  assert.equal(resolveUniqueSlug('upc', existing), 'upc-3');
  assert.equal(resolveUniqueSlug('udes', existing), 'udes');
});

test('buildUniversityEmail uses the configured default domain', () => {
  const previousDomain = process.env.UNIVERSITY_EMAIL_DOMAIN;
  delete process.env.UNIVERSITY_EMAIL_DOMAIN;

  assert.equal(buildUniversityEmail('upc'), 'upc@talentbridge.com');

  if (previousDomain !== undefined) {
    process.env.UNIVERSITY_EMAIL_DOMAIN = previousDomain;
  }
});

test('generateUniversityPassword includes slug and sufficient entropy', () => {
  const first = generateUniversityPassword('Universidad Popular del Cesar', 'upc');
  const second = generateUniversityPassword('Universidad Popular del Cesar', 'upc');

  assert.match(first, /^Upc\d{4}[A-Za-z0-9]{4}$/);
  assert.notEqual(first, second);
  assert.ok(first.length >= 8);
});
