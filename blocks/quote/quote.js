/**
 * Quote block — renders a pull-quote with optional attribution.
 * Row 1: quotation text. Row 2 (optional): attribution.
 * @param {Element} block
 */
export default function decorate(block) {
  const rows = [...block.children];
  const quote = rows[0];
  if (quote) {
    quote.classList.add('quote-quotation');
    const p = quote.querySelector(':scope > div');
    if (p) p.replaceWith(...p.childNodes);
  }
  const attribution = rows[1];
  if (attribution) {
    attribution.classList.add('quote-attribution');
    const p = attribution.querySelector(':scope > div');
    if (p) p.replaceWith(...p.childNodes);
  }
}
