// RecommendationReview.js (Minimal)

import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RecommendationReview({ recommendations, onConfirm }) {
  const [selected, setSelected] = useState({
    critical: recommendations?.critical || [],
    important: recommendations?.important || [],
    niceToHave: recommendations?.niceToHave || [],
  });

  const toggleSkill = (category, skill) => {
    setSelected(prev => ({
      ...prev,
      [category]: prev[category].some(s => s.skill === skill.skill)
        ? prev[category].filter(s => s.skill !== skill.skill)
        : [...prev[category], skill]
    }));
  };

  const isSelected = (category, skill) => 
    selected[category].some(s => s.skill === skill.skill);

  const totalSelected = 
    selected.critical.length + 
    selected.important.length + 
    selected.niceToHave.length;

  const renderSection = (title, icon, category, skills) => (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{icon} {title}</Text>
      {skills?.map((skill, idx) => (
        <TouchableOpacity
          key={idx}
          style={[styles.card, isSelected(category, skill) && styles.cardSelected]}
          onPress={() => toggleSkill(category, skill)}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.checkbox, isSelected(category, skill) && styles.checkboxSelected]}>
              {isSelected(category, skill) && <Ionicons name="checkmark" size={16} color="#fff" />}
            </View>
            <Text style={styles.skillName}>{skill.skill}</Text>
            <Text style={styles.time}>{skill.timeNeeded}</Text>
          </View>
          <Text style={styles.reason}>{skill.reason}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Here's what you need</Text>
        <Text style={styles.subtitle}>Customize if needed</Text>

        {renderSection('CRITICAL', '✅', 'critical', recommendations?.critical)}
        {renderSection('IMPORTANT', '💡', 'important', recommendations?.important)}
        {renderSection('NICE TO HAVE', '🎯', 'niceToHave', recommendations?.niceToHave)}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => onConfirm(selected)}
          disabled={totalSelected === 0}
        >
          <Text style={styles.buttonText}>
            Create Timeline ({totalSelected} selected) →
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#999',
    marginBottom: 12,
  },
  card: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#333',
  },
  cardSelected: {
    backgroundColor: '#1e3a8a',
    borderColor: '#3b82f6',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#666',
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  skillName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  time: {
    fontSize: 14,
    color: '#999',
  },
  reason: {
    fontSize: 14,
    color: '#bbb',
    marginLeft: 36,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0a0a0a',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    padding: 20,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});