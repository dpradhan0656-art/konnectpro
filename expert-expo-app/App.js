import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
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
            // Keep the session and show an explicit gate for onboarding/approval.
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
        try {
          if (forceExpertMode) {
            setSession(nextSession);
            setExpert(buildFallbackExpertFromUser(nextSession.user));
            setAccessGate(null);
            return;
          }
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
      }
      
      if (event === 'TOKEN_REFRESHED' && nextSession) {
        setSession(nextSession);
        if (forceExpertMode) {
          setExpert((prev) => prev ?? buildFallbackExpertFromUser(nextSession.user));
          setAccessGate(null);
        }
      }
    });

    // 🔥 THE FIX IS HERE: Safe Cleanup Check 🔥
    return () => {
      mounted = false;
      if (subscription && typeof subscription.unsubscribe === 'function') {
        subscription.unsubscribe();
      } else if (subscription && typeof subscription.remove === 'function') {
        subscription.remove();
      }
    };
  }, []);

  const resolvedExpert = expert ?? (forceExpertMode && session?.user ? buildFallbackExpertFromUser(session.user) : null);
  const showDashboard = Boolean(session && (expert || forceExpertMode));

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
          <LoginScreen />
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