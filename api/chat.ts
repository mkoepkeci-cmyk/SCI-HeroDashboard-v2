import Anthropic from '@anthropic-ai/sdk';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    console.log('API Key present:', !!apiKey);
    console.log('API Key length:', apiKey?.length);
    console.log('Request method:', req.method);
    console.log('Request body:', JSON.stringify(req.body).substring(0, 200));

    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY is not set');
      return res.status(500).json({
        error: 'API key not configured',
        details: 'ANTHROPIC_API_KEY environment variable is not set'
      });
    }

    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Invalid request',
        details: 'Messages array is required'
      });
    }

    console.log('Creating Anthropic client...');
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    console.log('Calling Claude API...');

    // Build system prompt with SCI data context
    const systemPrompt = `You are an AI assistant for the CommonSpirit Health System Clinical Informatics (SCI) team. You have access to comprehensive data about the team's initiatives, workload, capacity, and impact metrics.

Your role is to help leaders and team members understand:
- Team capacity and workload distribution
- Initiative status, progress, and impact
- Resource allocation and potential bottlenecks
- Financial impact and ROI of initiatives
- Work distribution across team members
- Trends and patterns in team performance

Here is the current SCI team data:
${context}

When answering questions:
- Be specific and data-driven
- Cite actual numbers from the data
- Provide actionable insights
- Be concise but comprehensive
- Use bullet points for clarity
- Highlight potential concerns or opportunities
- If asked about capacity, consider both active hours and assignment counts

Format your responses in a clear, executive-friendly style.`;

    const response = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20240620',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    });

    console.log('Claude API response received');

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : 'I apologize, but I could not generate a response.';

    console.log('Sending response to client');
    return res.status(200).json({ message: assistantMessage });
  } catch (error: any) {
    console.error('Chat API error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({
      error: 'Failed to process chat request',
      details: error.message,
      errorType: error.name
    });
  }
}
