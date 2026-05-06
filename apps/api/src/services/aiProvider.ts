import { ClaudeService } from './claude';
import { DeepseekService } from './deepseek';

type ProviderName = 'anthropic' | 'deepseek';

function getProviderName(): ProviderName {
  const provider = (process.env.AI_PROVIDER || 'anthropic').trim().toLowerCase();
  if (provider === 'deepseek') return 'deepseek';
  return 'anthropic';
}

function getProvider() {
  const provider = getProviderName();
  if (provider === 'deepseek') {
    return DeepseekService;
  }
  return ClaudeService;
}

export const AIService = {
  async getConversationAssistance(matchContext: string, recentMessages: any[]) {
    return getProvider().getConversationAssistance(matchContext, recentMessages);
  },

  async getProfileCoaching(profile: any) {
    return getProvider().getProfileCoaching(profile);
  },

  async getFateRationale(userProfile: any, matchProfile: any, diffDimensions: string[]) {
    return getProvider().getFateRationale(userProfile, matchProfile, diffDimensions);
  },
};
