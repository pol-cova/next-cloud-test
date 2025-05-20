'use client'

import { useRouter } from 'next/navigation'
import { clearAuthCookie } from '../utils/auth'
import { FileUploadDemo } from '@/components/file-form'

export default function FototecaPage() {
  const router = useRouter()

  const handleLogout = () => {
    clearAuthCookie()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Fototeca</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Salir
          </button>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <FileUploadDemo />
        </div>
      </div>
    </div>
  )
} 