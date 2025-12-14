import { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Onboarding from './OnBoarding';
import DailyView from './DailyView';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const completed = await AsyncStorage.getItem('hasCompletedOnboarding');
      const profile = await AsyncStorage.getItem('userProfile');
      
      if (completed === 'true' && profile) {
        setHasCompletedOnboarding(true);
        setUserProfile(JSON.parse(profile));
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = (profile) => {
    setUserProfile(profile);
    setHasCompletedOnboarding(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return <DailyView userProfile={userProfile} />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
});