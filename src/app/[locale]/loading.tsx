import { Logo } from '@/components/layout/Logo'
import { Spinner } from '@/components/ui/Spinner'

export default function RootLoading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-navy-900 px-6">
      <Logo />
      <Spinner className="h-8 w-8" />
    </div>
  )
}
