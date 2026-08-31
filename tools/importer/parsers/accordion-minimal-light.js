/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion-minimal-light
 * Base block: accordion (container block)
 * Source: https://wknd-trendsetters.site/
 * Generated: 2026-08-31
 *
 * Structure (library: 2 columns, each row = one accordion item):
 *   Row 1: block name (handled by createBlock)
 *   Each item row: [ summary, text ]
 *     Cell 1: field:summary (clickable title)
 *     Cell 2: field:text (collapsible body richtext)
 *
 * Item model fields: summary (text), text (richtext).
 */
export default function parse(element, { document }) {
  // Each accordion item (validated against source.html)
  const items = Array.from(element.querySelectorAll(':scope > details, :scope > .faq-item, details.faq-item'));

  if (!items.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  items.forEach((item) => {
    const summaryEl = item.querySelector('summary, .faq-question');
    const answerEl = item.querySelector('.faq-answer, :scope > div:not(summary)');

    // Cell 1: summary — field:summary (text only, drop the toggle icon)
    const summaryCell = document.createDocumentFragment();
    summaryCell.appendChild(document.createComment(' field:summary '));
    let summaryText = '';
    if (summaryEl) {
      const span = summaryEl.querySelector('span');
      summaryText = (span ? span.textContent : summaryEl.textContent).trim();
    }
    summaryCell.appendChild(document.createTextNode(summaryText));

    // Cell 2: text — field:text (answer body)
    const textCell = document.createDocumentFragment();
    textCell.appendChild(document.createComment(' field:text '));
    if (answerEl) {
      Array.from(answerEl.childNodes).forEach((n) => textCell.appendChild(n));
    }

    cells.push([summaryCell, textCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-minimal-light', cells });
  element.replaceWith(block);
}
