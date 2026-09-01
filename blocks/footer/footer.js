import { loadFragment } from '../fragment/fragment.js';

// Social icons live in the repo `/icons/` folder (served via Code Sync), keyed
// by the platform name that authors put in the image alt text. This avoids
// relying on content-source image ingestion, which is unreliable for SVGs.
const SOCIAL_ICONS = ['facebook', 'instagram', 'x', 'linkedin', 'youtube'];

/**
 * Repairs social icons in the footer. When the footer is published, relative
 * image references can break (`src="about:error"`) because the SVGs were never
 * ingested as DAM assets. We detect each social link by its alt text and swap
 * in the matching inline SVG from `/icons/`, so it renders in the footer's
 * `currentColor` and never depends on content-source assets.
 * @param {Element} footer The footer container element
 */
async function decorateSocialIcons(footer) {
  const links = footer.querySelectorAll('ul a');
  await Promise.all([...links].map(async (a) => {
    const img = a.querySelector('img');
    const alt = (img?.getAttribute('alt') || a.textContent || '').trim().toLowerCase();
    const name = SOCIAL_ICONS.find((n) => alt === n || alt.includes(n));
    if (!name) return;
    try {
      const resp = await fetch(`${window.hlx.codeBasePath}/icons/${name}.svg`);
      if (!resp.ok) return;
      const svg = await resp.text();
      a.innerHTML = svg;
      a.setAttribute('aria-label', name.charAt(0).toUpperCase() + name.slice(1));
    } catch (e) {
      // leave the original markup in place on failure
    }
  }));
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  // load footer as fragment — metadata-independent dual path:
  // /content/footer first (localhost / aem up), then /footer (DA/EDS production root).
  let fragment = await loadFragment('/content/footer');
  if (!fragment) fragment = await loadFragment('/footer');

  // decorate footer DOM
  block.textContent = '';
  const footer = document.createElement('div');
  while (fragment.firstElementChild) footer.append(fragment.firstElementChild);

  await decorateSocialIcons(footer);

  block.append(footer);
}
