/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-minimal-light-withimg-1
 * Base block: hero
 * Source: https://wknd-trendsetters.site/
 * Generated: 2026-08-31
 *
 * Structure (library: 1 column, up to 3 rows):
 *   Row 1: block name (handled by createBlock)
 *   Row 2: image cell        -> field:image  (background/hero images)
 *   Row 3: text cell         -> field:text   (heading, subheading, CTAs)
 *
 * Model fields: image (reference), imageAlt (collapsed onto image), text (richtext).
 */
export default function parse(element, { document }) {
  // --- Extract content (selectors validated against source.html) ---
  const heading = element.querySelector('h1, h2, .h1-heading, [class*="heading"]');
  const subheading = element.querySelector('p, .subheading, [class*="subheading"]');
  const ctaLinks = Array.from(element.querySelectorAll('.button-group a, a.button'));
  const images = Array.from(element.querySelectorAll('img'));

  // Empty-block guard
  if (!heading && !subheading && images.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: image(s) — field:image
  if (images.length) {
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    images.forEach((img) => imageCell.appendChild(img));
    cells.push([imageCell]);
  } else {
    cells.push(['']);
  }

  // Row 3: text (heading + subheading + CTAs) — field:text
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));
  if (heading) textCell.appendChild(heading);
  if (subheading) textCell.appendChild(subheading);
  ctaLinks.forEach((a) => textCell.appendChild(a));
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-minimal-light-withimg-1', cells });
  element.replaceWith(block);
}
