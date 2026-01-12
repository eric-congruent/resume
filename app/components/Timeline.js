'use client'

import { useState } from 'react'
import { timelineProjects } from '../data/timelineData'

export default function Timeline() {
  const [selectedImage, setSelectedImage] = useState(null)

  return (
    <div className="relative">
      {/* Vertical Line */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-blue-500"></div>

      {/* Timeline Items */}
      <div className="space-y-12">
        {timelineProjects.map((project) => (
          <div key={project.id} id={project.id} className="relative flex items-start">
            {/* Dot */}
            <div className="absolute left-6 w-4 h-4 bg-blue-500 rounded-full border-4 border-white shadow-lg z-10"></div>

            {/* Content */}
            <div className="ml-20 flex-1">
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                    {project.year}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {project.title}
                </h3>
                <p className="text-gray-600 font-medium mb-3 italic">{project.teaser}</p>
                <p className="text-gray-700 mb-4">{project.description}</p>
                
                {/* Screenshots/Photos */}
                {project.images && project.images.length > 0 && (
                  <div className="mb-4">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {project.images.map((image, imageIndex) => (
                        <button
                          key={imageIndex}
                          onClick={() => setSelectedImage(image)}
                          className="flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg overflow-hidden"
                        >
                          <img
                            src={image}
                            alt={`${project.title} screenshot ${imageIndex + 1}`}
                            className="w-24 h-24 object-cover rounded-lg hover:opacity-80 transition-opacity cursor-pointer border border-gray-200"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech.id}
                      id={tech.id}
                      className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                    >
                      {tech.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full h-full flex items-center justify-center">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors z-10"
              aria-label="Close"
            >
              <svg
                className="w-8 h-8"
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
            </button>
            <img
              src={selectedImage}
              alt="Full size screenshot"
              className="max-w-full max-h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}

