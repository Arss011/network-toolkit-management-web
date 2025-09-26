const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

class CategoryService {
  async getCategories(params = {}) {
    const token = localStorage.getItem('token')
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      page_size: params.pageSize || 10,
      ...params
    })

    const response = await fetch(`${API_BASE_URL}/categories?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch categories')
    }

    const data = await response.json()
    return data
  }

  async getCategoryTree() {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/categories/tree`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch category tree')
    }

    const data = await response.json()
    return data
  }

  async getCategoryById(id) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to fetch category')
    }

    const data = await response.json()
    return data
  }

  async createCategory(categoryData) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/categories`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create category')
    }

    const data = await response.json()
    return data
  }

  async updateCategory(id, categoryData) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(categoryData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update category')
    }

    const data = await response.json()
    return data
  }

  async deleteCategory(id) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete category')
    }

    return { success: true }
  }
}

export const categoryService = new CategoryService()