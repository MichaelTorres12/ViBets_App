import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { supabase } from './supabaseClient';

export async function registerForPushNotificationsAsync(userId: string) {
  if (!Device.isDevice) {
    console.log('Must use physical device for push notifications');
    return;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get push token');
    return;
  }

  const tokenData = await Notifications.getExpoPushTokenAsync();
  const token = tokenData.data;

  try {
    await supabase.from('profiles').update({ expo_push_token: token }).eq('id', userId);
  } catch (error) {
    console.error('Error saving push token:', error);
  }

  return token;
}

export async function sendPushNotifications(tokens: string[], title: string, body: string, data?: any) {
  const messages = tokens.map((token) => ({
    to: token,
    sound: 'default',
    title,
    body,
    data,
  }));

  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });
  } catch (error) {
    console.error('Error sending push notifications:', error);
  }
}
