/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters site-wide cleanup.
 * Removes non-authorable global chrome and layout artifacts so the import
 * contains only page-level authorable content.
 *
 * All selectors verified against migration-work/cleaned.html:
 *  - a.skip-link          (line 1, "Skip to main content")
 *  - div.navbar           (line 1, global header/nav + mega menu)
 *  - footer.footer        (line 98, global footer)
 *  - div.breadcrumbs      (line 48, non-authorable breadcrumb trail inside main > section rc2)
 *
 * NOTE: the hero on this site is authored as <header class="section secondary-section">
 * (section rc1) which IS authorable content — do NOT remove `header` broadly.
 */

const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.afterTransform) {
    // Non-authorable global chrome + layout artifacts (selectors from cleaned.html).
    WebImporter.DOMUtils.remove(element, [
      'a.skip-link',
      '.navbar',
      'footer.footer',
      '.breadcrumbs',
    ]);
  }
}
