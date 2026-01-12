'use client'

import { useState } from 'react'

export default function JobDescription() {
  const [jobDescription, setJobDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleEvaluate = async () => {
    if (!jobDescription.trim()) {
      setError('Please paste a job description first')
      return
    }

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/job-evaluation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: jobDescription.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to evaluate job description')
      }

      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }

      setResult(data)
    } catch (err) {
      console.error('Error evaluating job description:', err)
      setError(err.message || 'Failed to evaluate job description. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const getVerdictColor = (verdict) => {
    switch (verdict) {
      case 'strong_fit':
        return 'bg-green-100 text-green-800 border-green-300'
      case 'moderate_fit':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'weak_fit':
        return 'bg-red-100 text-red-800 border-red-300'
      case 'unclear':
        return 'bg-gray-100 text-gray-800 border-gray-300'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getVerdictLabel = (verdict) => {
    switch (verdict) {
      case 'strong_fit':
        return 'Strong Fit'
      case 'moderate_fit':
        return 'Moderate Fit'
      case 'weak_fit':
        return 'Weak Fit'
      case 'unclear':
        return 'Unclear'
      default:
        return verdict
    }
  }

  const getMatchLevelColor = (level) => {
    switch (level) {
      case 'strong':
        return 'text-green-700 bg-green-50'
      case 'partial':
        return 'text-yellow-700 bg-yellow-50'
      case 'none':
        return 'text-red-700 bg-red-50'
      default:
        return 'text-gray-700 bg-gray-50'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-8 max-w-4xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Job Description Evaluation</h2>
      
      {/* Input Section */}
      <div className="mb-6">
        <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 mb-2">
          Paste Job Description
        </label>
        <textarea
          id="job-description"
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste the job description here..."
          className="w-full h-64 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
          disabled={isLoading}
        />
        <button
          onClick={handleEvaluate}
          disabled={isLoading || !jobDescription.trim()}
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {isLoading ? 'Evaluating...' : 'Evaluate Fit'}
        </button>
      </div>

      {/* Loading Dialog */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Evaluating Job Fit</h3>
              <p className="text-sm text-gray-600 text-center">
                Analyzing the job description against Eric's resume and experience...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      {/* Results Section */}
      {result && (
        <div className="space-y-6">
          {/* Verdict */}
          <div className={`p-6 rounded-lg border-2 ${getVerdictColor(result.verdict)}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xl font-bold">Verdict: {getVerdictLabel(result.verdict)}</h3>
              {result.score && (
                <div className="text-2xl font-bold">{result.score.overall}/100</div>
              )}
            </div>
            <p className="text-sm mt-2">{result.summary}</p>
          </div>

          {/* Scores */}
          {result.score && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Overall</div>
                <div className="text-2xl font-bold text-gray-900">{result.score.overall}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Must Haves</div>
                <div className="text-2xl font-bold text-gray-900">{result.score.must_haves}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Nice to Haves</div>
                <div className="text-2xl font-bold text-gray-900">{result.score.nice_to_haves}</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Domain</div>
                <div className="text-2xl font-bold text-gray-900">{result.score.domain}</div>
              </div>
            </div>
          )}

          {/* Requirements */}
          {result.requirements && result.requirements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements Analysis</h3>
              <div className="space-y-3">
                {result.requirements.map((req, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <span className="text-xs font-medium text-gray-500 uppercase mr-2">
                          {req.category}
                        </span>
                        <span className="font-medium text-gray-900">{req.requirement}</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getMatchLevelColor(req.match_level)}`}>
                        {req.match_level}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{req.note}</p>
                    {req.evidence && req.evidence.length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        <div className="font-medium mb-1">Evidence:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {req.evidence.map((evidence, idx) => (
                            <li key={idx}>{evidence}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Strengths */}
          {result.strengths && result.strengths.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Strengths</h3>
              <div className="space-y-2">
                {result.strengths.map((strength, index) => (
                  <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="font-medium text-green-900 mb-1">{strength.theme}</div>
                    <p className="text-sm text-green-700 mb-2">{strength.why_it_matters}</p>
                    {strength.evidence && strength.evidence.length > 0 && (
                      <div className="text-xs text-green-600">
                        <div className="font-medium mb-1">Evidence:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {strength.evidence.map((evidence, idx) => (
                            <li key={idx}>{evidence}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gaps */}
          {result.gaps && result.gaps.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Gaps</h3>
              <div className="space-y-2">
                {result.gaps.map((gap, index) => (
                  <div key={index} className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-1">
                      <div className="font-medium text-red-900">{gap.gap}</div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        gap.severity === 'high' ? 'bg-red-200 text-red-800' :
                        gap.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-gray-200 text-gray-800'
                      }`}>
                        {gap.severity}
                      </span>
                    </div>
                    <p className="text-sm text-red-700">{gap.note}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Follow-up Questions */}
          {result.follow_up_questions && result.follow_up_questions.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Follow-up Questions</h3>
              <ul className="list-disc list-inside space-y-1 text-gray-700">
                {result.follow_up_questions.map((question, index) => (
                  <li key={index}>{question}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

