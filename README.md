<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1hn8sNDQYrnOCkK18-5VO43EHa7p1BcWn

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables in `.env.local`:
   ```env
   # Required: IBM Watsonx Orchestrate API
   WATSONX_API_ENDPOINT=https://your-watsonx-instance.ibm.com/api
   WATSONX_API_KEY=your_api_key_here
   
   # Optional: Gemini API (for video transcription)
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. Run the app:
   ```bash
   npm run dev
   ```

## IBM Watsonx Orchestrate Integration

This application uses **IBM Watsonx Orchestrate API** to generate knowledge gaps based on connected data sources. The application automatically:

- Authenticates with Watsonx Orchestrate
- Discovers available skillsets and skills
- Uses connected data sources to generate relevant interview questions
- Leverages organizational data for context-aware knowledge gap identification

For detailed setup instructions, see [WATSONX_SETUP.md](WATSONX_SETUP.md).
