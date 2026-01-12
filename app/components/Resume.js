'use client'

import { resumeData } from '../data/resumeData'

export default function Resume() {

  return (
    <div id={resumeData.id} className="bg-white rounded-lg shadow-md p-8 max-w-4xl">
      {/* Header */}
      <div className="text-center mb-8 pb-8 border-b border-gray-200">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">{resumeData.name}</h1>
        <p className="text-xl text-gray-600 mb-4">{resumeData.title}</p>
        <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-600">
          <span>{resumeData.contact.address}</span>
          <span>•</span>
          <span>{resumeData.contact.phone}</span>
          <span>•</span>
          <a href={`mailto:${resumeData.contact.email}`} className="text-blue-600 hover:underline">
            {resumeData.contact.email}
          </a>
        </div>
      </div>

      {/* Summary */}
      <section id={resumeData.summary.id} className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Summary</h2>
        <p className="text-gray-700 leading-relaxed">{resumeData.summary.text}</p>
      </section>

      {/* Experience */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Experience</h2>
        <div className="space-y-6">
          {resumeData.experience.map((exp) => (
            <div key={exp.id} id={exp.id} className="border-l-4 border-blue-500 pl-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{exp.title}</h3>
                  <p className="text-gray-600 font-medium">{exp.company}</p>
                </div>
                {exp.period && (
                  <span className="text-gray-500 text-sm whitespace-nowrap ml-4">{exp.period}</span>
                )}
              </div>
              {exp.bullets && exp.bullets.length > 0 && (
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  {exp.bullets.map((bullet) => (
                    <li key={bullet.id} id={bullet.id}>{bullet.text}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Education</h2>
        <div className="space-y-4">
          {resumeData.education.map((edu) => (
            <div key={edu.id} id={edu.id}>
              <h3 className="text-lg font-semibold text-gray-900">{edu.degree}</h3>
              <p className="text-gray-600">{edu.school}</p>
              {edu.period && (
                <p className="text-gray-500 text-sm">{edu.period}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Skills */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Skills</h2>
        <div className="flex flex-wrap gap-2">
          {resumeData.skills.map((skill) => (
            <span
              key={skill.id}
              id={skill.id}
              className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-medium"
            >
              {skill.name}
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}
