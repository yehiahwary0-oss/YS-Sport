'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Trophy, Plus, Pencil, ToggleLeft, ToggleRight, Search, Medal, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Modal } from '@/components/ui/Modal'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import {
  useAdminAchievements,
  useCreateAchievement,
  useUpdateAchievement,
  useToggleAchievementStatus,
  useGrantAchievement,
} from '@/hooks/useAdmin'
import { useSports } from '@/hooks/useMarketplace'
import type { AchievementDefinition, CriteriaType } from '@/types'
import type { AchievementFormData } from '@/services/admin.service'
import { getApiError } from '@/lib/api'

const criteriaTypes: CriteriaType[] = ['session_count', 'level_reached', 'xp_threshold', 'sport_count', 'admin_granted']

const operatorOptions: Record<CriteriaType, { value: string; label: string }[]> = {
  session_count: [{ value: 'gte', label: '≥' }, { value: 'lte', label: '≤' }, { value: 'eq', label: '=' }],
  level_reached: [{ value: 'gte', label: '≥' }, { value: 'lte', label: '≤' }, { value: 'eq', label: '=' }],
  xp_threshold: [{ value: 'gte', label: '≥' }, { value: 'eq', label: '=' }],
  sport_count: [{ value: 'gte', label: '≥' }, { value: 'eq', label: '=' }],
  admin_granted: [],
}

const criteriaNeedsOperator = (type: CriteriaType) => operatorOptions[type].length > 0
const criteriaNeedsValue = (type: CriteriaType) => type !== 'admin_granted'
const criteriaNeedsSport = (type: CriteriaType) => !['admin_granted', 'sport_count'].includes(type)

interface FormState {
  slug: string
  name: string
  description: string
  icon: string
  category: string
  sport_id: number | null | 'null'
  criteria_type: CriteriaType
  criteria_operator: string
  criteria_value: string
  xp_reward: string
  sort_order: string
  is_active: boolean
}

const emptyForm: FormState = {
  slug: '',
  name: '',
  description: '',
  icon: '',
  category: '',
  sport_id: null,
  criteria_type: 'session_count',
  criteria_operator: 'gte',
  criteria_value: '',
  xp_reward: '0',
  sort_order: '0',
  is_active: true,
}

const fromAchievement = (a: AchievementDefinition): FormState => ({
  slug: a.slug,
  name: a.name,
  description: a.description ?? '',
  icon: a.icon ?? '',
  category: a.category ?? '',
  sport_id: a.sport_id ?? null,
  criteria_type: a.criteria.type,
  criteria_operator: a.criteria.operator ?? 'gte',
  criteria_value: a.criteria.value !== undefined ? String(a.criteria.value) : '',
  xp_reward: String(a.xp_reward),
  sort_order: String(a.sort_order),
  is_active: a.is_active,
})

