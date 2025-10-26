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

    if (!apiKey) {
      console.error('ANTHROPIC_API_KEY is not set');
      return res.status(500).json({
        error: 'API key not configured',
        details: 'ANTHROPIC_API_KEY environment variable is not set'
      });
    }

    const { context, question } = req.body;

    if (!context || !question) {
      return res.status(400).json({
        error: 'Invalid request',
        details: 'Both context and question are required'
      });
    }

    console.log('Creating Anthropic client for load balance analysis...');
    const anthropic = new Anthropic({ apiKey });

    const systemPrompt = `You are a workload optimization specialist for the CommonSpirit Health System Clinical Informatics (SCI) team.

Your task is to analyze workload imbalances between two team members and recommend which specific assignments to move to achieve better balance.

Here is the workload data for the two team members:
${context}

When making recommendations:
1. **Prioritize assignments that match the recipient's existing work types** - they have relevant experience
2. **Consider work effort size** - moving larger assignments (L, XL) has more impact than small ones (XS, S)
3. **Check assignment status** - "Planning" or "On Hold" assignments are easier to reassign than "In Progress"
4. **Calculate the impact** - estimate the resulting capacity % for both team members after each move
5. **Aim for balance** - try to get both team members into the 60-85% range if possible
6. **Be specific** - reference exact assignment names from the data and work effort levels
7. **Explain your reasoning** - why this assignment is a good match for the recipient

Work Effort Hour Estimates (use these for impact calculations):
- XS: 1.5 hrs/week
- S: 4 hrs/week
- M: 8 hrs/week
- L: 13 hrs/week
- XL: 18 hrs/week
- XXL: 25 hrs/week

Format your response as:
- List 3-5 specific assignment recommendations ranked by priority (⭐ BEST MATCH, GOOD MATCH, CONSIDER)
- For each, show: Assignment name, work effort, work type, status, and projected impact on both capacities
- End with an overall recommendation of which assignments to move together for optimal balance

Keep recommendations actionable and specific. Use the actual assignment names from the data provided.`;

    console.log('Calling Claude API for load balance analysis...');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1536, // More tokens for detailed recommendations
      system: systemPrompt,
      messages: [{ role: 'user', content: question }],
    });

    console.log('Claude API response received');

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : 'I apologize, but I could not generate recommendations.';

    console.log('Sending response to client');
    return res.status(200).json({ message: assistantMessage });
  } catch (error: any) {
    console.error('Load balance API error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return res.status(500).json({
      error: 'Failed to process load balance request',
      details: error.message,
      errorType: error.name
    });
  }
}
