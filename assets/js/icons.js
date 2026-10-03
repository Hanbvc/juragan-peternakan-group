/* Ikon garis 24×24 yang dipakai ulang di seluruh halaman.
   Elemen dengan atribut data-icon="nama" akan otomatis diisi. */
window.JPG_ICONS = {
  genetika: '<path d="M8 3c0 4.5 8 4.5 8 9s-8 4.5-8 9"/><path d="M16 3c0 4.5-8 4.5-8 9s8 4.5 8 9"/><path d="M9.2 6.5h5.6M9.2 17.5h5.6M10.6 12h2.8"/>',
  pakan: '<path d="M12 21v-9"/><path d="M12 12C12 7 8.5 4 4 4c0 5 3.2 8 8 8z"/><path d="M12 15c0-4 3.2-7 8-7 0 4-3.2 7-8 7z"/>',
  feedlot: '<path d="M3 21V10l9-6 9 6v11"/><path d="M2 21h20"/><path d="M8 21v-7h8v7"/><path d="M8 14l8 7M16 14l-8 7"/>',
  vet: '<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M12 9v6M9 12h6"/>',
  rph: '<circle cx="12" cy="9.5" r="6"/><path d="M9.4 9.6l1.8 1.8 3.6-3.6"/><path d="M8.4 14.6L7 21l5-2.6 5 2.6-1.4-6.4"/>',
  daging: '<path d="M2.5 6h11v10h-11z"/><path d="M13.5 9.5h4l3.5 3.5v3h-7.5"/><circle cx="6.5" cy="17.5" r="2"/><circle cx="17" cy="17.5" r="2"/>',
  tech: '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2.5V6M15 2.5V6M9 18v3.5M15 18v3.5M2.5 9H6M2.5 15H6M18 9h3.5M18 15h3.5"/><path d="M10 10h4v4h-4z"/>',
  mitra: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/><circle cx="17" cy="9" r="2.6"/><path d="M15.8 14.1c2.9.3 5.2 2.8 5.2 5.9"/>',
  tag: '<path d="M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9z"/><circle cx="8" cy="8" r="1.6"/><path d="M12.5 12.5l3 3"/>',
  chart: '<path d="M3 3v18h18"/><path d="M7 15l4-4 3 3 6-7"/><path d="M16 7h4v4"/>',
  trace: '<circle cx="5" cy="6" r="2.2"/><circle cx="19" cy="18" r="2.2"/><path d="M7.2 6H15a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h7.8"/>',
  chain: '<rect x="2.5" y="9" width="7" height="6" rx="3"/><rect x="14.5" y="9" width="7" height="6" rx="3"/><path d="M9.5 12h5"/>'
};

window.JPG_icon = function (name) {
  const d = window.JPG_ICONS[name] || '';
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + '</svg>';
};

document.querySelectorAll('[data-icon]').forEach(function (el) {
  el.innerHTML = window.JPG_icon(el.getAttribute('data-icon'));
});
