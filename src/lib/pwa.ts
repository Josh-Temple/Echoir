const isPwaSupported = 'serviceWorker' in navigator;

export function registerPwa() {
  if (!isPwaSupported || import.meta.env.DEV) {
    return;
  }

  const baseUrl = import.meta.env.BASE_URL;

  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${baseUrl}sw.js`, {
        scope: baseUrl
      })
      .catch((error: unknown) => {
        console.error('PWA service worker registration failed.', error);
      });
  });
}
