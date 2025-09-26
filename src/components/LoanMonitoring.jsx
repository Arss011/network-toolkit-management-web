import { useState, useEffect, useCallback } from 'react'
import { loanService } from '../services/loanService'

function LoanMonitoring() {
  const [loans, setLoans] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [filters] = useState({
    page: 1,
    pageSize: 10
  })

  const fetchLoans = useCallback(async () => {
    setLoading(true)
    try {
      const response = await loanService.getLoans(filters)
      setLoans(response.data || [])
    } catch (err) {
      setError('Failed to fetch loans')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchLoans()
  }, [fetchLoans])

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-yellow-100 text-yellow-800'
      case 'returned':
        return 'bg-green-100 text-green-800'
      case 'overdue':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleReturnLoan = async (loanId) => {
    if (!window.confirm('Apakah Anda yakin ingin mengembalikan toolkit ini?')) {
      return
    }

    setActionLoading(true)
    try {
      await loanService.updateLoanStatus(loanId, {
        status: 'returned',
        return_date: new Date().toISOString()
      })
      fetchLoans() // Refresh loans data
    } catch (err) {
      setError(err.message || 'Failed to return loan')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="bg-white shadow rounded-lg p-4 sm:p-6">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Monitoring Peminjaman Toolkit
        </h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 sm:py-3 rounded mb-3 sm:mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Toolkit
                </th>
                <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                  Jumlah
                </th>
                <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                  Tanggal Pinjam
                </th>
                <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                  Tanggal Kembali
                </th>
                <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden xl:table-cell">
                  Tujuan
                </th>
                <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50">
                  <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                    #{loan.id}
                  </td>
                  <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm font-medium text-gray-900">
                      {loan.user_name || `User ${loan.user_id}`}
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <div className="text-xs sm:text-sm font-medium text-gray-900">
                      {loan.toolkit_name || `Toolkit ${loan.toolkit_id}`}
                    </div>
                  </td>
                  <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden sm:table-cell">
                    {loan.quantity}
                  </td>
                  <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                    {loan.loan_date ? formatDate(loan.loan_date) : '-'}
                  </td>
                  <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900 hidden lg:table-cell">
                    {loan.due_date ? formatDate(loan.due_date) : '-'}
                  </td>
                  <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(loan.status)}`}>
                      {loan.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 hidden xl:table-cell">
                    {loan.purpose || '-'}
                  </td>
                  <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                    {loan.status === 'borrowed' && (
                      <button
                        onClick={() => handleReturnLoan(loan.id)}
                        disabled={actionLoading}
                        className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {actionLoading ? 'Memproses...' : 'Kembalikan'}
                      </button>
                    )}
                    {loan.status === 'returned' && (
                      <span className="text-green-600 text-xs font-medium">
                        Sudah Dikembalikan
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {loans.length === 0 && (
          <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
            Tidak ada data peminjaman
          </div>
        )}
      </div>
    </div>
  )
}

export default LoanMonitoring