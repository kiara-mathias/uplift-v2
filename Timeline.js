// Timeline.js - Simpler Version (No complex SVG)

import { useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DailyView from './DailyView';

export default function Timeline({ userProfile, timeline }) {
  const [showPanicMode, setShowPanicMode] = useState(false);
  const [localTimeline, setLocalTimeline] = useState(timeline);

  const toggleDailyAction = async (phaseIndex, actionIndex) => {
    const updatedTimeline = { ...localTimeline };
    
    if (!updatedTimeline.phases[phaseIndex].completedActions) {
      updatedTimeline.phases[phaseIndex].completedActions = [];
    }
    
    const completed = updatedTimeline.phases[phaseIndex].completedActions;
    const idx = completed.indexOf(actionIndex);
    
    if (idx > -1) {
      completed.splice(idx, 1);
    } else {
      completed.push(actionIndex);
    }
    
    setLocalTimeline(updatedTimeline);
    await AsyncStorage.setItem('timeline', JSON.stringify(updatedTimeline));
  };

  const isActionCompleted = (phaseIndex, actionIndex) => {
    return localTimeline.phases[phaseIndex].completedActions?.includes(actionIndex) || false;
  };

  const currentPhase = localTimeline.phases[localTimeline.currentPhase];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Journey</Text>
        <Text style={styles.subtitle}>{localTimeline.mainGoal}</Text>
        <Text style={styles.targetDate}>Target: {localTimeline.targetDate}</Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Visual Path with Phases */}
        <View style={styles.pathContainer}>
          {localTimeline.phases.map((phase, index) => {
            const isCurrent = index === localTimeline.currentPhase;
            const isCompleted = index < localTimeline.currentPhase;
            const isUpcoming = index > localTimeline.currentPhase;

            return (
              <View key={phase.id} style={styles.phaseContainer}>
                {/* Connecting Line */}
                {index > 0 && (
                  <View style={[
                    styles.connectingLine,
                    isCompleted && styles.connectingLineCompleted
                  ]} />
                )}

                {/* Phase Marker */}
                <View style={[
                  styles.phaseMarker,
                  isCompleted && styles.phaseMarkerCompleted,
                  isCurrent && styles.phaseMarkerCurrent,
                  isUpcoming && styles.phaseMarkerUpcoming,
                ]}>
                  <Text style={styles.phaseIcon}>{phase.icon}</Text>
                  {isCurrent && (
                    <View style={styles.currentBadge}>
                      <Text style={styles.currentBadgeText}>YOU ARE HERE</Text>
                    </View>
                  )}
                </View>

                {/* Phase Info */}
                <View style={styles.phaseInfo}>
                  <Text style={[
                    styles.phaseTitle,
                    isUpcoming && styles.phaseTextUpcoming
                  ]}>
                    {phase.title}
                  </Text>
                  <Text style={[
                    styles.phaseDuration,
                    isUpcoming && styles.phaseTextUpcoming
                  ]}>
                    {phase.duration}
                  </Text>
                  {isCompleted && (
                    <Text style={styles.completedTag}>✓ Completed</Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {/* Current Phase Details Card */}
        <View style={styles.currentCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardIcon}>{currentPhase.icon}</Text>
            <View style={styles.cardHeaderText}>
              <Text style={styles.cardTitle}>{currentPhase.title}</Text>
              <Text style={styles.cardDuration}>{currentPhase.duration}</Text>
            </View>
          </View>

          <Text style={styles.cardDescription}>{currentPhase.description}</Text>

          {/* Today's Daily Actions */}
          <View style={styles.dailySection}>
            <Text style={styles.sectionTitle}>📅 Today's Actions</Text>
            {currentPhase.dailyActions.map((action, idx) => {
              const completed = isActionCompleted(localTimeline.currentPhase, idx);
              return (
                <TouchableOpacity
                  key={idx}
                  style={styles.actionItem}
                  onPress={() => toggleDailyAction(localTimeline.currentPhase, idx)}
                >
                  <View style={[
                    styles.checkbox,
                    completed && styles.checkboxCompleted
                  ]}>
                    {completed && <Ionicons name="checkmark" size={18} color="#fff" />}
                  </View>
                  <Text style={[
                    styles.actionText,
                    completed && styles.actionTextCompleted
                  ]}>
                    {action}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Milestones Progress */}
          {currentPhase.milestones && currentPhase.milestones.length > 0 && (
            <View style={styles.milestonesSection}>
              <Text style={styles.sectionTitle}>🎯 Milestones</Text>
              {currentPhase.milestones.map((milestone, idx) => {
                const progress = (milestone.current / milestone.target) * 100;
                return (
                  <View key={idx} style={styles.milestoneItem}>
                    <Text style={styles.milestoneTitle}>{milestone.title}</Text>
                    <View style={styles.progressBarContainer}>
                      <View style={styles.progressBar}>
                        <View style={[styles.progressFill, { width: `${progress}%` }]} />
                      </View>
                      <Text style={styles.progressText}>
                        {milestone.current}/{milestone.target}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Panic Mode Button */}
      <TouchableOpacity
        style={styles.panicButton}
        onPress={() => setShowPanicMode(true)}
      >
        <Text style={styles.panicButtonText}>😰 I'm overwhelmed</Text>
      </TouchableOpacity>

      {/* Panic Mode Modal */}
      <Modal
        visible={showPanicMode}
        animationType="slide"
        onRequestClose={() => setShowPanicMode(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowPanicMode(false)}
          >
            <Ionicons name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <DailyView userProfile={userProfile} />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#bbb',
    marginBottom: 4,
  },
  targetDate: {
    fontSize: 14,
    color: '#666',
  },
  scrollView: {
    flex: 1,
  },
  pathContainer: {
    padding: 24,
    paddingTop: 40,
  },
  phaseContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 40,
    position: 'relative',
  },
  connectingLine: {
    position: 'absolute',
    left: 32,
    top: -40,
    width: 4,
    height: 40,
    backgroundColor: '#333',
  },
  connectingLineCompleted: {
    backgroundColor: '#10b981',
  },
  phaseMarker: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1a1a1a',
    borderWidth: 3,
    borderColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  phaseMarkerCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  phaseMarkerCurrent: {
    backgroundColor: '#8b5cf6',
    borderColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  phaseMarkerUpcoming: {
    opacity: 0.4,
  },
  phaseIcon: {
    fontSize: 28,
  },
  currentBadge: {
    position: 'absolute',
    top: -32,
    backgroundColor: '#8b5cf6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  currentBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  phaseInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  phaseTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  phaseDuration: {
    fontSize: 14,
    color: '#999',
  },
  phaseTextUpcoming: {
    opacity: 0.4,
  },
  completedTag: {
    fontSize: 12,
    color: '#10b981',
    marginTop: 4,
  },
  currentCard: {
    margin: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    borderWidth: 2,
    borderColor: '#8b5cf6',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  cardDuration: {
    fontSize: 16,
    color: '#999',
  },
  cardDescription: {
    fontSize: 16,
    color: '#bbb',
    lineHeight: 24,
    marginBottom: 24,
  },
  dailySection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a0a0a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  checkbox: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxCompleted: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  actionText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  actionTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#666',
  },
  milestonesSection: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    paddingTop: 24,
  },
  milestoneItem: {
    marginBottom: 20,
  },
  milestoneTitle: {
    fontSize: 14,
    color: '#bbb',
    marginBottom: 8,
  },
  progressBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 10,
    backgroundColor: '#333',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#8b5cf6',
  },
  progressText: {
    fontSize: 14,
    color: '#999',
    minWidth: 50,
  },
  panicButton: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: '#dc2626',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#dc2626',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  panicButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: '#1a1a1a',
    padding: 12,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});