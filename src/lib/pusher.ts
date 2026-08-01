import Pusher from 'pusher-js'
import { tokenStore } from './api'

let pusherInstance: Pusher | null = null

/**
 * Singleton Pusher client. Auth goes through our Laravel backend's
 * broadcasting/auth endpoint (private channels), with the JWT access
 * token attached so the backend can verify channel membership via
 * ConversationChannel::join().
 */
export function getPusherClient(): Pusher {
  if (pusherInstance) return pusherInstance

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'
  const authEndpoint = apiUrl.replace('/api/v1', '') + '/broadcasting/auth'

  pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY ?? '', {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'mt1',
    authEndpoint,
    auth: {
      headers: {
        // Attached dynamically per-request since the token can rotate
        get Authorization() {
          const token = tokenStore.get()
          return token ? `Bearer ${token}` : ''
        },
      },
    },
  })

  return pusherInstance
}

export function disconnectPusher() {
  if (pusherInstance) {
    pusherInstance.disconnect()
    pusherInstance = null
  }
}
