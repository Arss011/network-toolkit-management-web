import { useState, useEffect } from 'react'
import { loanService } from '../services/loanService'
import { userService } from '../services/userService'
import { toolkitService } from '../services/toolkitService'

function LoanForm({ loan = null, onSave, onCancel }) {
  const [formData, setFormData] = useState({
    user_id: loan?.user_id || '',
    toolkit_id: loan?.toolkit_id || '',
    quantity: loan?.quantity || 1,
    loan_date: loan?.borrow_date ? new Date(loan.borrow_date).toISOString().slice(0, 16) : '',
    due_date: loan?.due_date ? new Date(loan.due_date).toISOString().slice(0, 16) : '',
    purpose: loan?.purpose || '',
    notes: loan?.notes || ''
  })

  const [users, setUsers] = useState([])
  const [toolkits, setToolkits] = useState([])
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [loadingOptions, setLoadingOptions] = useState(true)

  useEffect(() => {
    fetchOptions()
  }, [])

  useEffect(() => {
    if (loan) {
      setFormData({
        user_id: loan.user_id || '',
        toolkit_id: loan.toolkit_id || '',
        quantity: loan.quantity || 1,
        loan_date: loan.borrow_date ? new Date(loan.borrow_date).toISOString().slice(0, 16) : '',
        due_date: loan.due_date ? new Date(loan.due_date).toISOString().slice(0, 16) : '',
        purpose: loan.purpose || '',
        notes: loan.notes || ''
      })
    }
  }, [loan])

  const fetchOptions = async () => {
    try {
      const [usersResponse, toolkitsResponse] = await Promise.all([
        userService.getUsers({ page_size: 1000, is_active: true }),
        toolkitService.getToolkits({ page_size: 1000 })
      ])

      setUsers(usersResponse.data || [])
      setToolkits(toolkitsResponse.data || [])
    } catch (error) {
      console.error('Failed to fetch options:', error)
    } finally {
      setLoadingOptions(false)
    }
  }

  const validateForm = async () => {
    const newErrors = {}

    if (!formData.user_id) {
      newErrors.user_id = 'User wajib dipilih'
    }

    if (!formData.toolkit_id) {
      newErrors.toolkit_id = 'Toolkit wajib dipilih'
    }

    if (!formData.quantity || formData.quantity < 1) {
      newErrors.quantity = 'Jumlah minimal 1'
    } else if (formData.quantity > 999) {
      newErrors.quantity = 'Jumlah maksimal 999'
    } else if (formData.toolkit_id) {
      // Real-time quantity check
      const availableQuantity = getAvailableQuantity(formData.toolkit_id)
      if (formData.quantity > availableQuantity) {
        newErrors.quantity = `Jumlah melebihi stok yang tersedia. Tersedia: ${availableQuantity}`
      }
    }


    if (!formData.loan_date) {
      newErrors.loan_date = 'Tanggal pinjam wajib diisi'
    }

    if (!formData.due_date) {
      newErrors.due_date = 'Tanggal kembali wajib diisi'
    } else if (formData.loan_date && formData.due_date) {
      const loanDate = new Date(formData.loan_date)
      const dueDate = new Date(formData.due_date)
      if (dueDate <= loanDate) {
        newErrors.due_date = 'Tanggal kembali harus setelah tanggal pinjam'
      }
    }

    if (formData.purpose && formData.purpose.length > 200) {
      newErrors.purpose = 'Tujuan maksimal 200 karakter'
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Catatan maksimal 500 karakter'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData(prev => ({
      ...prev,
      [name]: name === 'user_id' || name === 'toolkit_id' || name === 'quantity'
        ? parseInt(value) || ''
        : value
    }))

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const isValid = await validateForm()
    if (!isValid) {
      return
    }

    setLoading(true)
    try {
      // Final availability check before submission
      console.log('SUBMIT - Final availability check - toolkit_id:', formData.toolkit_id, 'quantity:', formData.quantity)
      const isAvailable = await checkToolkitAvailability(formData.toolkit_id, formData.quantity)
      console.log('SUBMIT - Final availability result:', isAvailable)

      if (!isAvailable) {
        const availableQuantity = getAvailableQuantity(formData.toolkit_id)
        console.log('SUBMIT - Setting error - Available from cache:', availableQuantity, 'Requested:', formData.quantity)
        setErrors(prev => ({
          ...prev,
          quantity: `Stok tersedia tidak mencukupi. Tersedia: ${availableQuantity}, Diminta: ${formData.quantity}`
        }))
        return
      }

      const submitData = {
        user_id: parseInt(formData.user_id),
        toolkit_id: parseInt(formData.toolkit_id),
        quantity: parseInt(formData.quantity),
        purpose: formData.purpose || '',
        borrow_date: new Date(formData.loan_date).toISOString(),
        due_date: new Date(formData.due_date).toISOString(),
        notes: formData.notes || '',
        status: 'borrowed'
      }

      await onSave(submitData)
    } catch (error) {
      console.error('Form submission error:', error)
      if (error.message.includes('insufficient')) {
        setErrors(prev => ({
          ...prev,
          quantity: 'Stok tidak mencukupi untuk peminjaman ini'
        }))
      } else if (error.message.includes('not found')) {
        setErrors(prev => ({
          ...prev,
          toolkit_id: 'Toolkit tidak ditemukan'
        }))
      }
    } finally {
      setLoading(false)
    }
  }

  const getAvailableQuantity = (toolkitId) => {
    const toolkit = toolkits.find(t => t.id === toolkitId)
    return toolkit ? (toolkit.available || 0) : 0
  }

  const checkToolkitAvailability = async (toolkitId, quantity) => {
    if (!toolkitId) return false

    try {
      console.log('API CALL - Checking availability for toolkit:', toolkitId, 'quantity:', quantity)
      const toolkit = await toolkitService.getToolkitById(toolkitId)
      console.log('API RESPONSE - Toolkit data:', JSON.stringify(toolkit, null, 2))
      const availableQuantity = toolkit?.data?.available || 0
      console.log('API RESPONSE - Available quantity:', availableQuantity, 'Requested:', quantity)
      const isAvailable = availableQuantity >= quantity
      console.log('API RESPONSE - Is available:', isAvailable)
      return isAvailable
    } catch (error) {
      console.error('Failed to check toolkit availability:', error)
      return false
    }
  }

  return (
    <div className="bg-white shadow rounded-lg p-4 sm:p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {loan ? 'Edit Peminjaman' : 'Tambah Peminjaman'}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="user_id" className="block text-sm font-medium text-gray-700 mb-1">
              User *
            </label>
            {loadingOptions ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-500">
                Memuat users...
              </div>
            ) : (
              <select
                id="user_id"
                name="user_id"
                value={formData.user_id}
                onChange={handleChange}
                disabled={!!loan}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.user_id ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                } ${loan ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">Pilih user</option>
                {users
                  .filter(user => user.is_active !== false)
                  .map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.full_name || user.username} ({user.username})
                    </option>
                  ))}
              </select>
            )}
            {errors.user_id && (
              <p className="mt-1 text-xs text-red-600">{errors.user_id}</p>
            )}
            {loan && (
              <p className="mt-1 text-xs text-gray-500">User tidak dapat diubah</p>
            )}
          </div>

          <div>
            <label htmlFor="toolkit_id" className="block text-sm font-medium text-gray-700 mb-1">
              Toolkit *
            </label>
            {loadingOptions ? (
              <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-500">
                Memuat toolkits...
              </div>
            ) : (
              <select
                id="toolkit_id"
                name="toolkit_id"
                value={formData.toolkit_id}
                onChange={handleChange}
                disabled={!!loan}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.toolkit_id ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
                } ${loan ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              >
                <option value="">Pilih toolkit</option>
                {toolkits
                  .filter(toolkit => toolkit.quantity > 0)
                  .map((toolkit) => (
                    <option key={toolkit.id} value={toolkit.id}>
                      {toolkit.name} (Stok: {toolkit.quantity})
                    </option>
                  ))}
              </select>
            )}
            {errors.toolkit_id && (
              <p className="mt-1 text-xs text-red-600">{errors.toolkit_id}</p>
            )}
            {loan && (
              <p className="mt-1 text-xs text-gray-500">Toolkit tidak dapat diubah</p>
            )}
          </div>

          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
              Jumlah *
            </label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              min="1"
              max={loan ? '' : getAvailableQuantity(formData.toolkit_id)}
              disabled={!!loan}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.quantity ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              } ${loan ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              placeholder="Masukkan jumlah"
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-red-600">{errors.quantity}</p>
            )}
            {!loan && formData.toolkit_id && (
              <div className="mt-1 text-xs text-gray-500">
                <p>Total Stok: {toolkits.find(t => t.id === formData.toolkit_id)?.quantity || 0}</p>
                <p>Tersedia: {getAvailableQuantity(formData.toolkit_id)}</p>
              </div>
            )}
            {loan && (
              <p className="mt-1 text-xs text-gray-500">Jumlah tidak dapat diubah</p>
            )}
          </div>

          
          <div>
            <label htmlFor="loan_date" className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Pinjam *
            </label>
            <input
              type="datetime-local"
              id="loan_date"
              name="loan_date"
              value={formData.loan_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.loan_date ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {errors.loan_date && (
              <p className="mt-1 text-xs text-red-600">{errors.loan_date}</p>
            )}
          </div>

          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-1">
              Tanggal Kembali *
            </label>
            <input
              type="datetime-local"
              id="due_date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.due_date ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {errors.due_date && (
              <p className="mt-1 text-xs text-red-600">{errors.due_date}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="purpose" className="block text-sm font-medium text-gray-700 mb-1">
            Tujuan Peminjaman
          </label>
          <textarea
            id="purpose"
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            rows="2"
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.purpose ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="Masukkan tujuan peminjaman (opsional)"
          />
          {errors.purpose && (
            <p className="mt-1 text-xs text-red-600">{errors.purpose}</p>
          )}
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
            Catatan
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="2"
            className={`w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.notes ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'
            }`}
            placeholder="Masukkan catatan tambahan (opsional)"
          />
          {errors.notes && (
            <p className="mt-1 text-xs text-red-600">{errors.notes}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menyimpan...
              </span>
            ) : (
              loan ? 'Update' : 'Simpan'
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}

export default LoanForm