export default function AdminAchievementsPage() {
  const t = useTranslations('admin.achievements')
  const tc = useTranslations('common')

  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [isActiveFilter, setIsActiveFilter] = useState<string>('')
  const [criteriaTypeFilter, setCriteriaTypeFilter] = useState<string>('')
  const [sort, setSort] = useState('sort_order')
  const [dir, setDir] = useState('asc')

  const { data: result, isLoading, isError } = useAdminAchievements({
    page,
    search: search || undefined,
    is_active: isActiveFilter ? isActiveFilter === 'true' : undefined,
    criteria_type: criteriaTypeFilter || undefined,
    sort,
    dir,
  })

  const { data: sports } = useSports()
  const createAchievement = useCreateAchievement()
  const updateAchievement = useUpdateAchievement()
  const toggleAchievementStatus = useToggleAchievementStatus()

  const [showAdd, setShowAdd] = useState(false)
  const [editing, setEditing] = useState<AchievementDefinition | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)

  const [grantTarget, setGrantTarget] = useState<AchievementDefinition | null>(null)
  const [grantAthleteId, setGrantAthleteId] = useState('')
  const [grantStep, setGrantStep] = useState<'input' | 'confirm'>('input')
  const grantAchievement = useGrantAchievement()

  const resetAdd = () => { setForm(emptyForm); setShowAdd(false) }
  const resetEdit = () => { setForm(emptyForm); setEditing(null) }

  const handleAdd = () => {
    const payload = buildPayload(form)
    createAchievement.mutate(payload, { onSuccess: resetAdd })
  }

  const handleEdit = (a: AchievementDefinition) => {
    setForm(fromAchievement(a))
    setEditing(a)
  }

  const handleUpdate = () => {
    if (!editing) return
    const payload = buildPayload(form)
    updateAchievement.mutate({ id: editing.id, ...payload }, { onSuccess: resetEdit })
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => <div key={i} className="card h-20 animate-pulse" />)}
      </div>
    )
  }

  if (isError) {
    return <ErrorState onRetry={() => window.location.reload()} />
  }

  const achievements = result?.data ?? []
  const meta = result?.meta
  const criteriaLabel = (type: string) => {
    const labels: Record<string, string> = {
      session_count: 'Session Count',
      level_reached: 'Level Reached',
      xp_threshold: 'XP Threshold',
      sport_count: 'Sport Count',
      admin_granted: 'Admin Granted',
    }
    return labels[type] ?? type
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-display font-semibold text-zinc-100">{t('title')}</h1>
        <Button className="gap-1.5" onClick={() => { resetAdd(); setShowAdd(true) }}>
          <Plus className="h-4 w-4" /> {t('createButton')}
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            className="input w-full pl-9"
            placeholder="Search slug / name…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>
        <select
          className="input w-32"
          value={isActiveFilter}
          onChange={(e) => { setIsActiveFilter(e.target.value); setPage(1) }}
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select
          className="input w-40"
          value={criteriaTypeFilter}
          onChange={(e) => { setCriteriaTypeFilter(e.target.value); setPage(1) }}
        >
          <option value="">All Types</option>
          {criteriaTypes.map((ct) => (
            <option key={ct} value={ct}>{criteriaLabel(ct)}</option>
          ))}
        </select>
        <select
          className="input w-36"
          value={`${sort}:${dir}`}
          onChange={(e) => {
            const [s, d] = e.target.value.split(':')
            setSort(s); setDir(d)
          }}
        >
          <option value="sort_order:asc">Sort Order ↑</option>
          <option value="sort_order:desc">Sort Order ↓</option>
          <option value="name:asc">Name A–Z</option>
          <option value="name:desc">Name Z–A</option>
          <option value="created_at:desc">Newest</option>
          <option value="created_at:asc">Oldest</option>
        </select>
      </div>

      {/* List */}
      {achievements.length === 0 ? (
        <EmptyState icon={Trophy} title={t('empty')} description={t('emptyDesc')} />
      ) : (
        <div className="space-y-3">
          {achievements.map((a) => (
            <div key={a.id} className="card flex items-center gap-4 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{a.icon || '🏆'}</span>
                  <span className="text-sm font-medium text-zinc-100">{a.name}</span>
                  <span className="text-xs text-zinc-500">({a.slug})</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${a.is_active ? 'bg-green-900/40 text-green-400' : 'bg-zinc-700 text-zinc-400'}`}>
                    {a.is_active ? t('active') : t('inactive')}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-zinc-500 truncate">
                  {criteriaLabel(a.criteria.type)}
                  {a.criteria.operator ? ` ${a.criteria.operator} ${a.criteria.value}` : ''}
                  {a.xp_reward > 0 ? ` · ${a.xp_reward} XP` : ''}
                  {a.athlete_achievements_count !== undefined ? ` · ${a.athlete_achievements_count} earned` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => toggleAchievementStatus.mutate(a.id)}>
                  {a.is_active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                </Button>
                <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => handleEdit(a)}>
                  <Pencil className="h-3.5 w-3.5" /> {tc('edit')}
                </Button>
                <Button size="sm" variant="ghost" className="gap-1.5" onClick={() => { setGrantTarget(a); setGrantAthleteId(''); setGrantStep('input') }}>
                  <Medal className="h-3.5 w-3.5" /> {t('grantButton')}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {Array.from({ length: meta.last_page }).map((_, i) => (
            <Button
              key={i}
              size="sm"
              variant={meta.current_page === i + 1 ? 'primary' : 'ghost'}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal open={showAdd} onOpenChange={(o) => !o && resetAdd()} title={t('createTitle')}>
        <AchievementForm
          form={form}
          setForm={setForm}
          sports={sports ?? []}
          t={t}
          tc={tc}
          onSave={handleAdd}
          onCancel={resetAdd}
          isPending={createAchievement.isPending}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editing} onOpenChange={(o) => !o && resetEdit()} title={t('editTitle')}>
        <AchievementForm
          form={form}
          setForm={setForm}
          sports={sports ?? []}
          t={t}
          tc={tc}
          onSave={handleUpdate}
          onCancel={resetEdit}
          isPending={updateAchievement.isPending}
        />
      </Modal>

      {/* Grant Modal */}
      <Modal
        open={!!grantTarget}
        onOpenChange={(o) => { if (!o) { setGrantTarget(null); setGrantAthleteId(''); setGrantStep('input') } }}
        title={t('grantTitle')}
      >
        {grantTarget && grantStep === 'input' && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-400">
              {t('grantDescription', { name: grantTarget.name })}
            </p>
            <Input
              id="grant-athlete-id"
              label={t('athleteIdLabel')}
              type="number"
              min="1"
              placeholder="e.g. 42"
              value={grantAthleteId}
              onChange={(e) => setGrantAthleteId(e.target.value)}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => { setGrantTarget(null); setGrantAthleteId(''); setGrantStep('input') }}>
                {tc('cancel')}
              </Button>
              <Button
                onClick={() => setGrantStep('confirm')}
                disabled={!grantAthleteId || !/^\d+$/.test(grantAthleteId)}
              >
                {t('grantNext')}
              </Button>
            </div>
          </div>
        )}
        {grantTarget && grantStep === 'confirm' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
              <AlertTriangle className="h-5 w-5 shrink-0 text-amber-400" />
              <p className="text-sm text-zinc-300">{t('grantConfirmWarning')}</p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-400">{t('achievement')}</span>
                <span className="text-zinc-100">{grantTarget.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">{t('athleteIdLabel')}</span>
                <span className="text-zinc-100">{grantAthleteId}</span>
              </div>
            </div>
            {grantAchievement.data?.status === 'awarded' && (
              <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="text-sm text-green-300">{t('grantSuccess')}</span>
              </div>
            )}
            {grantAchievement.data?.status === 'already_earned' && (
              <div className="flex items-center gap-2 rounded-lg border border-zinc-600 bg-zinc-800 p-3">
                <CheckCircle className="h-5 w-5 text-zinc-400" />
                <span className="text-sm text-zinc-400">{t('grantAlreadyEarned')}</span>
              </div>
            )}
            {grantAchievement.isError && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">
                {getApiError(grantAchievement.error)}
              </div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="ghost" onClick={() => { setGrantStep('input') }} disabled={grantAchievement.isPending}>
                {grantAchievement.data ? tc('close') : tc('back')}
              </Button>
              {!grantAchievement.data && (
                <Button
                  onClick={() => grantAchievement.mutate({ achievementId: grantTarget.id, athleteId: Number(grantAthleteId) })}
                  isLoading={grantAchievement.isPending}
                >
                  {t('grantConfirm')}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

function buildPayload(form: FormState): AchievementFormData {
  const type = form.criteria_type
  // The API's `criteria` field carries only operator/value — the backend
  // injects `type` itself from `criteria_type` (AchievementController:110).
  const criteria: NonNullable<AchievementFormData['criteria']> = {}
  if (criteriaNeedsOperator(type)) criteria.operator = form.criteria_operator
  if (criteriaNeedsValue(type)) criteria.value = Number(form.criteria_value)
  return {
    slug: form.slug,
    name: form.name,
    description: form.description || null,
    icon: form.icon || null,
    category: form.category || null,
    sport_id: criteriaNeedsSport(type) ? (form.sport_id === 'null' ? null : form.sport_id) : null,
    criteria_type: type,
    criteria,
    xp_reward: Number(form.xp_reward),
    sort_order: Number(form.sort_order),
    is_active: form.is_active,
  }
}

function AchievementForm({
  form, setForm, sports, t, tc, onSave, onCancel, isPending,
}: {
  form: FormState
  setForm: (f: FormState) => void
  sports: { id: number; name: string }[]
  t: (key: string) => string
  tc: (key: string) => string
  onSave: () => void
  onCancel: () => void
  isPending: boolean
}) {
  const type = form.criteria_type
  const showOperator = criteriaNeedsOperator(type)
  const showValue = criteriaNeedsValue(type)
  const showSport = criteriaNeedsSport(type)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t('slug')}
          placeholder="first-session"
          value={form.slug}
          onChange={(e) => setForm({ ...form, slug: e.target.value })}
          required
        />
        <Input
          label={t('name')}
          placeholder="First Session"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-xs text-zinc-400">{t('description')}</label>
        <textarea
          className="input w-full min-h-[60px]"
          placeholder="Achievement description…"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t('icon')}
          placeholder="🏆"
          value={form.icon}
          onChange={(e) => setForm({ ...form, icon: e.target.value })}
        />
        <Input
          label={t('category')}
          placeholder="Milestones"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-zinc-400">{t('criteriaType')}</label>
          <select
            className="input w-full"
            value={form.criteria_type}
            onChange={(e) => {
              const newType = e.target.value as CriteriaType
              const newOp = operatorOptions[newType]?.[0]?.value ?? ''
              setForm({ ...form, criteria_type: newType, criteria_operator: newOp })
            }}
          >
            {criteriaTypes.map((ct) => (
              <option key={ct} value={ct}>
                {ct === 'session_count' ? 'Session Count' :
                 ct === 'level_reached' ? 'Level Reached' :
                 ct === 'xp_threshold' ? 'XP Threshold' :
                 ct === 'sport_count' ? 'Sport Count' : 'Admin Granted'}
              </option>
            ))}
          </select>
        </div>
        {showOperator && (
          <div>
            <label className="mb-1 block text-xs text-zinc-400">{t('operator')}</label>
            <select
              className="input w-full"
              value={form.criteria_operator}
              onChange={(e) => setForm({ ...form, criteria_operator: e.target.value })}
            >
              {operatorOptions[type].map((op) => (
                <option key={op.value} value={op.value}>{op.label}</option>
              ))}
            </select>
          </div>
        )}
        {showValue && (
          <Input
            label={t('value')}
            type="number"
            min="1"
            value={form.criteria_value}
            onChange={(e) => setForm({ ...form, criteria_value: e.target.value })}
          />
        )}
      </div>
      {showSport && (
        <div>
          <label className="mb-1 block text-xs text-zinc-400">{t('sport')}</label>
          <select
            className="input w-full"
            value={form.sport_id === null ? '' : form.sport_id === 'null' ? '' : form.sport_id}
            onChange={(e) => setForm({ ...form, sport_id: e.target.value ? Number(e.target.value) : null })}
          >
            <option value="">{t('noSport')}</option>
            {sports.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <Input
          label={t('xpReward')}
          type="number"
          min="0"
          value={form.xp_reward}
          onChange={(e) => setForm({ ...form, xp_reward: e.target.value })}
        />
        <Input
          label={t('sortOrder')}
          type="number"
          min="0"
          value={form.sort_order}
          onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
        />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
          className="rounded border-zinc-600 bg-zinc-800 text-amber-500 focus:ring-amber-500"
        />
        <span className="text-sm text-zinc-300">{t('isActive')}</span>
      </label>
      <div className="flex justify-end gap-3 pt-2">
        <Button variant="ghost" onClick={onCancel}>{tc('cancel')}</Button>
        <Button
          onClick={onSave}
          disabled={!form.slug || !form.name}
          isLoading={isPending}
        >
          {tc('save')}
        </Button>
      </div>
    </div>
  )
}
