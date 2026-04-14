import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { validateExpertAccess } from './src/auth/expertAccess';
import { buildFallbackExpertFromUser, isForceExpertDashboardMode } from './src/config/expertAuthFlags';
import { LanguageProvider } from './src/context/LanguageContext';
import { tryResumeOAuthFromPendingDeepLink } from './src/lib/googleOAuth';
import { isSupabaseConfigured, supabase } from './src/lib/supabase';
import MainTabs from './src/screens/MainTabs';
import LoginScreen from './src/screens/LoginScreen';
import AccessGateScreen from './src/screens/AccessGateScreen';

function buildForceModeUser() {
  return {
    id: 'force-expert-local-user',
    email: 'expert.local@kshatr.test',
    user_metadata: {
      full_name: 'Expert Local Tester',
    },
  };
}

function buildForceModeSession() {
  const nowIso = new Date().toISOString();
  return {
    access_token: 'force-mode',
    refresh_token: 'force-mode',
    token_type: 'bearer',
    expires_in: 60 * 60 * 24,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    user: buildForceModeUser(),
    created_at: nowIso,
  };
}

function MisconfiguredExpertApp() {
  return (
    <SafeAreaProvider>
      <View style={styles.configErr}>
        <ScrollView contentContainerStyle={styles.configErrScroll}>
          <Text style={styles.configErrTitle}>Expert app — configuration</Text>
          <Text style={styles.configErrBody}>
            This APK was built without Supabase credentials. Google sign-in and the dashboard cannot work until you add
            EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to expert-expo-app/.env, then run a new release
            build (cd android → gradlew assembleRelease).
          </Text>
          <Text style={styles.configErrHint}>
            For EAS builds, set the same variables in Expo → Project → Environment variables for your profile.
          </Text>
        </ScrollView>
      </View>
      <StatusBar style="light" />
    </SafeAreaProvider>
  );
}

