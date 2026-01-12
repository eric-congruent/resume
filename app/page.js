'use client'

import { useState, useRef, useEffect } from 'react'
import Timeline from './components/Timeline'
import Resume from './components/Resume'
import AIChat from './components/AIChat'
import JobDescription from './components/JobDescription'
import PasswordProtection from './components/PasswordProtection'

export default function Home() {
  const [activeTab, setActiveTab] = useState('timeline')
  const [showChat, setShowChat] = useState(false)
  const [initialQuestion, setInitialQuestion] = useState('')
  const highlightedElementsRef = useRef(new Set())
  const [highlightCounts, setHighlightCounts] = useState({ timeline: 0, resume: 0 })
  const [highlightedIds, setHighlightedIds] = useState([])

  const handleQuestionSubmit = (question) => {
    console.log('handleQuestionSubmit called with:', question)
    setInitialQuestion(question)
    setShowChat(true)
    console.log('showChat set to true')
  }

  // Function to determine which tab an ID belongs to
  const getTabForId = (id) => {
    if (!id) return null
    
    // Timeline IDs: proj-*, tech-*, resume-app-*
    // Note: resume-app-* is a timeline project, not resume
    if (id.startsWith('proj-') || id.startsWith('tech-') || 
        id === 'resume-app-2026') {
      return 'timeline'
    }
    
    // Resume IDs: resume-root (only), summary, exp-*, cs-*, kore-*, genesys-*, raytheon-*, demandbase-*, edu-*, skill-*
    // Note: resume-app-* is handled above as timeline
    if (id === 'resume-root' || id.startsWith('summary') || 
        id.startsWith('exp-') || id.startsWith('cs-') || id.startsWith('kore-') ||
        id.startsWith('genesys-') || id.startsWith('raytheon-') || 
        id.startsWith('demandbase-') || id.startsWith('edu-') || 
        id.startsWith('skill-')) {
      return 'resume'
    }
    
    return null
  }

  // Function to clear all highlights
  const clearHighlights = () => {
    highlightedElementsRef.current.forEach((element) => {
      element.classList.remove('highlight-element')
    })
    highlightedElementsRef.current.clear()
    setHighlightedIds([])
    setHighlightCounts({ timeline: 0, resume: 0 })
  }

  // Function to apply highlights to elements by ID
  const applyHighlights = (ids) => {
    ids.forEach((id) => {
      const element = document.getElementById(id)
      if (element) {
        element.classList.add('highlight-element')
        highlightedElementsRef.current.add(element)
      }
    })
  }

  // Re-apply highlights when tab changes or component mounts
  useEffect(() => {
    if (highlightedIds.length > 0) {
      // Small delay to ensure DOM is ready after tab switch
      const timer = setTimeout(() => {
        // Clear current highlights first
        highlightedElementsRef.current.forEach((element) => {
          element.classList.remove('highlight-element')
        })
        highlightedElementsRef.current.clear()
        // Re-apply highlights
        applyHighlights(highlightedIds)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [activeTab, highlightedIds])

  // Function to scroll to and highlight elements
  const highlightElements = (highlights) => {
    if (!highlights || highlights.length === 0) return

    // Clear previous highlights
    highlightedElementsRef.current.forEach((element) => {
      element.classList.remove('highlight-element')
    })
    highlightedElementsRef.current.clear()

    // Extract IDs and store them as array
    const ids = []
    highlights.forEach((highlight) => {
      if (highlight.id && !ids.includes(highlight.id)) {
        ids.push(highlight.id)
      }
    })
    setHighlightedIds(ids)

    // Count highlights per tab
    const counts = { timeline: 0, resume: 0 }

    // Process each highlight
    highlights.forEach((highlight) => {
      const { id } = highlight
      if (!id) return

      // Determine which tab this belongs to
      const targetTab = getTabForId(id)
      if (targetTab) {
        counts[targetTab]++
      }
      
      // Switch to the correct tab if needed
      if (targetTab && targetTab !== activeTab) {
        setActiveTab(targetTab)
        // Wait for tab switch before scrolling
        setTimeout(() => {
          scrollToAndHighlight(id)
        }, 100)
      } else {
        scrollToAndHighlight(id)
      }
    })

    // Update highlight counts
    setHighlightCounts(counts)

    // Apply highlights after a short delay to ensure DOM is ready
    setTimeout(() => {
      applyHighlights(ids)
    }, 100)
  }

  // Function to scroll to and highlight a single element
  const scrollToAndHighlight = (id) => {
    const element = document.getElementById(id)
    if (!element) {
      console.warn(`Element with id "${id}" not found`)
      return
    }

    // Scroll to element
    element.scrollIntoView({ behavior: 'smooth', block: 'center' })

    // Add highlight class (persistent, no timeout)
    element.classList.add('highlight-element')
    highlightedElementsRef.current.add(element)
  }

  return (
    <PasswordProtection>
      <div className="min-h-screen bg-gray-50">
      {/* Main Content Area */}
      <div className={`transition-all duration-300 ${showChat ? 'mr-0 md:mr-96' : ''}`}>
        {/* AI Question Input */}
        {!showChat && (
          <div className="sticky top-0 z-50 w-full bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-4xl mx-auto px-4 py-6">
              <AIChat.Input onQuestionSubmit={handleQuestionSubmit} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Tabs */}
          <div className={`sticky ${!showChat ? 'top-[88px]' : 'top-0'} bg-gray-50 z-40 mb-8 border-b border-gray-200 pt-4 pb-2`}>
            <div className="flex items-center justify-between">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'timeline'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>AI Experience Timeline</span>
                  {highlightCounts.timeline > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      {highlightCounts.timeline}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('resume')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'resume'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>Resume</span>
                  {highlightCounts.resume > 0 && (
                    <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                      {highlightCounts.resume}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('job-description')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === 'job-description'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>Job Description</span>
                </button>
              </nav>
              {(highlightCounts.timeline > 0 || highlightCounts.resume > 0) && (
                <button
                  onClick={clearHighlights}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1 px-3 py-1 rounded-md hover:bg-gray-100 transition-colors"
                  title="Clear all highlights"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Clear Highlights
                </button>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className="mt-8">
            {activeTab === 'timeline' && <Timeline />}
            {activeTab === 'resume' && <Resume />}
            {activeTab === 'job-description' && (
              <JobDescription />
            )}
          </div>
        </div>
      </div>

      {/* Chat Window */}
      {showChat && (
        <AIChat.Window 
          onClose={() => {
            setShowChat(false)
            setInitialQuestion('')
            // Don't clear highlights when closing - user can use reset button
          }}
          initialQuestion={initialQuestion}
          onHighlights={highlightElements}
        />
      )}
    </div>
    </PasswordProtection>
  )
}

