import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, AppState, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { validateExpertAccess } from './src/auth/expertAccess';
import { buildFallbackExpertFromUser, isForceExpertDashboardMode } from './src/config/expertAuthFlags';
import { LanguageProvider } from './src/context/LanguageContext';
import { supabase } from './src/lib/supabase';
import DashboardScreen from './src/screens/DashboardScreen';
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

export default function App() {
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
   * OAuth returns a Session in-memory before AsyncStorage always reflects it on Android.
   * Re-apply via setSession so persist + auth listeners align, then reconcile UI.
   */
  const onOAuthSessionHint = useCallback(
    async (sessionHint) => {
      let s = sessionHint ?? null;
      if (s?.access_token && s?.refresh_token) {
        const { data, error } = await supabase.auth.setSession({
          access_token: s.access_token,
          refresh_token: s.refresh_token,
        });
        if (!error && data?.session?.user) {
          s = data.session;
        }
      }
      if (!s?.user) {
        for (let i = 0; i < 30; i++) {
          const { data } = await supabase.auth.getSession();
          if (data.session?.user) {
            s = data.session;
            break;
          }
          await new Promise((r) => setTimeout(r, 100));
        }
      }
      if (!s?.user) {
        Alert.alert(
          'Sign-in incomplete',
          'Google finished but this device did not save the session yet. Fully close the app and open it again, or tap Continue with Google once more.'
        );
        return;
      }

      try {
        await Promise.race([
          reconcileExpertSession(s),
          new Promise((_, rej) =>
            setTimeout(
              () => rej(new Error('Checking your expert profile timed out. Check internet and try again.')),
              32000
            )
          ),
        ]);
      } catch (e) {
        Alert.alert('Sign-in', e?.message ?? String(e));
      }
    },
    [reconcileExpertSession]
  );

  useEffect(() => {
    let mounted = true;

    async function initSession() {
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
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (event === 'INITIAL_SESSION') return;

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

      if (nextSession?.user && event === 'SIGNED_IN') {
        await reconcileRef.current(nextSession);
        return;
      }

      if (event === 'TOKEN_REFRESHED' && nextSession) {
        setSession(nextSession);
        if (forceExpertMode) {
          setExpert((prev) => prev ?? buildFallbackExpertFromUser(nextSession.user));
          setAccessGate(null);
          return;
        }
        // OAuth on Android sometimes updates tokens without a separate SIGNED_IN the UI sees — re-apply routing.
        if (uiRef.current.onLoginSurface && nextSession.user) {
          await reconcileRef.current(nextSession);
        }
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
        if (!uiRef.current.onLoginSurface) return;
        const {
          data: { session: s },
        } = await supabase.auth.getSession();
        if (s?.user) {
          await reconcileRef.current(s);
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
          <DashboardScreen expert={resolvedExpert} />
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

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    backgroundColor: '#0f172a',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
