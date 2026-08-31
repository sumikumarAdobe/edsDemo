/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters section breaks + Section Metadata.
 *
 * Inserts an <hr> before each section (except the first) and a Section Metadata
 * block after each section that has a style. Section selectors and styles come
 * from tools/importer/page-templates.json (landing-page template, 7 sections),
 * which are DOM-verified boundaries from page analysis against cleaned.html.
 *
 * Uses BOTH hooks: breaks are inserted in beforeTransform (while every section
 * element still exists, before parsers replace them) with a temporary marker on
 * each styled section's <hr>; metadata blocks are inserted in afterTransform
 * anchored to that marker. Sections are iterated in reverse so live-element
 * inserts never disturb not-yet-processed sections. See generate-import-transformer.md.
 */

const SECTION_MARKER_ATTR = 'data-excat-section-id';

export default function transform(hookName, element, payload) {
  const sections = (payload.template && payload.template.sections) || [];

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue; // first section: no leading break, no metadata
      const sectionEl = element.querySelector(section.selector);
      if (!sectionEl) continue; // selector didn't match on this page — skip, never guess

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || element.querySelector(section.selector);
      if (!anchor) continue; // neither survived — skip, never guess

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove(); // section 0 never gets a real leading break
      }
    }
  }
}
