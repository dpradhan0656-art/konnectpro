/**
 * Extends app.json with EAS project id for Expo Push (FCM-backed on Android).
 * Set EXPO_PUBLIC_EAS_PROJECT_ID in .env or run `eas init` and paste projectId into app.json extra.eas.
 */
const appJson = require('./app.json');

const projectId =
  process.env.EXPO_PUBLIC_EAS_PROJECT_ID || appJson.expo?.extra?.eas?.projectId || '';

module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      ...(appJson.expo.extra || {}),
      eas: {
        ...(appJson.expo.extra?.eas || {}),
        projectId: projectId || undefined,
      },
    },
  },
};
