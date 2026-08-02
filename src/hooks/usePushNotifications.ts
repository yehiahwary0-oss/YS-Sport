import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'
import { useAuthStore } from '@/store/auth.store'
import {
  getActiveSubscription,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
} from '@/lib/push-notifications'

interface PushState {
  supported: boolean
  permission: NotificationPermission | 'unsupported'
  subscription: PushSubscription | null
  loading: boolean
}

export function usePushNotifications() {
  const t = useTranslations('notification.push')
  const user = useAuthStore((s) => s.user)
  const [state, setState] = useState<PushState>({
    supported: isPushSupported(),
    permission: isPushSupported() ? Notification.permission : 'unsupported',
    subscription: null,
    loading: false,
  })

  const refreshState = useCallback(async () => {
    if (!isPushSupported()) return
    const subscription = await getActiveSubscription()
    setState((prev) => ({
      ...prev,
      permission: Notification.permission,
      subscription,
    }))
  }, [])

  useEffect(() => {
    if (!isPushSupported()) return
    refreshState()

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshState()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [refreshState])

  const enable = useCallback(async (): Promise<boolean> => {
    if (!state.supported) return false
    setState((prev) => ({ ...prev, loading: true }))
    try {
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') return false
      const subscription = await subscribeToPush()
      setState((prev) => ({
        ...prev,
        permission: Notification.permission,
        subscription,
      }))
      return subscription !== null
    } catch (error) {
      toast.error(t('enableError'))
      return false
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }, [state.supported, t])

  const disable = useCallback(async () => {
    if (!state.supported) return
    setState((prev) => ({ ...prev, loading: true }))
    try {
      await unsubscribeFromPush(state.subscription)
      setState((prev) => ({ ...prev, permission: Notification.permission, subscription: null }))
    } catch {
      toast.error(t('disableError'))
    } finally {
      setState((prev) => ({ ...prev, loading: false }))
    }
  }, [state.supported, state.subscription, t])

  useEffect(() => {
    if (!user || !state.supported || state.permission !== 'granted') return
    if (!state.subscription && !state.loading) {
      subscribeToPush()
        .then((subscription) => {
          if (subscription) {
            setState((prev) => ({ ...prev, subscription }))
          }
        })
        .catch(() => {
          /* silently retried on next visibility change */
        })
    }
  }, [user, state.supported, state.permission, state.subscription, state.loading])

  return {
    ...state,
    isEnabled: state.permission === 'granted' && state.subscription !== null,
    enable,
    disable,
  }
}
