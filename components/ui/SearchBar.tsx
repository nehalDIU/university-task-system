'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, X, Clock, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchResult {
  id: string
  title: string
  type: 'task' | 'category' | 'recent'
  description?: string
  category?: string
  dueDate?: string
}

interface SearchBarProps {
  placeholder?: string
  className?: string
  onSearch?: (query: string) => void
  results?: SearchResult[]
}

export function SearchBar({ 
  placeholder = "Search tasks, categories...", 
  className,
  onSearch,
  results = []
}: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)

  // Mock recent searches and suggestions
  const recentSearches = [
    { id: 'recent-1', title: 'Assignment submissions', type: 'recent' as const },
    { id: 'recent-2', title: 'Quiz results', type: 'recent' as const },
    { id: 'recent-3', title: 'Project deadlines', type: 'recent' as const },
  ]

  const quickSuggestions = [
    { id: 'cat-1', title: 'Assignments', type: 'category' as const, description: 'View all assignments' },
    { id: 'cat-2', title: 'Presentations', type: 'category' as const, description: 'Upcoming presentations' },
    { id: 'cat-3', title: 'Lab Reports', type: 'category' as const, description: 'Lab work and reports' },
  ]

  const displayResults = query.length > 0 ? results : [...recentSearches, ...quickSuggestions]

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (inputRef.current && !inputRef.current.contains(event.target as Node) &&
          resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    setSelectedIndex(-1)
    onSearch?.(value)
    setIsOpen(true)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < displayResults.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          handleResultSelect(displayResults[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  const handleResultSelect = (result: SearchResult) => {
    setQuery(result.title)
    setIsOpen(false)
    onSearch?.(result.title)
  }

  const clearSearch = () => {
    setQuery('')
    setIsOpen(false)
    onSearch?.('')
    inputRef.current?.focus()
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case 'recent':
        return <Clock className="w-4 h-4 text-gray-400" />
      case 'category':
        return <FileText className="w-4 h-4 text-blue-500" />
      default:
        return <Search className="w-4 h-4 text-gray-400" />
    }
  }

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            "w-full pl-10 pr-10 py-2.5 text-sm",
            "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
            "rounded-xl shadow-sm",
            "placeholder-gray-500 dark:placeholder-gray-400",
            "text-gray-900 dark:text-white",
            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
            "transition-all duration-200",
            "hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600"
          )}
        />
        
        {query && (
          <button
            onClick={clearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center hover:bg-gray-50 dark:hover:bg-gray-700 rounded-r-xl transition-colors"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && (
        <div
          ref={resultsRef}
          className={cn(
            "absolute top-full left-0 right-0 mt-1 z-50",
            "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
            "rounded-xl shadow-lg backdrop-blur-sm",
            "max-h-80 overflow-y-auto",
            "animate-fade-in"
          )}
        >
          {displayResults.length > 0 ? (
            <div className="p-2">
              {query.length === 0 && (
                <>
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Recent Searches
                  </div>
                  {recentSearches.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => handleResultSelect(item)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                        selectedIndex === index
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700"
                      )}
                    >
                      {getResultIcon(item.type)}
                      <span className="text-sm text-gray-700 dark:text-gray-300">{item.title}</span>
                    </button>
                  ))}
                  
                  <div className="px-3 py-2 mt-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-t border-gray-100 dark:border-gray-700">
                    Quick Access
                  </div>
                  {quickSuggestions.map((item, index) => (
                    <button
                      key={item.id}
                      onClick={() => handleResultSelect(item)}
                      className={cn(
                        "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                        selectedIndex === recentSearches.length + index
                          ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                          : "hover:bg-gray-50 dark:hover:bg-gray-700"
                      )}
                    >
                      {getResultIcon(item.type)}
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{item.title}</div>
                        {item.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">{item.description}</div>
                        )}
                      </div>
                    </button>
                  ))}
                </>
              )}
              
              {query.length > 0 && results.length === 0 && (
                <div className="px-3 py-8 text-center">
                  <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    No results found for "{query}"
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    Try adjusting your search terms
                  </p>
                </div>
              )}
              
              {query.length > 0 && results.map((result, index) => (
                <button
                  key={result.id}
                  onClick={() => handleResultSelect(result)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors",
                    selectedIndex === index
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                >
                  {getResultIcon(result.type)}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {result.title}
                    </div>
                    {result.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {result.description}
                      </div>
                    )}
                    {result.category && (
                      <div className="text-xs text-blue-600 dark:text-blue-400">
                        {result.category}
                      </div>
                    )}
                  </div>
                  {result.dueDate && (
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {result.dueDate}
                    </div>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="px-3 py-8 text-center">
              <Search className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Start typing to search...
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
