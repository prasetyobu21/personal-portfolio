import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

test('project template renders its story, section links, and nested-route assets without the homepage intro', () => {
  const html = readFileSync('dist/project/template/index.html', 'utf8');
  assert.ok(html.includes('<title>Retain AI — Prasetyo</title>'));
  assert.ok(html.includes('Case study template'));
  assert.ok(html.includes('Making retention data easier to act on.'));
  assert.ok(html.includes('href="/#portfolio"'));
  assert.ok(html.includes('mailto:prasetyobu21@gmail.com'));
  assert.ok(!html.includes('intro-pending'));
  assert.ok(!html.includes('intro-active'));
  assert.ok(!html.includes('<script'));

  for (const id of ['overview', 'the-problem', 'the-process', 'the-solution', 'outcomes', 'learnings']) {
    assert.ok(html.includes(`href="#${id}"`), `Missing section link: ${id}`);
    assert.ok(html.includes(`id="${id}"`), `Missing section heading: ${id}`);
  }
  const images = [...html.matchAll(/<img[^>]+src="([^"]+)"/g)];
  assert.equal(images.length, 3);
  for (const [, src] of images) {
    assert.ok(src.startsWith('/assets/'), `Image must work on a nested route: ${src}`);
    assert.ok(existsSync(`dist${decodeURIComponent(src)}`), `Missing image: ${src}`);
  }
  const home = readFileSync('dist/index.html', 'utf8');
  assert.ok(home.includes("classList.add('intro-pending')"));
  assert.ok(home.includes('intro-active'));
});
