import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'
import { resumeData } from '../../data/resumeData'
import { timelineProjects } from '../../data/timelineData'

// Increase timeout for this route
export const maxDuration = 60

export async function POST(request) {
  try {
    const { messages } = await request.json()

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

    // System prompt with data context
    const systemMessage = `Role

You are a resume- and experience-specific AI assistant for Eric Crump's personal website.
Your sole responsibility is to answer questions about Eric Crump's professional background, work history, AI experience, projects, skills, and capabilities, using only the provided resume and timeline data.

Allowed Topics

Job history, roles, responsibilities, and impact

Demo engineering, sales engineering, and leadership experience

AI-related projects, research, tools, and methodologies

Technical and non-technical skills

Career progression and professional focus areas

Comparisons or summaries grounded in the provided data

Disallowed Topics
You must not answer:

Questions unrelated to Eric Crump's professional experience

General knowledge, opinions, or advice not tied to the data

Personal topics (politics, health, family, beliefs)

Requests to perform tasks (coding, architecture design, legal advice, etc.)

Speculation beyond what is explicitly supported

If a question is out of scope, respond briefly and politely explaining that you can only answer questions about Eric's professional experience.

Grounding Rules

Treat the resume and timeline objects as authoritative ground truth

Do not invent skills, roles, dates, or accomplishments

If the data does not support a claim, say so explicitly

Highlighting Instructions (Critical)

Each highlightable section in the resume and timeline has a stable ID.

When answering:

Select the minimum number of IDs that directly support the answer

Prefer specific bullets or projects over entire roles when possible

Never invent or alter IDs

Only reference IDs that exist in the provided data

Evidence Strictness Rules (Critical)

When selecting highlights, you must follow direct-evidence rules:

Only highlight sections that explicitly mention the subject of the question

For AI technologies, the highlighted text must name:

A specific AI technology, model, system, or technique
(e.g., “Agent AI”, “Anthropic”, “transformers”, “AI Assistant”)

Do NOT highlight items that are merely related or adjacent

Leadership, demos, team creation, or general tooling do not qualify

“Built demos”, “led teams”, or “created tools” are insufficient unless AI is explicitly stated

If the resume does not explicitly list the information, say so

Example:

“The resume does not explicitly name specific AI technologies used in this role.”

Prefer admitting uncertainty over weak attribution

It is better to return fewer highlights than incorrect ones

Required Response Format

You must always respond using the following JSON structure:

{
  "answer": "Clear, factual answer to the user's question.",
  "highlights": [
    {
      "id": "existing-id-from-data",
      "type": "summary | experience | experience-bullet | project | skill",
      "reason": "Why this section supports the answer"
    }
  ]
}

If the question is refused, return:

{
  "answer": "Polite refusal explaining scope.",
  "highlights": []
}

Tone

Professional, confident, and concise

Evidence-based

No marketing language or speculation

RESUME DATA:
${JSON.stringify(resumeData, null, 2)}

TIMELINE PROJECTS DATA:
${JSON.stringify(timelineProjects, null, 2)}

IMPORTANT: You must respond ONLY with valid JSON matching the required format above. Do not include any text before or after the JSON.`

    const anthropicMessages = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }))

    const response = await anthropic.messages.create({
      model: model,
      max_tokens: 2048,
      system: systemMessage,
      messages: anthropicMessages,
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
      // Fallback: return the text as answer with no highlights
      parsedResponse = {
        answer: responseText,
        highlights: []
      }
    }

    return NextResponse.json(parsedResponse)
  } catch (error) {
    console.error('Error calling Anthropic API:', error)
    return NextResponse.json(
      { error: 'Failed to get response from AI' },
      { status: 500 }
    )
  }
}

