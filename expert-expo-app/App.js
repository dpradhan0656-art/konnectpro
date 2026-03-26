import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { validateExpertAccess } from './src/auth/expertAccess';
import { LanguageProvider } from './src/context/LanguageContext';
import { supabase } from './src/lib/supabase';
import DashboardScreen from './src/screens/DashboardScreen';
import LoginScreen from './src/screens/LoginScreen';
import AccessGateScreen from './src/screens/AccessGateScreen';

export default function App() {
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
      if (initial?.user) {
        try {
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
        setSession(null);
        setExpert(null);
        setAccessGate(null);
        return;
      }
      if (nextSession?.user && event === 'SIGNED_IN') {
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
      }
      if (event === 'TOKEN_REFRESHED' && nextSession) {
        setSession(nextSession);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const showDashboard = Boolean(session && expert);

  return (
    <LanguageProvider>
    <SafeAreaProvider>
      {booting ? (
        <View style={styles.boot}>
          <ActivityIndicator size="large" color="#0d9488" />
        </View>
      ) : showDashboard ? (
        <DashboardScreen expert={expert} />
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
