import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { validateExpertAccess } from './src/auth/expertAccess';
import { LanguageProvider } from './src/context/LanguageContext';
import { supabase } from './src/lib/supabase';
import DashboardScreen from './src/screens/DashboardScreen';
import LoginScreen from './src/screens/LoginScreen';

export default function App() {
  const [booting, setBooting] = useState(true);
  const [session, setSession] = useState(null);
  const [expert, setExpert] = useState(null);

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
          } else {
            await supabase.auth.signOut();
            Alert.alert('Expert access', result.message ?? 'Unable to sign in.');
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
        return;
      }
      if (nextSession?.user && event === 'SIGNED_IN') {
        try {
          const result = await validateExpertAccess(supabase, nextSession.user);
          if (result.ok) {
            setSession(nextSession);
            setExpert(result.expert);
          } else {
            await supabase.auth.signOut();
            setSession(null);
            setExpert(null);
            Alert.alert('Expert access', result.message ?? 'Unable to sign in.');
          }
        } catch (e) {
          await supabase.auth.signOut();
          setSession(null);
          setExpert(null);
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
