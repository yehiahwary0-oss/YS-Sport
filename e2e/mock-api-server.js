const http = require('http')

const PORT = process.env.E2E_MOCK_PORT || 8000
const APP_ORIGIN = 'http://localhost:3000'

const state = {
  status: 'unverified',
  rejectionReason: null,
  role: 'coach',
}

const COACH = {
  uuid: 'e2e-coach',
  email: 'coach@example.com',
  role: 'coach',
  status: 'active',
  email_verified_at: '2026-01-01T00:00:00Z',
}

const coachProfile = () => ({
  uuid: COACH.uuid,
  display_name: 'Hassan Coach',
  email: COACH.email,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  verification_status: state.status,
  rejection_reason: state.rejectionReason,
  certificate_path: state.status === 'unverified' ? null : '/certificates/e2e.pdf',
  profile_completion: 90,
  avg_rating: null,
  years_experience: 5,
  bio: 'E2E coach bio',
  location_city: 'Cairo',
  location_country: 'EG',
  avatar_path: null,
  sports: [],
})

const EMPTY_PAGINATED = { data: { data: [], current_page: 1, per_page: 15, last_page: 1, total: 0 } }
const SUMMARY = { data: { this_month_earned: '0', currency: 'USD' } }

function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', APP_ORIGIN)
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Pragma')
  res.setHeader('Access-Control-Allow-Private-Network', 'true')
  res.setHeader('Cache-Control', 'no-store')
}

function send(res, status, body) {
  cors(res)
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(body))
}

function readBody(req) {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (c) => (raw += c))
    req.on('end', () => {
      try { resolve(raw ? JSON.parse(raw) : {}) } catch { resolve({}) }
    })
  })
}

const fs = require('fs')

function log(line) {
  fs.appendFileSync('e2e/mock-server.log', `${new Date().toISOString()} ${line}\n`)
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    log('OPTIONS ' + req.url + ' h=' + (req.headers['access-control-request-private-network'] || '-'))
    cors(res)
    res.writeHead(204)
    res.end()
    return
  }

  const url = new URL(req.url, `http://localhost:${PORT}`)
  const path = url.pathname
  const method = req.method

  if (path === '/__e2e/state' && method === 'POST') {
    const body = await readBody(req)
    if (body.status) state.status = body.status
    if (body.rejectionReason !== undefined) state.rejectionReason = body.rejectionReason
    send(res, 200, { ok: true })
    return
  }

  if (path === '/__e2e/role' && method === 'POST') {
    const body = await readBody(req)
    state.role = body.role
    send(res, 200, { ok: true })
    return
  }

  if (!path.startsWith('/api/v1')) {
    send(res, 404, { error: { message: 'Not found' } })
    return
  }

  log(method + ' ' + path + ' status=' + state.status)

  if (path === '/api/v1/auth/me' && method === 'GET') {
    send(res, 200, { data: { ...COACH, role: state.role } })
    return
  }

  if (path === '/api/v1/auth/refresh') {
    send(res, 401, { error: { message: 'Unauthenticated.' } })
    return
  }

  if (path === '/api/v1/coach/profile' && method === 'GET') {
    send(res, 200, { data: coachProfile() })
    return
  }

  if (path === '/api/v1/coach/profile/certificate' && method === 'POST') {
    state.status = 'pending'
    state.rejectionReason = null
    send(res, 200, { data: coachProfile() })
    return
  }

  if (path === '/api/v1/marketplace/sports') {
    send(res, 200, { data: [] })
    return
  }

  if (path === '/api/v1/coach/service-requests' || path === '/api/v1/coach/bookings') {
    send(res, 200, EMPTY_PAGINATED)
    return
  }

  if (path === '/api/v1/coach/payments/summary') {
    send(res, 200, SUMMARY)
    return
  }

  if (path === '/api/v1/admin/coaches/pending-verification' && method === 'GET') {
    const list = state.status === 'pending' ? [{ ...coachProfile(), verification_status: 'pending' }] : []
    log('pending-verification returning ' + list.length + ' coaches')
    send(res, 200, {
      __marker: Date.now(),
      data: { data: list, current_page: 1, per_page: 15, last_page: 1, total: list.length },
    })
    return
  }

  if (/\/api\/v1\/admin\/coaches\/[^/]+\/verify$/.test(path) && method === 'PUT') {
    state.status = 'verified'
    send(res, 200, { data: coachProfile() })
    return
  }

  if (/\/api\/v1\/admin\/coaches\/[^/]+\/reject$/.test(path) && method === 'PUT') {
    state.status = 'rejected'
    send(res, 200, { data: coachProfile() })
    return
  }

  if (path === '/api/v1/admin/coaches' && method === 'GET') {
    send(res, 200, EMPTY_PAGINATED)
    return
  }

  if (path === '/api/v1/admin/metrics' && method === 'GET') {
    send(res, 200, {
      data: { coaches: { pending_verification: 0 }, revenue: { pending: 0 }, payouts: { pending: 0 } },
    })
    return
  }

  if (path === '/api/v1/notifications/unread-count' && method === 'GET') {
    send(res, 200, { data: 0 })
    return
  }

  send(res, 404, { error: { message: 'Not found' } })
})

server.listen(PORT, () => console.log(`[server] E2E mock API listening on ${PORT}`))

