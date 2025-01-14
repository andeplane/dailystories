# Daily stories - AI-Powered Children's Book Generator

DailyStories is a web application created by Anders Hafreager that allows users to generate personalized children's books using AI. Built with React and powered by OpenAI's API, it creates unique stories with custom illustrations based on user preferences.

Try it out at: [https://andeplane.github.io/dailystories](https://andeplane.github.io/dailystories)

## Features

- Generate custom children's books with AI
- Specify book themes, length, and other settings
- View generated books in an interactive reader
- Save books locally using IndexedDB
- Track analytics with Mixpanel integration

## Getting Started

1. Clone the repository
2. Install dependencies with `npm install`
3. Get an OpenAI API key from [OpenAI's website](https://openai.com)
4. Start the development server with `npm start`
5. Open [http://localhost:3000/dailystories](http://localhost:3000/dailystories) to view it in the browser

## Development Requirements

To develop or contribute to DailyStories, you'll need:

- Node.js 18 or higher
- An OpenAI API key with access to:
  - GPT-4 for story generation
  - DALL-E 3 for image generation
- A Mixpanel account (optional, for analytics)

### Environment Setup

1. Create a free account on [OpenAI's platform](https://platform.openai.com)
2. Generate an API key with sufficient credits for development
3. The API key can be entered directly in the application's UI
4. For development without UI input, create a `.env` file with:
