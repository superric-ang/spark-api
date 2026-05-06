import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const CONVERSATION_ASSIST_PROMPT = `You are a warm, witty dating coach helping someone start a conversation with a new match.
Given two dating profiles and recent chat context, suggest exactly 2 short, personalized conversation openers (under 30 words each).
Rules: genuine not cheesy. Never use pickup lines. Base suggestions on specific profile details.
Return ONLY valid JSON: {"openers": ["...", "..."]}`;

export const PROFILE_COACH_PROMPT = `You are a friendly dating profile coach.
Analyze the profile and return 3 specific, actionable improvements.
Focus on: photo tips, prompt answers that are too generic, missing information that would help matching.
Return ONLY valid JSON: {"tips": [{"area": "...", "issue": "...", "suggestion": "..."}]}`;

export const FATE_RATIONALE_PROMPT = `You are writing a one-sentence framing for a dating app "wild card" match suggestion.
The match differs from the user's usual type in specific ways, but has strong values alignment.
Write exactly 1 warm, intriguing sentence (max 20 words) explaining why this unexpected match might be special.
Return ONLY valid JSON: {"rationale": "..."}`;

export class ClaudeService {
  static async getConversationAssistance(matchContext: string, recentMessages: any[]): Promise<{ openers: string[] }> {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 200,
      system: CONVERSATION_ASSIST_PROMPT,
      messages: [{
        role: 'user',
        content: `Match context: ${matchContext}\nRecent messages: ${JSON.stringify(recentMessages)}`
      }]
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    return JSON.parse(content.text);
  }

  static async getProfileCoaching(profile: any): Promise<{ tips: Array<{ area: string; issue: string; suggestion: string }> }> {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 300,
      system: PROFILE_COACH_PROMPT,
      messages: [{
        role: 'user',
        content: `Profile: ${JSON.stringify(profile)}`
      }]
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    return JSON.parse(content.text);
  }

  static async getFateRationale(userProfile: any, matchProfile: any, diffDimensions: string[]): Promise<{ rationale: string }> {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 100,
      system: FATE_RATIONALE_PROMPT,
      messages: [{
        role: 'user',
        content: `User profile: ${JSON.stringify(userProfile)}\nMatch profile: ${JSON.stringify(matchProfile)}\nDifferences: ${diffDimensions.join(', ')}`
      }]
    });

    const content = response.content[0];
    if (content.type !== 'text') throw new Error('Unexpected response type');

    return JSON.parse(content.text);
  }
}