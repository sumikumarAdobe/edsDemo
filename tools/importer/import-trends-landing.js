/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroMinimalLightWithimg1Parser from './parsers/hero-minimal-light-withimg-1.js';
import cardsMinimalLightWithimgParser from './parsers/cards-minimal-light-withimg.js';
import columnsMinimalLightParser from './parsers/columns-minimal-light.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';
import sectionsTransformer from './transformers/wknd-trendsetters-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero-minimal-light-withimg-1': heroMinimalLightWithimg1Parser,
  'cards-minimal-light-withimg': cardsMinimalLightWithimgParser,
  'columns-minimal-light': columnsMinimalLightParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'trends-landing',
  description: 'Trends landing page: hero banner with heading and paired images, a tagged trend card grid, a feature promo section with image and call to action, and an accent full-width CTA banner',
  urls: [
    'https://wknd-trendsetters.site/fashion-trends-young-adults-casual-sport',
  ],
  blocks: [
    { name: 'hero-minimal-light-withimg-1', instances: ['#main-content > header.section.secondary-section .grid-layout.grid-gap-xxl'] },
    { name: 'cards-minimal-light-withimg', instances: ['#trends .grid-layout.desktop-4-column.grid-gap-md'] },
    { name: 'columns-minimal-light', instances: ['#main-content > section.section.secondary-section .grid-layout.grid-gap-lg'] },
  ],
  sections: [
    { id: 'rc1', name: 'Hero', selector: '#main-content > header.section.secondary-section', style: 'light', blocks: ['hero-minimal-light-withimg-1'], defaultContent: [] },
    { id: 'rc2', name: 'Trend alert', selector: '#trends', style: null, blocks: ['cards-minimal-light-withimg'], defaultContent: ['#trends .utility-text-align-center'] },
    { id: 'rc3', name: 'Feature promo', selector: '#main-content > section.section.secondary-section', style: 'light', blocks: ['columns-minimal-light'], defaultContent: [] },
    { id: 'rc4', name: 'CTA banner', selector: '#main-content > section.section.accent-section', style: 'accent', blocks: [], defaultContent: ['#main-content > section.section.accent-section .container'] },
  ],
};

// TRANSFORMER REGISTRY - cleanup first, sections last
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

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
          name: blockDef.name, selector, element, section: blockDef.section || null,
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

    executeTransformers('beforeTransform', main, payload);

    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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

    executeTransformers('afterTransform', main, payload);

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
