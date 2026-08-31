/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs-minimal-light-withimg
 * Base block: tabs (container block)
 * Source: https://wknd-trendsetters.site/
 * Generated: 2026-08-31
 *
 * Structure (library: 2 columns, each row = one tab):
 *   Row 1: block name (handled by createBlock)
 *   Each tab row: [ tab label, tab content ]
 *     Cell 1: field:title (tab label text)
 *     Cell 2: content_* group (same prefix -> one cell):
 *             field:content_heading (h3), field:content_image (img), field:content_richtext
 *
 * Item model fields: title, content_heading, content_headingType (collapsed, Type suffix),
 *                    content_image (reference), content_richtext (richtext).
 */
export default function parse(element, { document }) {
  const panes = Array.from(element.querySelectorAll('.tab-pane'));
  const buttons = Array.from(element.querySelectorAll('.tab-menu-link, .tab-menu button'));

  if (!panes.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  panes.forEach((pane, i) => {
    // --- Cell 1: tab label (title) ---
    const btn = buttons[i];
    let labelText = '';
    if (btn) {
      const btnStrong = btn.querySelector('strong');
      labelText = (btnStrong ? btnStrong.textContent : btn.textContent).trim();
    }
    const titleCell = document.createDocumentFragment();
    titleCell.appendChild(document.createComment(' field:title '));
    titleCell.appendChild(document.createTextNode(labelText));

    // --- Cell 2: content (heading + image + richtext, grouped by "content" prefix) ---
    const img = pane.querySelector('img');
    // The text column is the grid child that does NOT contain the image
    const gridCols = Array.from(pane.querySelectorAll('.grid-layout > div, :scope > div > div'));
    let textCol = gridCols.find((c) => img && !c.contains(img) && c.textContent.trim());
    if (!textCol) textCol = pane.querySelector('p') ? pane.querySelector('p').closest('div') : pane;

    const strong = textCol ? textCol.querySelector('strong') : null;
    const name = strong ? strong.textContent.trim() : '';
    const nameWrapper = strong ? strong.closest('div') : null;
    const roleDiv = nameWrapper ? nameWrapper.nextElementSibling : null;
    const quote = textCol ? textCol.querySelector('p') : null;

    const contentCell = document.createDocumentFragment();

    // content_heading -> h3 (headingType collapses onto the tag)
    if (name) {
      contentCell.appendChild(document.createComment(' field:content_heading '));
      const h = document.createElement('h3');
      h.textContent = name;
      contentCell.appendChild(h);
    }

    // content_image
    if (img) {
      contentCell.appendChild(document.createComment(' field:content_image '));
      contentCell.appendChild(img);
    }

    // content_richtext -> role + quote
    if (roleDiv || quote) {
      contentCell.appendChild(document.createComment(' field:content_richtext '));
      if (roleDiv) {
        const roleP = document.createElement('p');
        roleP.textContent = roleDiv.textContent.trim();
        contentCell.appendChild(roleP);
      }
      if (quote) contentCell.appendChild(quote);
    }

    cells.push([titleCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-minimal-light-withimg', cells });
  element.replaceWith(block);
}
