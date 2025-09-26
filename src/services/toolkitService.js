const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

class ToolkitService {
  async getToolkits(params = {}) {
    const token = localStorage.getItem('token')
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      page_size: params.pageSize || 10,
      ...params
    })

    const response = await fetch(`${API_BASE_URL}/toolkits?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Get toolkits error:', error)
      throw new Error(error.message || 'Failed to fetch toolkits')
    }

    const data = await response.json()
    return data
  }

  async searchToolkits(searchParams) {
    const token = localStorage.getItem('token')
    const queryParams = new URLSearchParams({
      page: searchParams.page || 1,
      page_size: searchParams.pageSize || 10,
    })

    // console.log('Searching toolkits with params:', searchParams)

    const response = await fetch(`${API_BASE_URL}/toolkits/search?${queryParams}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Search toolkits error:', error)
      throw new Error(error.message || 'Failed to search toolkits')
    }

    const data = await response.json()
    return data
  }

  async createToolkit(toolkitData) {
    const token = localStorage.getItem('token')

    const payload = {
      ...toolkitData,
      category_id: toolkitData.category_id ? parseInt(toolkitData.category_id) : null
    }

    // console.log('Sending toolkit data:', payload)

    const response = await fetch(`${API_BASE_URL}/toolkits`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('API Error Response:', error)
      console.error('Status:', response.status)
      console.error('Status Text:', response.statusText)
      throw new Error(error.message || `Failed to create toolkit (${response.status})`)
    }

    const data = await response.json()
    return data
  }

  async updateToolkit(id, toolkitData) {
    const token = localStorage.getItem('token')

    const payload = {
      ...toolkitData,
      category_id: toolkitData.category_id ? parseInt(toolkitData.category_id) : null
    }

    const response = await fetch(`${API_BASE_URL}/toolkits/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Update toolkit error:', error)
      console.error('Status:', response.status)
      throw new Error(error.message || `Failed to update toolkit (${response.status})`)
    }

    const data = await response.json()
    return data
  }

  async deleteToolkit(id) {
    const token = localStorage.getItem('token')
    // console.log('Deleting toolkit with id:', id)

    const response = await fetch(`${API_BASE_URL}/toolkits/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Delete toolkit error:', error)
      console.error('Status:', response.status)
      throw new Error(error.message || `Failed to delete toolkit (${response.status})`)
    }

    return { success: true }
  }

  async getToolkitById(id) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/toolkits/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `Failed to fetch toolkit (${response.status})`)
    }

    const data = await response.json()
    return data
  }

  async updateToolkitStock(id, stockData) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/toolkits/${id}/stock`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(stockData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update toolkit stock')
    }

    const data = await response.json()
    return data
  }
}

export const toolkitService = new ToolkitService()