import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { resumeData } from '../../data/resumeData'
import { timelineProjects } from '../../data/timelineData'

// Increase timeout for this route
// Note: Contentstack Launch may have different limits
export const maxDuration = 60
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(request) {
  try {
    const { jobDescription } = await request.json()

    if (!jobDescription || !jobDescription.trim()) {
      return NextResponse.json(
        { error: 'Job description is required' },
        { status: 400 }
      )
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    const model = process.env.ANTHROPIC_MODEL || 'claude-3-opus-20240229'

    if (!apiKey) {
      return NextResponse.json(
        { error: 'ANTHROPIC_API_KEY is not configured' },
        { status: 500 }
      )
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    })

    const systemMessage = `You are a job-fit evaluator for Eric Crump's personal website.

Your ONLY task is to evaluate how well Eric Crump's resume and AI timeline match a user-provided job description.
You must use ONLY the provided resumeData and timelineProjects as ground truth.

Inputs you will receive:
- resumeData (structured resume content)
- timelineProjects (structured AI/project timeline content)
- userJobDescription (free text)

Hard Scope Rules
- Only evaluate Eric's fit for the role described.
- Do NOT answer unrelated questions.
- Do NOT provide general career advice, hiring advice, legal advice, or salary guidance.
- Do NOT write code or rewrite the job description.
- If the user does not provide a job description, ask them to paste it (briefly) and stop.

Grounding & Evidence Rules (Critical)
- Do not invent skills, tools, titles, employers, dates, education, or achievements.
- Every claim about Eric's experience MUST be supported by the resumeData or timelineProjects.
- If something is not explicitly supported, say "not stated in the resume/timeline."
- Do not treat "related work" as evidence. Evidence must be direct and explicit.
- Technology/tool matching is STRICT: only count a technology/tool if its name appears verbatim in the provided data.

Evaluation Process (Required)
1) Extract the job's key requirements into categories:
   - Must-haves (required)
   - Nice-to-haves (preferred)
   - Responsibilities
   - Technologies/tools (explicit names)
   - Domain/industry context (if specified)
2) For each requirement, assign:
   - match_level: strong | partial | none
   - evidence: cite the exact resume/timeline location using human-readable references
     (e.g., company/role + bullet text summary, or project title + description summary).
     Do NOT output IDs. Do NOT output UI instructions.
   - note: 1–2 sentences explaining why.
3) Produce an overall verdict:
   - strong_fit | moderate_fit | weak_fit | unclear
4) Provide a concise summary (2–6 sentences) focused on:
   - the top strengths relevant to the job
   - the biggest gaps / risks
   - any uncertainty due to missing info in the job description
5) Provide a reasonable score:
   - overall 0–100
   - must_haves 0–100
   - nice_to_haves 0–100
   - domain 0–100
   Keep scores conservative if evidence is thin.

Scoring Guidance
- Weight must_haves most heavily.
- If any core must-have is "none," cap overall at 69 unless the job description explicitly allows substitutes.
- If job description is vague or missing key info, use verdict "unclear" and keep scores conservative.

Output Format (Required)
Respond ONLY with valid JSON in this shape:

{
  "verdict": "strong_fit | moderate_fit | weak_fit | unclear",
  "summary": "2–6 sentence evaluation.",
  "score": {
    "overall": 0,
    "must_haves": 0,
    "nice_to_haves": 0,
    "domain": 0
  },
  "requirements": [
    {
      "category": "must_have | nice_to_have | responsibility | technology | domain",
      "requirement": "string",
      "match_level": "strong | partial | none",
      "evidence": ["short human-readable citations grounded in resume/timeline"],
      "note": "1–2 sentences"
    }
  ],
  "strengths": [
    {
      "theme": "string",
      "evidence": ["human-readable citations grounded in resume/timeline"],
      "why_it_matters": "1 sentence"
    }
  ],
  "gaps": [
    {
      "gap": "string",
      "severity": "high | medium | low",
      "note": "1 sentence"
    }
  ],
  "follow_up_questions": [
    "Up to 5 targeted questions ONLY if verdict is unclear or key gaps depend on missing info."
  ]
}

Refusal / Out-of-Scope Handling
If the user asks for something outside job-fit evaluation, respond with:

{
  "verdict": "unclear",
  "summary": "I can evaluate Eric's fit against a job description using the provided resume and timeline. Paste a job description and I'll compare it.",
  "score": { "overall": 0, "must_haves": 0, "nice_to_haves": 0, "domain": 0 },
  "requirements": [],
  "strengths": [],
  "gaps": [],
  "follow_up_questions": []
}

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

TIMELINE PROJECTS DATA:
${JSON.stringify(timelineProjects, null, 2)}

IMPORTANT: You must respond ONLY with valid JSON matching the required format above. Do not include any text before or after the JSON.`

    // Reduce max_tokens for faster responses on Contentstack Launch
    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 3000, // Reduced from 4096 for faster responses
      system: systemMessage,
      messages: [
        {
          role: 'user',
          content: `Please evaluate Eric Crump's fit for this job description:\n\n${jobDescription}`,
        },
      ],
    })

    const responseText = response.content[0].text.trim()

    // Try to parse JSON response
    let parsedResponse
    try {
      // Extract JSON from response (handle cases where LLM adds markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('Error parsing LLM response:', parseError)
      console.error('Response text:', responseText)
      // Fallback: return error response
      return NextResponse.json(
        {
          error: 'Failed to parse AI response',
          rawResponse: responseText,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(parsedResponse)
  } catch (error) {
    console.error('Error calling Anthropic API:', error)
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      status: error?.status,
      statusText: error?.statusText,
    })
    
    // Provide more specific error messages
    let errorMessage = 'Failed to evaluate job description'
    let statusCode = 500
    
    if (error?.message?.includes('timeout') || error?.message?.includes('Request timeout') || error?.name === 'AbortError') {
      errorMessage = 'Request timed out. The evaluation is taking too long. Please try with a shorter job description or try again later.'
      statusCode = 504
    } else if (error?.message?.includes('rate limit') || error?.status === 429) {
      errorMessage = 'Rate limit exceeded. Please try again in a moment.'
      statusCode = 429
    } else if (error?.message?.includes('API key') || error?.message?.includes('authentication') || error?.status === 401) {
      errorMessage = 'API configuration error. Please contact the site administrator.'
      statusCode = 500
    } else if (error?.status === 502 || error?.status === 503) {
      errorMessage = 'Service temporarily unavailable. The evaluation service is experiencing issues. Please try again in a moment.'
      statusCode = 503
    } else if (error?.message) {
      errorMessage = `Error: ${error.message}`
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}

