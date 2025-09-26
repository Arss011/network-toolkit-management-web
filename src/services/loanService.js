const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api'

class LoanService {
  async getLoans(params = {}) {
    const token = localStorage.getItem('token')
    const queryParams = new URLSearchParams({
      page: params.page || 1,
      page_size: params.pageSize || 10,
      ...params
    })

    const response = await fetch(`${API_BASE_URL}/loans?${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch loans')
    }

    const data = await response.json()
    return data
  }

  async getLoanById(id) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/loans/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch loan')
    }

    const data = await response.json()
    return data
  }

  async createLoan(loanData) {
    const token = localStorage.getItem('token')
    
    const response = await fetch(`${API_BASE_URL}/loans`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loanData),
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('Create loan error:', error)
      console.error('Status:', response.status)
      throw new Error(error.message || `Failed to create loan (${response.status})`)
    }

    const data = await response.json()
    return data
  }

  async updateLoan(id, loanData) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/loans/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loanData),
    })

    if (!response.ok) {
      throw new Error('Failed to update loan')
    }

    const data = await response.json()
    return data
  }

  async deleteLoan(id) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/loans/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to delete loan')
    }

    return { success: true }
  }

  async returnLoan(id, returnData) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/loans/${id}/return`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(returnData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to return loan')
    }

    const data = await response.json()
    return data
  }

  async updateLoanStatus(id, statusData) {
    const token = localStorage.getItem('token')
    const response = await fetch(`${API_BASE_URL}/loans/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(statusData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Failed to update loan status')
    }

    const data = await response.json()
    return data
  }
}

export const loanService = new LoanService()