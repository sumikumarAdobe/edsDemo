/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-minimal-light-withimg-1
 * Base block: hero (2-column: image collage + text)
 * Source: https://wknd-trendsetters.site/
 *
 * Structure — ONE content row with TWO cells (matches the 2-field model):
 *   Row 1: block name (handled by createBlock)
 *   Row 2, cell 1: images  -> field:images (3-image collage, richtext)
 *   Row 2, cell 2: text    -> field:text   (heading, subheading, CTAs, richtext)
 *
 * Model fields: images (richtext), text (richtext). Both richtext so the
 * multi-image collage survives and every field aligns with a column/cell.
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

  // Cell 1: images — field:images (wrap each image in its own <p> for richtext)
  const imageCell = document.createDocumentFragment();
  imageCell.appendChild(document.createComment(' field:images '));
  images.forEach((img) => {
    const p = document.createElement('p');
    p.appendChild(img);
    imageCell.appendChild(p);
  });

  // Cell 2: text — field:text (heading + subheading + CTAs)
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));
  if (heading) textCell.appendChild(heading);
  if (subheading) textCell.appendChild(subheading);
  ctaLinks.forEach((a) => textCell.appendChild(a));

  // Single row, two cells — one cell per model field.
  const cells = [[imageCell, textCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-minimal-light-withimg-1', cells });
  element.replaceWith(block);
}
