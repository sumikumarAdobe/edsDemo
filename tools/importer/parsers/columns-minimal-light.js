/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-minimal-light
 * Base block: columns
 * Source: https://wknd-trendsetters.site/
 * Generated: 2026-08-31
 *
 * Structure (library: multiple columns, one row of cells below the block name).
 * Columns blocks use DEFAULT CONTENT in each cell — NO field hints (per hinting rules).
 * Each direct child of the grid becomes one column cell.
 */
export default function parse(element, { document }) {
  // Direct-child columns of the grid layout (validated against source.html)
  let columns = Array.from(element.querySelectorAll(':scope > div'));

  // Fallback: if no direct-child divs, treat the element's own children as one cell
  if (!columns.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  // Build a single content row with one cell per column.
  const row = columns.map((col) => {
    const cellContent = Array.from(col.childNodes);
    return cellContent.length ? cellContent : '';
  });

  const cells = [row];

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-minimal-light', cells });
  element.replaceWith(block);
}
