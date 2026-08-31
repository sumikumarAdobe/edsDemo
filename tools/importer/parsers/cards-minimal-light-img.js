/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-minimal-light-img
 * Base block: cards (container block)
 * Source: https://wknd-trendsetters.site/
 * Generated: 2026-08-31
 *
 * Structure (library: container, each child = one card row):
 *   Row 1: block name (handled by createBlock)
 *   Each card row has 2 cells:
 *     Cell 1: image  -> field:image (imageAlt collapses onto <img>)
 *     Cell 2: text   -> field:text (empty in this image-only variant -> no hint)
 *
 * Card model fields: image (reference), text (richtext).
 */
export default function parse(element, { document }) {
  // Each direct child of the grid is one card (validated against source.html)
  const cardEls = Array.from(element.querySelectorAll(':scope > div'));

  if (!cardEls.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cardEls.forEach((card) => {
    const img = card.querySelector('img');

    // Cell 1: image — field:image
    let imageCell = '';
    if (img) {
      const frag = document.createDocumentFragment();
      frag.appendChild(document.createComment(' field:image '));
      frag.appendChild(img);
      imageCell = frag;
    }

    // Cell 2: text — richtext content excluding the image.
    // In the image-only variant there is no text, so the cell stays empty (no hint).
    const textNodes = Array.from(card.childNodes).filter((n) => {
      if (n.nodeType === 1) return n !== img && !n.contains(img);
      return n.textContent && n.textContent.trim();
    });
    let textCell = '';
    if (textNodes.length) {
      const frag = document.createDocumentFragment();
      frag.appendChild(document.createComment(' field:text '));
      textNodes.forEach((n) => frag.appendChild(n));
      textCell = frag;
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-minimal-light-img', cells });
  element.replaceWith(block);
}
