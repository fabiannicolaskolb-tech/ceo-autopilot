// n8n Webhook Stubs – Console-Logging, kein echtes Backend
export const saveProfile = async (userId: string, profile: any) => {
  console.log('[API] saveProfile', userId, profile);
  return { success: true };
};

export const generateIdeas = async (userId: string, input: string) => {
  console.log('[API] generateIdeas', userId, input);
  return { success: true };
};

export const getPosts = async (userId: string) => {
  console.log('[API] getPosts', userId);
  return { success: true, data: [] };
};

export const getAnalytics = async (userId: string) => {
  console.log('[API] getAnalytics', userId);
  return { success: true, data: {} };
};

export const onboardingComplete = async (userId: string) => {
  console.log('[API] onboardingComplete', userId);
  return { success: true };
};
