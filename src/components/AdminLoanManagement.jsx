import { useState, useEffect } from 'react'
import { loanService } from '../services/loanService'
import { userService } from '../services/userService'
import { toolkitService } from '../services/toolkitService'
import LoanForm from './LoanForm'
import { FaEdit, FaTrash, FaSearch, FaPlus, FaCalendarAlt, FaUser, FaTools, FaBox, FaFilter } from 'react-icons/fa'

function AdminLoanManagement() {
  const [loans, setLoans] = useState([])
  const [users, setUsers] = useState([])
  const [toolkits, setToolkits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingLoan, setEditingLoan] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [deleteModal, setDeleteModal] = useState({ show: false, loan: null })
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    overdue: 0,
    completed: 0
  })

  const itemsPerPage = 10

  useEffect(() => {
    fetchLoans()
    fetchUsers()
    fetchToolkits()
    fetchStats()
  }, [])

  useEffect(() => {
    fetchLoans()
  }, [currentPage, searchTerm, statusFilter])

  const fetchLoans = async () => {
    setLoading(true)
    try {
      const params = {
        page: currentPage,
        page_size: itemsPerPage
      }

      if (searchTerm) {
        params.search_term = searchTerm
      }

      if (statusFilter) {
        params.status = statusFilter
      }

      const response = await loanService.getLoans(params)
      setLoans(response.data || [])
      setTotalPages(response.total_pages || 0)
      setTotalCount(response.total_count || 0)
      setError(null)
    } catch (error) {
      console.error('Failed to fetch loans:', error)
      setError('Gagal memuat data peminjaman')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await userService.getUsers({ page_size: 1000, is_active: true })
      setUsers(response.data || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const fetchToolkits = async () => {
    try {
      const response = await toolkitService.getToolkits({ page_size: 1000 })
      setToolkits(response.data || [])
    } catch (error) {
      console.error('Failed to fetch toolkits:', error)
    }
  }

  const fetchStats = async () => {
    try {
      const [allLoansResponse, activeLoansResponse, overdueLoansResponse] = await Promise.all([
        loanService.getLoans({ page_size: 1 }),
        loanService.getLoans({ page_size: 1000, status: 'active' }),
        loanService.getLoans({ page_size: 1000, status: 'overdue' })
      ])

      setStats({
        total: allLoansResponse.total_count || 0,
        active: activeLoansResponse.total_count || 0,
        overdue: overdueLoansResponse.total_count || 0,
        completed: Math.max(0, (allLoansResponse.total_count || 0) - (activeLoansResponse.total_count || 0) - (overdueLoansResponse.total_count || 0))
      })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  const handleCreateLoan = async (loanData) => {
    try {
      await loanService.createLoan(loanData)
      setShowForm(false)
      fetchLoans()
      fetchStats()
    } catch (error) {
      console.error('Failed to create loan:', error)
      throw error
    }
  }

  const handleUpdateLoan = async (loanData) => {
    try {
      await loanService.updateLoan(editingLoan.id, loanData)
      setEditingLoan(null)
      setShowForm(false)
      fetchLoans()
      fetchStats()
    } catch (error) {
      console.error('Failed to update loan:', error)
      throw error
    }
  }

  const handleDeleteLoan = async (loanId) => {
    try {
      await loanService.deleteLoan(loanId)
      setDeleteModal({ show: false, loan: null })
      fetchLoans()
      fetchStats()
    } catch (error) {
      console.error('Failed to delete loan:', error)
      throw error
    }
  }

  const getUserById = (userId) => {
    return users.find(user => user.id === userId)
  }

  const getToolkitById = (toolkitId) => {
    return toolkits.find(toolkit => toolkit.id === toolkitId)
  }

  const getLoanStatus = (loan) => {
    const now = new Date()
    const dueDate = new Date(loan.due_date)
    const returnedDate = loan.returned_date ? new Date(loan.returned_date) : null

    if (returnedDate) {
      return {
        status: 'completed',
        label: 'Dikembalikan',
        color: 'bg-green-100 text-green-800'
      }
    }

    if (now > dueDate) {
      return {
        status: 'overdue',
        label: 'Terlambat',
        color: 'bg-red-100 text-red-800'
      }
    }

    return {
      status: 'active',
      label: 'Aktif',
      color: 'bg-blue-100 text-blue-800'
    }
  }

  const getStatusOptions = () => [
    { value: '', label: 'Semua Status' },
    { value: 'active', label: 'Aktif' },
    { value: 'overdue', label: 'Terlambat' },
    { value: 'completed', label: 'Dikembalikan' }
  ]

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleStatusFilter = (e) => {
    setStatusFilter(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const getStatCard = (title, value, IconComponent, color) => (
    <div className={`${color} rounded-lg p-4 text-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm opacity-90">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <IconComponent className="text-3xl opacity-80" />
      </div>
    </div>
  )

  const formatDateTime = (dateString) => {
    if (!dateString) return '-'
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // const formatDate = (dateString) => {
  //   if (!dateString) return '-'
  //   return new Date(dateString).toLocaleDateString('id-ID', {
  //     day: '2-digit',
  //     month: '2-digit',
  //     year: 'numeric'
  //   })
  // }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manajemen Peminjaman</h1>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {getStatCard('Total Peminjaman', stats.total, FaBox, 'bg-gray-600')}
          {getStatCard('Aktif', stats.active, FaCalendarAlt, 'bg-blue-600')}
          {getStatCard('Terlambat', stats.overdue, FaCalendarAlt, 'bg-red-600')}
          {getStatCard('Dikembalikan', stats.completed, FaTools, 'bg-green-600')}
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="p-4 border-b border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center gap-4">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Cari berdasarkan user, toolkit, atau tujuan..."
                      value={searchTerm}
                      onChange={handleSearch}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaFilter className="text-gray-400" />
                    </div>
                    <select
                      value={statusFilter}
                      onChange={handleStatusFilter}
                      className="w-full md:w-48 pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {getStatusOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 flex items-center gap-2"
              >
                <FaPlus />
                <span>Tambah Peminjaman</span>
              </button>
            </div>
          </div>

          {/* Loans Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Toolkit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Jumlah
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Pinjam
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tanggal Kembali
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Memuat data...
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : loans.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      Tidak ada data peminjaman
                    </td>
                  </tr>
                ) : (
                  loans.map((loan) => {
                    const user = getUserById(loan.user_id)
                    const toolkit = getToolkitById(loan.toolkit_id)
                    const status = getLoanStatus(loan)

                    return (
                      <tr key={loan.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaUser className="text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {user?.full_name || user?.username || 'Unknown User'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {user?.username || 'Unknown Username'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <FaTools className="text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {toolkit?.name || 'Unknown Toolkit'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {toolkit?.sku || 'Unknown SKU'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {loan.quantity} {toolkit?.unit || 'unit'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(loan.loan_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDateTime(loan.due_date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingLoan(loan)
                                setShowForm(true)
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => setDeleteModal({ show: true, loan })}
                              className="text-red-600 hover:text-red-900"
                              title="Hapus"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Menampilkan <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> hingga{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, totalCount)}
                    </span>{' '}
                    dari <span className="font-medium">{totalCount}</span> hasil
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === page
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                              : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    })}
                    <button
                      onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loan Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingLoan ? 'Edit Peminjaman' : 'Tambah Peminjaman'}
                </h3>
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingLoan(null)
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <LoanForm
                loan={editingLoan}
                onSave={editingLoan ? handleUpdateLoan : handleCreateLoan}
                onCancel={() => {
                  setShowForm(false)
                  setEditingLoan(null)
                }}
              />
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteModal.show && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3 text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                  <FaTrash className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mt-4">
                  Hapus Peminjaman
                </h3>
                <div className="mt-2 px-7 py-3">
                  <p className="text-sm text-gray-500">
                    Apakah Anda yakin ingin menghapus peminjaman ini? Tindakan ini tidak dapat dibatalkan.
                  </p>
                </div>
                <div className="items-center px-4 py-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleDeleteLoan(deleteModal.loan.id)}
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                      Hapus
                    </button>
                    <button
                      onClick={() => setDeleteModal({ show: false, loan: null })}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminLoanManagement