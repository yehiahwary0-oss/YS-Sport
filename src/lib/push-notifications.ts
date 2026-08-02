import { api } from '@/lib/api'

export const SW_URL = '/sw.js'

export interface PushSubscriptionPayload {
  endpoint: string
  p256dh: string
  auth: string
  device_type?: 'web' | 'ios' | 'android'
}

export function isPushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window
}

export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function getVapidPublicKey(): Promise<string> {
  if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    return process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
  }
  const { data } = await api.get('/config/vapid-key')
  const key = data?.data?.public_key
  if (!key) throw new Error('VAPID public key not configured')
  return key as string
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushSupported()) return null
  if (!('serviceWorker' in navigator)) return null
  const registration = await navigator.serviceWorker.register(SW_URL, { scope: '/' })
  return registration
}

export async function getActiveSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.getRegistration()
  if (!registration) return null
  return registration.pushManager.getSubscription()
}

export async function subscribeToPush(): Promise<PushSubscription | null> {
  if (!isPushSupported()) return null

  const registration = await registerServiceWorker()
  if (!registration) return null

  let subscription = await registration.pushManager.getSubscription()
  if (!subscription) {
    const vapidPublicKey = await getVapidPublicKey()
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
    })
  }

  const payload: PushSubscriptionPayload = {
    endpoint: subscription.endpoint,
    p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')!))),
    auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth')!))),
    device_type: 'web',
  }

  await api.post('/notifications/push-subscription', payload)
  return subscription
}

export async function unsubscribeFromPush(subscription?: PushSubscription | null): Promise<void> {
  if (!isPushSupported()) return
  const current = subscription ?? (await getActiveSubscription())
  if (current) {
    try {
      await api.delete('/notifications/push-subscription', { data: { endpoint: current.endpoint } })
    } catch {
      // Best-effort: the server will drop expired endpoints (404/410) on next send.
    }
    await current.unsubscribe()
  }
}

export function isStandalonePwa(): boolean {
  return (
    typeof window !== 'undefined' &&
    (window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  )
}
