# IBM Watsonx Orchestrate Integration Setup

This application is fully integrated with IBM Watsonx Orchestrate as its primary backend. All AI operations (knowledge gap generation, document creation) are handled through Watsonx Orchestrate API using your configured API key and endpoint.

## Prerequisites

1. An IBM Watsonx Orchestrate account
2. API credentials (API Key and Endpoint URL)
3. Connected data sources configured in your Watsonx Orchestrate instance

## Environment Variables Setup

Create a `.env.local` file in the root directory with the following variables:

```env
# IBM Watsonx Orchestrate API Configuration
WATSONX_API_ENDPOINT=https://your-watsonx-instance.ibm.com/api
WATSONX_API_KEY=your_api_key_here

# Alternative variable names (also supported)
# WATSONX_ORCHESTRATE_ENDPOINT=https://your-watsonx-instance.ibm.com/api
# WATSONX_ORCHESTRATE_API_KEY=your_api_key_here

# Optional: Gemini API (for video transcription)
GEMINI_API_KEY=your_gemini_api_key_here
```

## Getting Your API Credentials

1. **Log in to IBM Watsonx Orchestrate**

   - Navigate to your Watsonx Orchestrate instance
   - Go to the API settings or Developer section

2. **Generate API Key**

   - Create a new API key for your application
   - Copy the API key securely

3. **Get API Endpoint**
   - The endpoint URL is typically in the format:
     - `https://{your-instance}.watsonx.ibm.com/api`
     - Or `https://{your-instance}.ibm.com/api/v1`
   - Check your Watsonx Orchestrate documentation for the exact endpoint

## How It Works

1. **Authentication**: The application authenticates with IBM Watsonx Orchestrate using your API key to obtain a JWT token.

2. **Skillset Discovery**: The application automatically discovers available skillsets in your Watsonx Orchestrate instance.

3. **Skill Selection**: It finds and uses appropriate skills for:

   - Knowledge gap generation (using connected data sources)
   - Document generation

4. **Data Source Integration**: The Watsonx Orchestrate skills access your connected data sources to:
   - Understand organizational context
   - Identify role-specific knowledge areas
   - Generate relevant interview questions based on actual data

## Connected Data Sources

Ensure your Watsonx Orchestrate instance has connected data sources that contain:

- Employee role information
- Department structures
- Project documentation
- Knowledge bases
- Historical offboarding data (if available)

The application will automatically leverage these sources when generating knowledge gaps.

## Troubleshooting

### Authentication Errors

- Verify your API key is correct
- Check that the API endpoint URL is correct
- Ensure your API key has the necessary permissions

### No Skillsets Found

- Verify your Watsonx Orchestrate instance has skillsets configured
- Check that your API key has access to skillsets
- Review the skillset permissions in your Watsonx Orchestrate dashboard

### No Skills Available

- Ensure skillsets contain skills related to knowledge generation or analysis
- Check skill permissions and availability
- Review the Watsonx Orchestrate skills documentation

### Knowledge Gaps Not Generated

- Verify connected data sources are accessible
- Check that skills have proper input/output schemas
- Review the console for detailed error messages

## API Endpoint Formats

The application supports multiple endpoint formats:

- `/v1/auth/token` - Standard authentication
- `/auth/token` - Alternative authentication endpoint
- `/v1/skillsets` - List skillsets
- `/v1/skillsets/{id}` - Get skills in a skillset
- `/v1/skillsets/{id}/skills/{skill_id}/invoke` - Invoke a skill

## Testing the Integration

1. Start the development server: `npm run dev`
2. Fill in the welcome form with employee details
3. Click "Start Knowledge Scan"
4. The application will:
   - Authenticate with Watsonx Orchestrate
   - Discover available skillsets
   - Use appropriate skills to generate knowledge gaps
   - Display the generated interview questions

## Support

For issues related to:

- **Watsonx Orchestrate API**: Check IBM documentation
- **Application Integration**: Review the console logs for detailed error messages
- **Data Sources**: Verify data source connectivity in Watsonx Orchestrate dashboard
