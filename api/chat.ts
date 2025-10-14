import Anthropic from '@anthropic-ai/sdk';

// Vercel Serverless Function
export const config = {
  runtime: 'edge',
};

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const { messages, context } = await req.json();

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY || '',
    });

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
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages,
    });

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : 'I apologize, but I could not generate a response.';

    return new Response(
      JSON.stringify({ message: assistantMessage }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to process chat request',
        details: error.message
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
