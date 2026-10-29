import photos from './data/menu-images.json';

const camera = '<svg viewBox="0 0 32 32" width="32" height="32" aria-hidden="true"><path d="M4 10h6l2-4h8l2 4h6v16H4Z"/><circle cx="16" cy="18" r="5"/></svg>';

export function mountMenuPhotos(refreshLayout) {
  let queued = 0;
  const refresh = () => {
    cancelAnimationFrame(queued);
    queued = requestAnimationFrame(refreshLayout);
  };
  document.querySelectorAll('[data-menu-photo]').forEach(item => {
    const config = photos[item.dataset.menuPhoto] || {};
    const region = item.querySelector('.menu-item-media');
    const placeholder = () => {
      region.replaceChildren();
      const note = document.createElement('div');
      note.className = 'menu-photo-pending';
      note.innerHTML = camera + '<p>写真は準備中です。</p>';
      region.append(note);
      refresh();
    };
    if (config.src) {
      const figure = document.createElement('figure');
      const image = document.createElement('img');
      image.width = 1200;
      image.height = 900;
      image.loading = 'lazy';
      image.decoding = 'async';
      image.alt = config.alt || '';
      image.addEventListener('error', placeholder, { once: true });
      image.addEventListener('load', refresh, { once: true });
      image.src = config.src;
      figure.append(image);
      if (config.caption) {
        const caption = document.createElement('figcaption');
        caption.textContent = config.caption;
        figure.append(caption);
      }
      region.append(figure);
    } else placeholder();
    item.addEventListener('toggle', () => {
      // Also provide exclusive opening on browsers without details[name].
      if (item.open) item.parentElement.querySelectorAll('details[open]').forEach(other => {
        if (other !== item) other.open = false;
      });
      refresh();
    });
  });
}
