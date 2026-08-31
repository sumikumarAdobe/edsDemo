/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: convert raw <blockquote> elements into a Quote block table.
 *
 * Why: the xwalk publish pipeline (@adobe/helix-md2jcr) does not support a bare
 * <blockquote> element ("Element 'blockquote' is currently not supported").
 * The WKND articles use a <blockquote> pull-quote in the article body. We replace
 * each one with a `quote` block (rendered by blocks/quote) so md2jcr sees a
 * supported block table instead of a raw blockquote.
 *
 * Splits the quotation from a trailing "— Attribution" (em-dash or hyphen) into
 * two block rows: quotation, attribution.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName !== TransformHook.afterTransform) return;
  const { document } = payload;
  const blockquotes = element.querySelectorAll('blockquote');
  blockquotes.forEach((bq) => {
    const raw = (bq.textContent || '').replace(/\s+/g, ' ').trim();
    if (!raw) { bq.remove(); return; }

    // Split "quote — attribution" on the last em-dash / en-dash / " - " separator.
    let quotation = raw;
    let attribution = '';
    const m = raw.match(/^(.*?)(?:\s[—–]\s|\s-\s)([^—–-]+)$/);
    if (m) {
      quotation = m[1].trim();
      attribution = m[2].trim();
    }

    const cells = [];
    const qDiv = document.createElement('div');
    qDiv.textContent = quotation;
    cells.push([qDiv]);
    if (attribution) {
      const aDiv = document.createElement('div');
      aDiv.textContent = attribution;
      cells.push([aDiv]);
    }

    const block = WebImporter.Blocks.createBlock(document, { name: 'quote', cells });
    bq.replaceWith(block);
  });
}
