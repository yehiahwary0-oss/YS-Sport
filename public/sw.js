/* YS Sports — Service Worker
 *
 * Strategies:
 *  - Install : precache app shell + icons
 *  - API GET : stale-while-revalidate (auth /auth/* responses never cached)
 *  - Navigate: network-first, offline fallback to cached start page
 *  - Static  : cache-first
 *
 * Security: requests carrying an Authorization header, /auth/* and
 * push-subscription endpoints are NEVER touched by the cache.
 */
const VERSION = 'v1'
const CACHE_NAME = `ys-cache-${VERSION}`
const STATIC_CACHE = `ys-static-${VERSION}`

const PRECACHE_ASSETS = ['/', '/manifest.json', '/icon-192.png', '/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
      .catch(() => {})
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith('ys-') && key !== CACHE_NAME && key !== STATIC_CACHE)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  )
})

const isApiRequest = (url) => /\/api\//.test(url.pathname)
const isAuthOrSensitive = (request, url) =>
  request.headers.get('authorization') !== null ||
  url.pathname.includes('/auth/') ||
  url.pathname.includes('push-subscription')

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request)
  const network = fetch(request)
    .then((response) => {
      if (response && response.status === 200) {
        const copy = response.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
      }
      return response
    })
    .catch(() => cached)
  return cached || network
}

async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response && response.status === 200) {
      const copy = response.clone()
      caches.open(CACHE_NAME).then((cache) => cache.put(request, copy))
    }
    return response
  } catch (error) {
    const cached = await caches.match(request)
    if (cached) return cached

    const startPage = await caches.match('/')
    if (startPage) return startPage

    return new Response(
      '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title></head><body style="background:#0a0a0a;color:#fafafa;font-family:system-ui;display:grid;place-items:center;height:100vh;margin:0;text-align:center"><div><h1>You are offline</h1><p>Connect to the internet to keep using YS Sports.</p></div></body></html>',
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }
}

async function cacheFirstStatic(request) {
  const cached = await caches.match(request)
  if (cached) return cached
  try {
    const response = await fetch(request)
    if (response && response.status === 200) {
      const copy = response.clone()
      caches.open(STATIC_CACHE).then((cache) => cache.put(request, copy))
    }
    return response
  } catch (error) {
    if (request.destination === 'image') return caches.match('/icon-192.png')
    throw error
  }
}

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  const crossOrigin = url.origin !== self.location.origin

  if (isApiRequest(url)) {
    if (isAuthOrSensitive(request, url)) return
    event.respondWith(staleWhileRevalidate(request))
    return
  }

  if (crossOrigin) return

  if (request.mode === 'navigate') {
    event.respondWith(networkFirst(request))
  } else if (request.destination === 'document') {
    event.respondWith(networkFirst(request))
  } else {
    event.respondWith(cacheFirstStatic(request))
  }
})

// ── Push notifications ─────────────────────────────────────────

function normalizePushUrl(rawUrl) {
  try {
    const url = new URL(rawUrl, self.location.origin)
    if (url.origin === self.location.origin) return url.pathname + url.search
  } catch (e) {
    /* invalid — fall through to '/' */
  }
  return '/'
}

self.addEventListener('push', (event) => {
  let payload = { title: 'YS Sports', body: '', icon: '/icon-192.png', badge: '/icon-192.png', tag: 'notification', data: {}, actions: [] }
  try {
    const parsed = event.data ? event.data.json() : {}
    payload = Object.assign({}, payload, parsed)
  } catch (e) {
    payload.body = event.data ? event.data.text() : ''
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || 'YS Sports', {
      body: payload.body || '',
      icon: payload.icon || '/icon-192.png',
      badge: payload.badge || '/icon-192.png',
      tag: payload.tag || 'notification',
      renotify: true,
      data: { url: normalizePushUrl(payload.data ? payload.data.url : null) },
      actions: payload.actions.length
        ? payload.actions
        : [
            { action: 'open', title: 'View' },
            { action: 'dismiss', title: 'Dismiss' },
          ],
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  if (event.action === 'dismiss') return

  const url = event.notification.data && event.notification.data.url ? event.notification.data.url : '/'

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if ('focus' in client) {
          client.navigate(url).catch(() => {})
          return client.focus()
        }
      }
      return self.clients.openWindow(url)
    })
  )
})

self.addEventListener('pushsubscriptionchange', (event) => {
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      clients.forEach((client) => client.postMessage({ type: 'PUSH_SUBSCRIPTION_CHANGED' }))
    })
  )
})
