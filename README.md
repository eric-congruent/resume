# Resume & AI Experience App

A Next.js application showcasing your resume and AI experience timeline with an integrated AI chat assistant.

## Features

- **AI Experience Timeline**: Vertical timeline with line and dots displaying your AI/ML experience
- **Resume Display**: Clean, professional resume layout
- **AI Chat Assistant**: Interactive chat powered by Anthropic's Claude API
- **Tab Navigation**: Switch between Timeline and Resume views
- **Responsive Design**: Built with Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Anthropic API key

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
ANTHROPIC_API_KEY=your_api_key_here
ANTHROPIC_MODEL=claude-3-opus-20240229
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Customization

### Update Timeline Data
Edit `app/components/Timeline.js` and replace the `experiences` array with your actual AI experience.

### Update Resume Data
Edit `app/components/Resume.js` and replace the `resumeData` object with your actual resume information.

## Future Enhancements

- Scroll to and highlight content based on AI responses
- Enhanced context awareness for the AI assistant
- Additional interactive features

