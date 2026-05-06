type DeepseekResponse = {
  choices?: Array<{
    message?: { content?: string };
    text?: string;
  }>;
};

const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
const deepseekBaseUrl = process.env.DEEPSEEK_API_BASE_URL?.trim().replace(/\/v1$/, '') || 'https://api.deepseek.com';
const deepseekModel = process.env.DEEPSEEK_MODEL?.trim() || 'deepseek-chat';

if (!deepseekApiKey) {
  console.warn('DEEPSEEK_API_KEY is not set. Deepseek provider will fail until a valid key is configured.');
}

export class DeepseekService {
  private static async sendPrompt(prompt: string, maxTokens: number): Promise<string> {
    if (!deepseekApiKey) {
      throw new Error('Missing DEEPSEEK_API_KEY for Deepseek provider.');
    }

    const response = await fetch(`${deepseekBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: deepseekModel,
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: maxTokens,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Deepseek request failed: ${response.status} ${errorText}`);
    }

    const data = await response.json() as DeepseekResponse;
    const text = data.choices?.[0]?.message?.content || data.choices?.[0]?.text;

    if (!text || typeof text !== 'string') {
      throw new Error('Deepseek response did not return a text result.');
    }

    return text;
  }

  static async getConversationAssistance(matchContext: string, recentMessages: any[]) {
    const prompt = `You are a warm, witty dating coach helping someone start a conversation with a new match. Given two dating profiles and recent chat context, suggest exactly 2 short, personalized conversation openers (under 30 words each). Rules: genuine not cheesy. Never use pickup lines. Base suggestions on specific profile details. Return ONLY valid JSON: {\"openers\": [\"...\", \"...\"]}\nMatch context: ${matchContext}\nRecent messages: ${JSON.stringify(recentMessages)}`;
    const content = await this.sendPrompt(prompt, 200);
    return JSON.parse(content);
  }

  static async getProfileCoaching(profile: any) {
    const prompt = `You are a friendly dating profile coach. Analyze the profile and return 3 specific, actionable improvements. Focus on: photo tips, prompt answers that are too generic, missing information that would help matching. Return ONLY valid JSON: {\"tips\": [{\"area\": \"...\", \"issue\": \"...\", \"suggestion\": \"...\"}]}\nProfile: ${JSON.stringify(profile)}`;
    const content = await this.sendPrompt(prompt, 300);
    return JSON.parse(content);
  }

  static async getFateRationale(userProfile: any, matchProfile: any, diffDimensions: string[]) {
    const prompt = `You are writing a one-sentence framing for a dating app \"wild card\" match suggestion. The match differs from the user's usual type in specific ways, but has strong values alignment. Write exactly 1 warm, intriguing sentence (max 20 words) explaining why this unexpected match might be special. Return ONLY valid JSON: {\"rationale\": \"...\"}\nUser profile: ${JSON.stringify(userProfile)}\nMatch profile: ${JSON.stringify(matchProfile)}\nDifferences: ${diffDimensions.join(', ')}`;
    const content = await this.sendPrompt(prompt, 100);
    return JSON.parse(content);
  }
}
