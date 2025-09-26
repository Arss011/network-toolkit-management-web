const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

class UserService {
  async getUsers(params = {}) {
    const token = localStorage.getItem('token')
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      page_size: params.pageSize || 10,
      ...params
    })

    const response = await fetch(`${API_BASE_URL}/users?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch users')
    }

    const data = await response.json()
    return data
  }

  async searchUsers(searchParams) {
    const token = localStorage.getItem('token')
    const queryParams = new URLSearchParams({
      page: searchParams.page || 1,
      page_size: searchParams.pageSize || 10,
    })

    const response = await fetch(`${API_BASE_URL}/users/search?${queryParams}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(searchParams),
    })

    if (!response.ok) {
      throw new Error('Failed to search users')
    }

    const data = await response.json()
    return data
  }

  async createUser(userData) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to create user')
    }

    const data = await response.json()
    return data
  }

  async updateUser(id, userData) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update user')
    }

    const data = await response.json()
    return data
  }

  async deleteUser(id) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete user')
    }

    return { success: true }
  }
}

export const userService = new UserService()