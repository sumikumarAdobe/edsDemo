/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-minimal-light-contact
 * Base block: columns
 * Source: https://wknd-trendsetters.site/faq
 * Generated: 2026-08-31
 *
 * Structure (library: multiple columns, one row of cells below the block name).
 * This is a text-only "Let's connect" contact block: a two-column grid where
 * column 1 holds the heading + intro paragraph and column 2 holds the
 * email/phone/address label+value pairs.
 * Columns blocks use DEFAULT CONTENT in each cell — NO field hints (per hinting rules).
 * Each direct child of the grid becomes one column cell (2 columns, 1 row per model).
 */
export default function parse(element, { document }) {
  // Direct-child columns of the grid layout (validated against source.html)
  let columns = Array.from(element.querySelectorAll(':scope > div'));

  // Fallback: if no direct-child divs, unwrap the element's own children.
  if (!columns.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Build a single content row with one cell per column, preserving
  // semantic markup (headings, paragraphs, links) as element references.
  const row = columns.map((col) => {
    const cellContent = Array.from(col.childNodes);
    return cellContent.length ? cellContent : '';
  });

  const cells = [row];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-minimal-light-contact', cells });
  element.replaceWith(block);
}
