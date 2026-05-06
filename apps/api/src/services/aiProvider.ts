import { DeepseekService } from './deepseek';

function getProvider() {
  return DeepseekService;
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
