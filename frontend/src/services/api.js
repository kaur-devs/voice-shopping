import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

export async function fetchProducts({ page = 1, limit = 20, category, gender, color, min_price, max_price, search } = {}) {
  const params = { page, limit }
  if (category) params.category = category
  if (gender) params.gender = gender
  if (color) params.color = color
  if (min_price) params.min_price = min_price
  if (max_price) params.max_price = max_price
  if (search) params.search = search

  const { data } = await api.get('/products', { params })
  return data
}

export async function fetchProduct(id) {
  const { data } = await api.get(`/products/${id}`)
  return data
}

export async function fetchCategories() {
  const { data } = await api.get('/products/categories')
  return data.categories
}

export async function processVoice(audioBlob, language = 'auto') {
  const formData = new FormData()
  formData.append('audio', audioBlob, 'recording.wav')
  formData.append('language', language)

  const { data } = await api.post('/voice/process', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}

export async function textSearch(query, language = 'en') {
  const formData = new FormData()
  formData.append('query', query)
  formData.append('language', language)

  const { data } = await api.post('/voice/text-search', formData)
  return data
}

export async function fetchCart(sessionId) {
  const { data } = await api.get(`/cart/${sessionId}`)
  return data
}

export async function addToCart(sessionId, productId, quantity = 1, size = '') {
  const { data } = await api.post(`/cart/${sessionId}/add`, {
    product_id: productId,
    quantity,
    size,
  })
  return data
}

export async function removeFromCart(sessionId, productId) {
  const { data } = await api.delete(`/cart/${sessionId}/remove/${productId}`)
  return data
}

export async function clearCart(sessionId) {
  const { data } = await api.delete(`/cart/${sessionId}/clear`)
  return data
}

export async function fetchRecommendations(productId, n = 8) {
  const { data } = await api.get(`/recommendations/${productId}`, { params: { n } })
  return data.recommendations
}
