import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

// ─── Response interceptor for unified error handling ───
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'Something went wrong'

    return Promise.reject(new Error(message))
  }
)

/**
 * POST /expense — Log a new expense to the hash-chained ledger
 * @param {{ description: string, amount: number }} data
 * @returns {{ status: string, id: string }}
 */
export async function addExpense(data) {
  const res = await api.post('/expense', {
    description: data.description,
    amount: parseFloat(data.amount),
  })
  return res.data
}

/**
 * GET /ledger — Fetch the full hash-chained audit trail
 * @returns {Array<{ expense: object, previousHash: string, currentHash: string }>}
 */
export async function getLedger() {
  const res = await api.get('/ledger')
  return res.data
}

/**
 * GET /verify_balance — Verify FHE computation securely
 * Returns success/failure/message
 */
export async function verifyFHE(payload = {}) {
  const res = await api.get('/verify_balance', { params: { user_id: 'alice', threshold: '3000' } })
  return res.data
}

export default api
