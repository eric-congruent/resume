import './globals.css'

export const metadata = {
  title: 'Resume & AI Experience',
  description: 'Interactive resume and AI experience timeline',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

