const loadedScripts = new Map();

export async function loadExternalScript(src, attributes = {}) {
  if (!src) throw new Error('Script source is required');
  if (loadedScripts.has(src)) return loadedScripts.get(src);

  const promise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve(window));
      existing.addEventListener('error', reject);
      if (existing.complete) resolve(window);
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        script.setAttribute(key, value);
      }
    });

    script.onload = () => resolve(window);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  loadedScripts.set(src, promise);
  return promise;
}
