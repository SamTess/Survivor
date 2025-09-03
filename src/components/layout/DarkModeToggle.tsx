import React, {useState, useEffect} from 'react'
import { FaSun, FaMoon } from 'react-icons/fa'

const DarkModeToggle = () => {

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const localDarkMode = localStorage.getItem('darkMode')
      return localDarkMode === 'true'
    }
    return false
  })

  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('darkMode', darkMode.toString());
    }
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [darkMode])

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

  return (
    <button onClick={toggleDarkMode} className="rounded-full smooth-hover">
      {isClient && (darkMode ? <FaSun className="text-xl" />
                : <FaMoon className="text-md" />)}
    </button>
  )
}

export default DarkModeToggle