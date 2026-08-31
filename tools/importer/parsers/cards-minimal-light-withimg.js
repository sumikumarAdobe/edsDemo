/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-minimal-light-withimg
 * Base block: cards (container block)
 * Source: https://wknd-trendsetters.site/
 * Generated: 2026-08-31
 *
 * Structure (library: container, each child = one card row, 2 cells):
 *   Row 1: block name (handled by createBlock)
 *   Each card row:
 *     Cell 1: field:image (imageAlt collapses onto <img>)
 *     Cell 2: field:text (richtext: tag/date meta + heading, wrapped as CTA link)
 *
 * Card model fields: image (reference), text (richtext).
 */
export default function parse(element, { document }) {
  // Each card is an anchor (article-card / card-link) or a direct-child div.
  // Prefer direct children, but if that yields fewer than 2 cards the grid may
  // wrap its cards in an intermediate container (observed on some pages) — fall
  // back to a descendant search for the known card classes so every card is
  // captured, not just the first wrapper.
  // Card discovery. Iterate element.children directly rather than relying on
  // CSS combinators (`:scope >`) or comma-grouped selectors — some server-side
  // DOM implementations used by the importer under-match those, capturing only
  // the first card. Walking children by class is reliable across environments.
  const hasCardClass = (el) => el.classList
    && (el.classList.contains('article-card')
      || el.classList.contains('card-link')
      || el.classList.contains('trend-card'));

  const kids = Array.from(element.children || []);
  let cardEls = kids.filter((el) => (el.tagName === 'A' || el.tagName === 'DIV') && hasCardClass(el));

  // Fallback 1: cards wrapped one level deeper (row wrappers) — collect matching
  // descendants by walking the tree, still avoiding comma selectors.
  if (cardEls.length < 2) {
    const found = [];
    const walk = (node) => {
      Array.from(node.children || []).forEach((child) => {
        if (hasCardClass(child)) found.push(child);
        else walk(child);
      });
    };
    walk(element);
    if (found.length > cardEls.length) cardEls = found;
  }

  // Fallback 2: no class-based cards — treat direct anchors, then direct divs, as cards.
  if (!cardEls.length) cardEls = kids.filter((el) => el.tagName === 'A');
  if (!cardEls.length) cardEls = kids.filter((el) => el.tagName === 'DIV');

  if (!cardEls.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  cardEls.forEach((card) => {
    const img = card.querySelector('img');
    const href = card.getAttribute('href');
    const heading = card.querySelector('h1, h2, h3, h4, h5, h6, [class*="heading"]');
    const meta = card.querySelector('.article-card-meta, [class*="meta"]');

    // The image wrapper (holds <img>) — used to exclude the image from the text cell.
    const imageWrap = img ? (img.closest('[class*="image"]') || img.parentElement) : null;

    // Cell 1: image — field:image
    let imageCell = '';
    if (img) {
      const frag = document.createDocumentFragment();
      frag.appendChild(document.createComment(' field:image '));
      frag.appendChild(img);
      imageCell = frag;
    }

    // Cell 2: text — field:text.
    // Capture ALL non-image body content in source order (tag/category, meta,
    // heading, and description paragraph(s)), with the heading linked to the card
    // href as a CTA. Falling back to just heading/meta if no body container found.
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));

    // Prefer the dedicated body container when present (e.g. .trend-card-body,
    // .article-card-body); otherwise gather the card's direct children.
    const body = card.querySelector('[class*="-body"]');
    const sourceNodes = body
      ? Array.from(body.childNodes)
      : Array.from(card.childNodes).filter((n) => n !== imageWrap);

    let appended = false;
    sourceNodes.forEach((node) => {
      // Skip the image wrapper if it slipped through, and empty text nodes.
      if (node === imageWrap) return;
      if (node.nodeType === 3 && !node.textContent.trim()) return;
      // Link the heading to the card href as a CTA.
      if (href && heading && node === heading) {
        const link = document.createElement('a');
        link.setAttribute('href', href);
        link.appendChild(node.cloneNode(true));
        textCell.appendChild(link);
      } else {
        textCell.appendChild(node.cloneNode(true));
      }
      appended = true;
    });

    // Fallbacks if no body content was gathered.
    if (!appended) {
      if (meta) textCell.appendChild(meta);
      if (heading) {
        if (href) {
          const link = document.createElement('a');
          link.setAttribute('href', href);
          link.appendChild(heading);
          textCell.appendChild(link);
        } else {
          textCell.appendChild(heading);
        }
      } else if (href) {
        const link = document.createElement('a');
        link.setAttribute('href', href);
        link.textContent = card.textContent.trim();
        textCell.appendChild(link);
      }
    }

    cells.push([imageCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-minimal-light-withimg', cells });
  element.replaceWith(block);
}
