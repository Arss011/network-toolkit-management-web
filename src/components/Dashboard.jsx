import { useState } from 'react'
import UserManagement from './UserManagement'
import CategoryManagement from './CategoryManagement'
import ToolkitManagement from './ToolkitManagement'


function Dashboard({ user, onLogout }) {
  const [activeTab, setActiveTab] = useState('loans')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-lg sm:text-xl font-bold text-gray-800">
                Monitoring Toolkit
              </h1>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <span className="hidden sm:block text-sm sm:text-base text-gray-600">
                Welcome, {user.full_name || user.username}
              </span>
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium"
              >
                Logout
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <span className="block px-3 py-2 text-base font-medium text-gray-600">
                Welcome, {user.full_name || user.username}
              </span>
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        <div className="px-2 sm:px-4 py-4 sm:py-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px overflow-x-auto">
              <div className="flex space-x-2 sm:space-x-8 min-w-max">
                <button
                  onClick={() => setActiveTab('loans')}
                  className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                    activeTab === 'loans'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="hidden sm:inline">Monitoring Peminjaman</span>
                  <span className="sm:hidden">Peminjaman</span>
                </button>

                {user.role === 'admin' && (
                  <>
                    <button
                      onClick={() => setActiveTab('admin-loans')}
                      className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                        activeTab === 'admin-loans'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="hidden sm:inline">Manajemen Peminjaman</span>
                      <span className="sm:hidden">Peminjaman</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('categories')}
                      className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                        activeTab === 'categories'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="hidden sm:inline">Manajemen Kategori</span>
                      <span className="sm:hidden">Kategori</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('toolkits')}
                      className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                        activeTab === 'toolkits'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="hidden sm:inline">Manajemen Toolkit</span>
                      <span className="sm:hidden">Toolkit</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('users')}
                      className={`py-2 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                        activeTab === 'users'
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="hidden sm:inline">Manajemen User</span>
                      <span className="sm:hidden">User</span>
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>

          <div className="mt-4 sm:mt-6">
            {activeTab === 'categories' && user.role === 'admin' && <CategoryManagement />}
            {activeTab === 'toolkits' && user.role === 'admin' && <ToolkitManagement />}
            {activeTab === 'users' && user.role === 'admin' && <UserManagement />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard