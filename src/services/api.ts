import { supabase } from '@/integrations/supabase/client';

async function getUserId(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data.user?.id || null;
}

export const saveProfile = async (profile: any) => {
  const userId = await getUserId();
  console.log('[API] saveProfile', userId, profile);
  return { success: true };
};

export const generateIdeas = async (input: string) => {
  const userId = await getUserId();
  console.log('[API] generateIdeas', userId, input);
  return { success: true };
};

export const getPosts = async () => {
  const userId = await getUserId();
  console.log('[API] getPosts', userId);
  return { success: true, data: [] };
};

export const getAnalytics = async () => {
  const userId = await getUserId();
  console.log('[API] getAnalytics', userId);
  return { success: true, data: {} };
};

export const onboardingComplete = async () => {
  const userId = await getUserId();
  console.log('[API] onboardingComplete', userId);
  return { success: true };
};
