import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'

export default function LogoutButton() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  )
}





