// App.js

import { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Onboarding from './Onboarding';
import LoadingScreen from './LoadingScreen';
import RecommendationReview from './RecommendationReview';
import Timeline from './Timeline';
import { generateRecommendations } from './src/services/AI/recommendations';
import { generateTimeline } from './src/services/AI/timeline';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('loading'); // loading | onboarding | recommendations | review | timeline | main
  const [userProfile, setUserProfile] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [timeline, setTimeline] = useState(null);

  useEffect(() => {
    checkOnboarding();
  }, []);

  const checkOnboarding = async () => {
    try {
      const completed = await AsyncStorage.getItem('hasCompletedOnboarding');
      const profile = await AsyncStorage.getItem('userProfile');
      const savedTimeline = await AsyncStorage.getItem('timeline');
      
      if (completed === 'true' && profile && savedTimeline) {
        // User has completed everything - go to main app
        setUserProfile(JSON.parse(profile));
        setTimeline(JSON.parse(savedTimeline));
        setCurrentScreen('main');
      } else if (completed === 'true' && profile) {
        // User completed onboarding but not timeline - restart from recommendations
        setUserProfile(JSON.parse(profile));
        setCurrentScreen('recommendations');
        await handleGenerateRecommendations(JSON.parse(profile));
      } else {
        // New user - start onboarding
        setCurrentScreen('onboarding');
      }
    } catch (error) {
      console.error('Error checking onboarding:', error);
      setCurrentScreen('onboarding');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = async (profile) => {
    setUserProfile(profile);
    setCurrentScreen('recommendations');
    await handleGenerateRecommendations(profile);
  };

  const handleGenerateRecommendations = async (profile) => {
    try {
      const recs = await generateRecommendations(profile);
      setRecommendations(recs);
      setCurrentScreen('review');
    } catch (error) {
      console.error('Error generating recommendations:', error);
      // Show error or fallback
      setCurrentScreen('review');
    }
  };

  const handleRecommendationsConfirmed = async (selectedSkills) => {
    setCurrentScreen('timeline');
    
    try {
      // Flatten selected skills from all categories
      const allSelectedSkills = [
        ...selectedSkills.critical,
        ...selectedSkills.important,
        ...selectedSkills.niceToHave,
      ];

      const generatedTimeline = await generateTimeline(allSelectedSkills, userProfile);
      
      // Save timeline to AsyncStorage
      await AsyncStorage.setItem('timeline', JSON.stringify(generatedTimeline));
      
      setTimeline(generatedTimeline);
      setCurrentScreen('main');
    } catch (error) {
      console.error('Error generating timeline:', error);
      // Could show error screen here
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  // Route to appropriate screen
  if (currentScreen === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  if (currentScreen === 'recommendations') {
    return (
      <LoadingScreen 
        message="Analyzing your path..."
        subtitle="Figuring out what you actually need to learn"
      />
    );
  }

  if (currentScreen === 'review') {
    return (
      <RecommendationReview 
        recommendations={recommendations}
        onConfirm={handleRecommendationsConfirmed}
      />
    );
  }

  if (currentScreen === 'timeline') {
    return (
      <LoadingScreen 
        message="Creating your timeline..."
        subtitle="Building your personalized learning path"
      />
    );
  }

  if (currentScreen === 'main') {
    return <Timeline userProfile={userProfile} timeline={timeline} />;
  }

  return null;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
});