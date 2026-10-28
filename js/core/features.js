/* Build-resolved release features. The source document is fail-closed. */
G.Features = Object.freeze({
  mockAudience: document.documentElement.dataset.mockAudience === 'on'
});
