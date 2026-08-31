/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroMinimalLightWithimg1Parser from './parsers/hero-minimal-light-withimg-1.js';
import columnsMinimalLightParser from './parsers/columns-minimal-light.js';
import cardsMinimalLightImgParser from './parsers/cards-minimal-light-img.js';
import tabsMinimalLightWithimgParser from './parsers/tabs-minimal-light-withimg.js';
import cardsMinimalLightWithimgParser from './parsers/cards-minimal-light-withimg.js';
import accordionMinimalLightParser from './parsers/accordion-minimal-light.js';
import heroMinimalDarkCtaParser from './parsers/hero-minimal-dark-cta.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';
import sectionsTransformer from './transformers/wknd-trendsetters-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-minimal-light-withimg-1': heroMinimalLightWithimg1Parser,
  'columns-minimal-light': columnsMinimalLightParser,
  'cards-minimal-light-img': cardsMinimalLightImgParser,
  'tabs-minimal-light-withimg': tabsMinimalLightWithimgParser,
  'cards-minimal-light-withimg': cardsMinimalLightWithimgParser,
  'accordion-minimal-light': accordionMinimalLightParser,
  'hero-minimal-dark-cta': heroMinimalDarkCtaParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'landing-page',
  description: 'Marketing landing page: hero banner with heading and image collage, followed by multiple card-grid sections, a testimonials/quote block, an article card row, an FAQ accordion, and a dark full-width CTA banner',
  urls: [
    'https://wknd-trendsetters.site/',
    'https://wknd-trendsetters.site/fashion-trends-of-the-season',
    'https://wknd-trendsetters.site/fashion-trends-young-adults',
  ],
  blocks: [
    { name: 'hero-minimal-light-withimg-1', instances: ['#main-content > header.section .grid-layout.grid-gap-xxl'] },
    { name: 'columns-minimal-light', instances: ['#main-content > section.section:nth-of-type(1) .grid-layout.grid-gap-lg'] },
    { name: 'cards-minimal-light-img', instances: ['.grid-layout.desktop-4-column.grid-gap-sm'] },
    { name: 'tabs-minimal-light-withimg', instances: ['.tabs-wrapper'] },
    { name: 'cards-minimal-light-withimg', instances: ['.grid-layout.desktop-4-column.grid-gap-md'] },
    { name: 'accordion-minimal-light', instances: ['.faq-list'] },
    { name: 'hero-minimal-dark-cta', instances: ['#main-content > section.section.inverse-section .grid-layout.desktop-1-column'] },
  ],
  sections: [
    { id: 'rc1', name: 'Hero', selector: '#main-content > header.section.secondary-section', style: 'light', blocks: ['hero-minimal-light-withimg-1'], defaultContent: [] },
    { id: 'rc2', name: 'Featured case study', selector: '#main-content > section.section:nth-of-type(1)', style: null, blocks: ['columns-minimal-light'], defaultContent: [] },
    { id: 'rc3', name: 'Snapshot gallery', selector: '#main-content > section.section.secondary-section:nth-of-type(2)', style: 'light', blocks: ['cards-minimal-light-img'], defaultContent: ['#main-content > section.section.secondary-section:nth-of-type(2) .utility-text-align-center'] },
    { id: 'rc4', name: 'Testimonials tabs', selector: '#main-content > section.section:nth-of-type(3)', style: null, blocks: ['tabs-minimal-light-withimg'], defaultContent: [] },
    { id: 'rc5', name: 'Latest articles', selector: '#main-content > section.section.secondary-section:nth-of-type(4)', style: 'light', blocks: ['cards-minimal-light-withimg'], defaultContent: ['#main-content > section.section.secondary-section:nth-of-type(4) .utility-text-align-center'] },
    { id: 'rc6', name: 'FAQ', selector: '#main-content > section.section:nth-of-type(5)', style: null, blocks: ['accordion-minimal-light'], defaultContent: ['#main-content > section.section:nth-of-type(5) .grid-layout.grid-gap-xxl > div:first-child'] },
    { id: 'rc7', name: 'CTA banner', selector: '#main-content > section.section.inverse-section', style: 'dark', blocks: ['hero-minimal-dark-cta'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, sections last (adds <hr> + metadata in afterTransform)
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;

    const main = document.body;

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block; skip elements already replaced by a prior parser
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    // Carry the source meta description into the metadata block when createMetadata
    // omits it, so imported pages keep their SEO description. createMetadata appends
    // a `.metadata` table to `main`; locate it and add a Description row.
    try {
      const descEl = document.querySelector('meta[name="description"], meta[property="og:description"]');
      const desc = descEl && descEl.getAttribute('content');
      const metaBlock = main.querySelector('.metadata');
      if (metaBlock && desc && !/Description/i.test(metaBlock.textContent || '')) {
        const row = document.createElement('div');
        const keyCell = document.createElement('div');
        keyCell.textContent = 'Description';
        const valCell = document.createElement('div');
        valCell.textContent = desc;
        row.append(keyCell, valCell);
        metaBlock.append(row);
      }
    } catch (e) {
      console.error('meta description injection failed:', e);
    }
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path (map root URL to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
