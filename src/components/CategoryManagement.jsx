import { useState, useEffect } from 'react'
import { categoryService } from '../services/categoryService'
import CategoryForm from './CategoryForm'

function CategoryManagement() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await categoryService.getCategories()
      setCategories(response.data || [])
    } catch (err) {
      setError('Failed to fetch categories')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }


  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchCategories()
      return
    }

    setLoading(true)
    try {
      const response = await categoryService.getCategories({
        search_term: searchTerm
      })
      setCategories(response.data || [])
    } catch (err) {
      setError('Failed to search categories')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setEditingCategory(null)
    setShowForm(true)
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  const handleSave = async (categoryData) => {
    setActionLoading(true)
    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, categoryData)
      } else {
        await categoryService.createCategory(categoryData)
      }
      setShowForm(false)
      setEditingCategory(null)
      fetchCategories()
    } catch (err) {
      setError(err.message || 'Failed to save category')
    } finally {
      setActionLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kategori ini?')) {
      return
    }

    setActionLoading(true)
    try {
      await categoryService.deleteCategory(id)
      fetchCategories()
    } catch (err) {
      setError(err.message || 'Failed to delete category')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingCategory(null)
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
      {showForm ? (
        <CategoryForm
          category={editingCategory}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      ) : (
        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900">
              Manajemen Kategori
            </h2>
            <button
              onClick={handleCreate}
              disabled={actionLoading}
              className="bg-green-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              + Tambah Kategori
            </button>
          </div>

          <div className="mb-4 flex gap-3">
            <input
              type="text"
              placeholder="Cari kategori..."
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button
              onClick={handleSearch}
              className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
            >
              Cari
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-3 sm:px-4 py-2 sm:py-3 rounded mb-3 sm:mb-4 text-sm">
              {error}
            </div>
          )}

          {categories.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                      Deskripsi
                    </th>
                    <th className="px-2 sm:px-3 md:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        #{category.id}
                      </td>
                      <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4">
                        <div className="text-xs sm:text-sm font-medium text-gray-900">
                          {category.name}
                        </div>
                      </td>
                      <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4 text-xs sm:text-sm text-gray-900 hidden md:table-cell">
                        {category.description || '-'}
                      </td>
                      <td className="px-2 sm:px-3 md:px-6 py-2 sm:py-4 whitespace-nowrap text-xs sm:text-sm">
                        <div className="flex gap-1 sm:gap-2">
                          <button
                            onClick={() => handleEdit(category)}
                            disabled={actionLoading}
                            className="text-blue-600 hover:text-blue-800 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(category.id)}
                            disabled={actionLoading}
                            className="text-red-600 hover:text-red-800 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Hapus"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-6 sm:py-8 text-gray-500 text-sm sm:text-base">
              Tidak ada data kategori
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default CategoryManagement