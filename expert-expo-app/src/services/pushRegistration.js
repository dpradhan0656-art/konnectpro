import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

import { supabase } from '../lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function ensureAndroidChannels() {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('assignments', {
    name: 'Job assignments',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    sound: 'default',
    enableVibrate: true,
    lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
  });
  await Notifications.setNotificationChannelAsync('default', {
    name: 'Default',
    importance: Notifications.AndroidImportance.DEFAULT,
    sound: 'default',
  });
}

/**
 * Registers for Expo Push, saves token + optional language to experts row.
 * @param {{ expertId: string | number; langCode?: string }} params
 * @returns {Promise<string | null>} Expo push token or null
 */
export async function registerExpertPushToken({ expertId, langCode }) {
  if (!expertId) return null;
  if (!Device.isDevice) {
    return null;
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let final = existing;
  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    final = status;
  }
  if (final !== 'granted') {
    return null;
  }

  await ensureAndroidChannels();

  const projectId =
    Constants.expoConfig?.extra?.eas?.projectId ||
    Constants.easConfig?.projectId;

  if (!projectId) {
    console.warn(
      '[push] Set EXPO_PUBLIC_EAS_PROJECT_ID or app.json extra.eas.projectId (run `eas init` and copy project id).'
    );
    return null;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync({ projectId });
  const token = tokenData.data;
  if (!token) return null;

  const updates = {
    expo_push_token: token,
    expo_push_token_updated_at: new Date().toISOString(),
  };
  if (langCode) {
    updates.expo_ui_lang = String(langCode).split('-')[0].toLowerCase();
  }

  const { error } = await supabase.from('experts').update(updates).eq('id', expertId);
  if (error) {
    console.warn('[push] Failed to save token:', error.message);
  }

  return token;
}
