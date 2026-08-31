/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-minimal-light-withimg-1
 * Base block: hero (2-column: image collage + text)
 * Source: https://wknd-trendsetters.site/
 *
 * Structure — TWO rows, ONE cell each (one model field per row, as md2jcr
 * maps non-container blocks). This is what makes the content map to the model:
 *   Row 1: block name (handled by createBlock)
 *   Row 2: images -> field:images (3-image collage, richtext)
 *   Row 3: text   -> field:text   (heading, subheading, CTAs, richtext)
 *
 * Model fields: images (richtext), text (richtext) — both richtext so the
 * multi-image collage survives; one field per row so every field aligns.
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

  // Row 2: images — field:images. Put ALL images inside ONE <p> so the richtext
  // field receives a single block (multiple standalone ![] blocks make md2jcr try
  // to resolve each image as a separate component and fail).
  const imageCell = document.createDocumentFragment();
  imageCell.appendChild(document.createComment(' field:images '));
  const imgP = document.createElement('p');
  images.forEach((img) => imgP.appendChild(img));
  imageCell.appendChild(imgP);

  // Row 3: text — field:text (heading + subheading + CTAs)
  const textCell = document.createDocumentFragment();
  textCell.appendChild(document.createComment(' field:text '));
  if (heading) textCell.appendChild(heading);
  if (subheading) textCell.appendChild(subheading);
  ctaLinks.forEach((a) => textCell.appendChild(a));

  // Two rows, one cell each — one model field per row.
  const cells = [[imageCell], [textCell]];

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-minimal-light-withimg-1', cells });
  element.replaceWith(block);
}