function ExpertAppRoot() {
  const forceExpertMode = isForceExpertDashboardMode();
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState(null);
  const [expert, setExpert] = useState(null);
  const [accessGate, setAccessGate] = useState(null);

  const reconcileExpertSession = useCallback(async (nextSession) => {
    if (forceExpertMode) {
      if (nextSession?.user) {
        setSession(nextSession);
        setExpert(buildFallbackExpertFromUser(nextSession.user));
        setAccessGate(null);
      }
      return;
    }
    if (!nextSession?.user) return;
    try {
      const result = await validateExpertAccess(supabase, nextSession.user);
      if (result.ok) {
        setSession(nextSession);
        setExpert(result.expert);
        setAccessGate(null);
      } else {
        setSession(nextSession);
        setExpert(null);
        setAccessGate({
          title:
            result.reason === 'not_approved'
              ? 'Account Pending Approval'
              : 'Complete Expert Registration',
          message: result.message ?? 'Unable to access expert dashboard.',
        });
      }
    } catch (e) {
      await supabase.auth.signOut();
      setSession(null);
      setExpert(null);
      setAccessGate(null);
      Alert.alert('Error', e?.message ?? String(e));
    }
  }, [forceExpertMode]);

  const reconcileRef = useRef(reconcileExpertSession);
  reconcileRef.current = reconcileExpertSession;

  const resolvedExpert =
    expert ?? (forceExpertMode && session?.user ? buildFallbackExpertFromUser(session.user) : null);
  const showDashboard = Boolean(session && (expert || forceExpertMode));
  const onLoginSurface = !booting && !showDashboard && !accessGate;

  const uiRef = useRef({ onLoginSurface: true });
  uiRef.current = { onLoginSurface };

  /**
   * OAuth: mirror session into React state immediately, then reconcile expert in the background.
   * Do not await reconcile — that blocked the auth listener chain on Android release builds.
   */
  const onOAuthSessionHint = useCallback(
    async (sessionHint) => {
      if (sessionHint?.access_token && sessionHint?.refresh_token) {
        const at = sessionHint.access_token;
        const rt = sessionHint.refresh_token;
        void Promise.race([
          supabase.auth.setSession({ access_token: at, refresh_token: rt }),
          new Promise((resolve) => setTimeout(resolve, 10000)),
        ]).catch(() => {});
      }

      let s = sessionHint?.user ? sessionHint : null;

      if (!s?.user) {
        for (let i = 0; i < 80; i++) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            s = data.session;
            break;
          }
          await new Promise((r) => setTimeout(r, 150));
        }
      }
      if (!s?.user) {
        Alert.alert(
          'Sign-in incomplete',
          'Google finished but this device did not save the session yet. Fully close the app and open it again, or tap Continue with Google once more.'
        );
        return;
      }

      setSession(s);
      void Promise.race([
        reconcileExpertSession(s),
        new Promise((_, rej) =>
          setTimeout(
            () => rej(new Error('Checking your expert profile timed out. Check internet and try again.')),
            32000
          )
        ),
      ]).catch((e) => {
        Alert.alert('Sign-in', e?.message ?? String(e));
      });
    },
    [reconcileExpertSession]
  );

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      await tryResumeOAuthFromPendingDeepLink(supabase);
      const {
        data: { session: initial },
      } = await supabase.auth.getSession();
      if (!mounted) return;

      if (forceExpertMode && !initial?.user) {
        const fakeSession = buildForceModeSession();
        setSession(fakeSession);
        setExpert(buildFallbackExpertFromUser(fakeSession.user));
        setAccessGate(null);
        setBooting(false);
        return;
      }

      if (initial?.user) {
        try {
          if (forceExpertMode) {
            setSession(initial);
            setExpert(buildFallbackExpertFromUser(initial.user));
            setAccessGate(null);
            setBooting(false);
            return;
          }
          const result = await validateExpertAccess(supabase, initial.user);
          if (!mounted) return;
          if (result.ok) {
            setSession(initial);
            setExpert(result.expert);
            setAccessGate(null);
          } else {
            setSession(initial);
            setExpert(null);
            setAccessGate({
              title:
                result.reason === 'not_approved'
                  ? 'Account Pending Approval'
                  : 'Complete Expert Registration',
              message: result.message ?? 'Unable to access expert dashboard.',
            });
          }
        } catch (e) {
          Alert.alert('Error', e?.message ?? String(e));
        }
      }
      setBooting(false);
    }

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      // Keep React session in lockstep with Supabase client + AsyncStorage (single source of truth for routing).
      if (event === 'INITIAL_SESSION') {
        if (nextSession?.user) {
          setSession(nextSession);
          void reconcileRef.current(nextSession);
        }
        return;
      }

      if (event === 'SIGNED_OUT') {
        if (forceExpertMode) {
          const fakeSession = buildForceModeSession();
          setSession(fakeSession);
          setExpert(buildFallbackExpertFromUser(fakeSession.user));
          setAccessGate(null);
          return;
        }
        setSession(null);
        setExpert(null);
        setAccessGate(null);
        return;
      }

      if (event === 'SIGNED_IN' && nextSession?.user) {
        setSession(nextSession);
        void reconcileRef.current(nextSession);
        return;
      }

      if (event === 'USER_UPDATED' && nextSession?.user) {
        setSession(nextSession);
        void reconcileRef.current(nextSession);
        return;
      }

      if (event === 'TOKEN_REFRESHED' && nextSession) {
        setSession(nextSession);
        if (forceExpertMode) {
          setExpert((prev) => prev ?? buildFallbackExpertFromUser(nextSession.user));
          setAccessGate(null);
          return;
        }
        if (nextSession.user) {
          void reconcileRef.current(nextSession);
        }
        return;
      }

      if (
        nextSession?.user &&
        !forceExpertMode &&
        uiRef.current.onLoginSurface &&
        event !== 'SIGNED_IN' &&
        event !== 'USER_UPDATED' &&
        event !== 'TOKEN_REFRESHED' &&
        event !== 'SIGNED_OUT' &&
        event !== 'INITIAL_SESSION'
      ) {
        setSession(nextSession);
        void reconcileRef.current(nextSession);
      }
    });

    return () => {
      mounted = false;
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      } else if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, [forceExpertMode]);

  /** Coming back from Chrome Custom Tabs: session is saved but React state may still show login. */
  useEffect(() => {
    let timeoutId;
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active' || forceExpertMode) return;
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(async () => {
        for (let attempt = 0; attempt < 5; attempt++) {
          if (!uiRef.current.onLoginSurface) return;
          const {
            data: { session: s },
          } = await supabase.auth.getSession();
          if (s?.user) {
            await reconcileRef.current(s);
            return;
          }
          await new Promise((r) => setTimeout(r, 450));
        }
      }, 350);
    });
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      sub.remove();
    };
  }, [forceExpertMode]);

  return (
    <LanguageProvider>
      <SafeAreaProvider>
        {booting ? (
          <View style={styles.boot}>
            <ActivityIndicator size="large" color="#0d9488" />
          </View>
        ) : showDashboard ? (
          <MainTabs expert={resolvedExpert} />
        ) : accessGate ? (
          <AccessGateScreen
            title={accessGate.title}
            message={accessGate.message}
            onSignOut={async () => {
              await supabase.auth.signOut();
            }}
          />
        ) : (
          <LoginScreen onOAuthSessionHint={onOAuthSessionHint} />
        )}
        <StatusBar style="light" />
      </SafeAreaProvider>
    </LanguageProvider>
  );
}

export default function App() {
  if (!isSupabaseConfigured()) {
    return <MisconfiguredExpertApp />;
  }
  return <ExpertAppRoot />;
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  configErr: {
    flex: 1,
    backgroundColor: '#0f172a',
    paddingTop: 48,
  },
  configErrScroll: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  configErrTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  configErrBody: {
    color: '#94a3b8',
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 14,
  },
  configErrHint: {
    color: '#64748b',
    fontSize: 13,
    lineHeight: 20,
  },
});
