/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-minimal-dark-cta
 * Base block: hero
 * Source: https://wknd-trendsetters.site/
 * Generated: 2026-08-31
 *
 * Structure (library: 1 column, up to 3 rows):
 *   Row 1: block name (handled by createBlock)
 *   Row 2: image cell -> field:image (background image)
 *   Row 3: text cell  -> field:text  (heading, subheading, CTA)
 *
 * Model fields: image (reference), imageAlt (collapsed onto image), text (richtext).
 */
export default function parse(element, { document }) {
  // Selectors validated against source.html
  const bgImage = element.querySelector('img');
  const heading = element.querySelector('h1, h2, .h1-heading, [class*="heading"]');
  const subheading = element.querySelector('p, .subheading, [class*="subheading"]');
  const ctaLinks = Array.from(element.querySelectorAll('.button-group a, a.button'));

  // Empty-block guard
  if (!heading && !subheading && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2: background image — field:image
  if (bgImage) {
    const imageCell = document.createDocumentFragment();
    imageCell.appendChild(document.createComment(' field:image '));
    imageCell.appendChild(bgImage);
    cells.push([imageCell]);
  } else {
    cells.push(['']);
  }

  // Row 3: text (heading + subheading + CTA) — field:text
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));
  if (heading) textCell.appendChild(heading);
  if (subheading) textCell.appendChild(subheading);
  ctaLinks.forEach((a) => textCell.appendChild(a));
  cells.push([textCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-minimal-dark-cta', cells });
  element.replaceWith(block);
}
