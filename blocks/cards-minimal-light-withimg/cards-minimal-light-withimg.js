import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

// Matches a trailing date like "May 12" / "Sept 3" / "Dec. 24".
const DATE_RE = /\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2})\s*$/;

/**
 * Turn the meta paragraph ("Casual Cool May 12") into a category pill + date.
 * @param {Element} p paragraph element
 */
function decorateMeta(p) {
  const raw = p.textContent.trim();
  if (!raw) return;
  const match = raw.match(DATE_RE);
  const category = (match ? raw.slice(0, match.index) : raw).trim();
  const date = match ? match[1].trim() : '';

  p.textContent = '';
  p.className = 'meta';
  if (category) {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.textContent = category;
    p.append(tag);
  }
  if (date) {
    const dateEl = document.createElement('span');
    dateEl.className = 'date';
    dateEl.textContent = date;
    p.append(dateEl);
  }
}

export default function decorate(block) {
  /* change to ul, li */
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    moveInstrumentation(row, li);
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-minimal-light-withimg-card-image';
      else div.className = 'cards-minimal-light-withimg-card-body';
    });
    ul.append(li);
  });

  // refine card body content: category pill + date, cleaned heading link
  ul.querySelectorAll('.cards-minimal-light-withimg-card-body').forEach((body) => {
    const paragraphs = [...body.querySelectorAll('p')];
    paragraphs.forEach((p) => {
      const link = p.querySelector('a');
      if (link) {
        // strip leading markdown heading markers (e.g. "### Title")
        link.textContent = link.textContent.replace(/^#+\s*/, '').trim();
        p.classList.add('card-heading-wrapper');
        link.classList.add('card-heading');
      } else {
        decorateMeta(p);
      }
    });
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
  block.textContent = '';
  block.append(ul);
}
