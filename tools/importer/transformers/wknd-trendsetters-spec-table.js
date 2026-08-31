/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: convert data <table>s in article bodies to plain paragraph pairs.
 *
 * Why: the article body has a native spec <table> (Spec | Detail). html2md turns
 * every <table> into a gridtable, and md2jcr reads a gridtable's first cell as a
 * BLOCK NAME — so "Spec" becomes an unregistered block and publishing fails
 * ("The component 'Spec' does not exist"). This site has no table block, so we
 * flatten each data table to "<strong>label</strong>: value" paragraphs (default
 * content) — content is preserved, no phantom block is inferred.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;
  const { document } = payload;
  element.querySelectorAll('table').forEach((table) => {
    const rows = Array.from(table.querySelectorAll('tr'));
    const frag = document.createDocumentFragment();
    rows.forEach((tr) => {
      const cells = Array.from(tr.querySelectorAll('th, td'));
      if (cells.length === 0) return;
      const label = (cells[0].textContent || '').trim();
      const value = cells.slice(1).map((c) => (c.textContent || '').trim()).filter(Boolean).join(' — ');
      if (!label && !value) return;
      const p = document.createElement('p');
      if (label) {
        const strong = document.createElement('strong');
        strong.textContent = label;
        p.appendChild(strong);
      }
      if (value) p.appendChild(document.createTextNode(label ? `: ${value}` : value));
      frag.appendChild(p);
    });
    table.replaceWith(frag);
  });
}
