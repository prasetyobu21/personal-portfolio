import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { test } from 'node:test';
import vm from 'node:vm';

const projects = JSON.parse(readFileSync(new URL('../src/data/projects.json', import.meta.url)));
const script = readFileSync(new URL('../src/scripts/portfolio.js', import.meta.url), 'utf8');

test('production output retains every project, image, and local bundle', () => {
  const html = readFileSync('dist/index.html', 'utf8');
  assert.equal(projects.length, 7);
  assert.equal((html.match(/class="portfolio-card /g) || []).length, projects.length);
  assert.ok(!html.includes('cdn.tailwindcss.com'));
  for (const project of projects) {
    assert.ok(html.includes(project.date));
    assert.ok(html.includes(project.href.replaceAll('&', '&amp;')));
    for (const image of [project.image, ...(project.images || [])]) {
      assert.ok(existsSync(`dist/${image}`), `Missing image: ${image}`);
    }
  }
  const bundles = [...html.matchAll(/(?:src|href)="(\/_astro\/[^"?]+)"/g)];
  assert.ok(bundles.some(([, url]) => url.endsWith('.js')));
  assert.ok(bundles.some(([, url]) => url.endsWith('.css')));
  for (const [, url] of bundles) assert.ok(existsSync(`dist${url}`));
  const css = bundles.filter(([, url]) => url.endsWith('.css')).map(([, url]) => readFileSync(`dist${url}`, 'utf8')).join('');
  for (const selector of ['.hidden', '.text-primary', '.text-muted', '.font-semibold', '.font-medium', '.lightbox-slide', '.md\\:grid-cols-2']) {
    assert.ok(css.includes(selector), `Missing compiled CSS: ${selector}`);
  }
});

function element(dataset = {}) {
  const classes = new Set();
  const listeners = {};
  return {
    dataset, style: {}, attributes: {}, children: [], textContent: '', innerHTML: '',
    classList: {
      add: (...items) => items.forEach(item => classes.add(item)),
      remove: (...items) => items.forEach(item => classes.delete(item)),
      contains: item => classes.has(item),
      toggle(item, force) {
        const enabled = force ?? !classes.has(item);
        enabled ? classes.add(item) : classes.delete(item);
        return enabled;
      },
    },
    addEventListener: (name, handler) => { listeners[name] = handler; },
    fire: (name, event = {}) => listeners[name]?.({ preventDefault() {}, stopPropagation() {}, ...event }),
    setAttribute(name, value) { this.attributes[name] = value; },
    querySelectorAll: () => [],
    append(child) { this.children.push(child); },
    remove() { this.removed = true; },
  };
}

function setup() {
  const ids = Object.fromEntries([...script.matchAll(/getElementById\('([^']+)'\)/g)].map(([, id]) => [id, element()]));
  const tabs = ['all', 'design', 'article'].map(filter => element({ filter }));
  const cards = projects.map(project => element({ category: project.categories, images: project.images && JSON.stringify(project.images) }));
  const document = {
    ...element(), documentElement: element(), body: element(),
    getElementById: id => ids[id],
    querySelectorAll: selector => ({ '.tab-btn': tabs, '.portfolio-card': cards, '.card-image': [] }[selector]),
  };
  document.documentElement.classList.add('intro-pending');
  document.body.classList.add('intro-active');
  vm.runInNewContext(script, {
    document, window: { matchMedia: () => ({ matches: true }) },
    setTimeout: callback => callback(), requestAnimationFrame: callback => callback(),
    IntersectionObserver: class { observe() {} unobserve() {} },
  });
  return { ids, tabs, cards, document };
}

test('reduced motion skips the intro and category filters include shared categories', () => {
  const { ids, tabs, cards, document } = setup();
  assert.ok(ids['portfolio-intro'].removed);
  assert.ok(!document.body.classList.contains('intro-active'));
  assert.ok(!document.documentElement.classList.contains('intro-pending'));
  for (const tab of tabs) {
    tab.fire('click');
    cards.forEach((card, index) => {
      const visible = tab.dataset.filter === 'all' || projects[index].categories.split(' ').includes(tab.dataset.filter);
      assert.equal(card.style.display, visible ? 'block' : 'none');
    });
    assert.ok(tab.classList.contains('active'));
    assert.equal(tabs.filter(item => item.classList.contains('active')).length, 1);
  }
});

test('lightbox opens, bounds keyboard navigation, closes, and handles single images', () => {
  const { ids, cards, document } = setup();
  const gallery = projects.findIndex(project => project.images?.length === 2);
  cards[gallery].fire('click');
  assert.equal(ids.lightbox.attributes['aria-hidden'], 'false');
  assert.equal(document.body.style.overflow, 'hidden');
  assert.equal(ids['lightbox-counter'].textContent, '1 / 2');
  document.fire('keydown', { key: 'ArrowLeft' });
  assert.equal(ids['lightbox-counter'].textContent, '1 / 2');
  ids['lightbox-next'].fire('click');
  assert.equal(ids['lightbox-counter'].textContent, '2 / 2');
  document.fire('keydown', { key: 'ArrowRight' });
  assert.equal(ids['lightbox-counter'].textContent, '2 / 2');
  assert.ok(ids['lightbox-next'].classList.contains('hidden'));
  document.fire('keydown', { key: 'Escape' });
  assert.equal(ids.lightbox.attributes['aria-hidden'], 'true');
  assert.equal(document.body.style.overflow, '');
  cards[projects.findIndex(project => project.images?.length === 1)].fire('click');
  assert.equal(ids['lightbox-counter'].style.visibility, 'hidden');
  assert.equal(ids['lightbox-dots'].style.visibility, 'hidden');
  ids['lightbox-close'].fire('click');
  assert.equal(ids.lightbox.attributes['aria-hidden'], 'true');
});
