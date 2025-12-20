import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTaskRecommendation } from './src/services/AI/panicMode';

export default function DailyView({ userProfile }) {
  const [input, setInput] = useState('');
  const [task, setTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [loadingTask, setLoadingTask] = useState(true);

  useEffect(() => {
    loadTodaysTask();
  }, []);

  const getTodayKey = () => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    return `task_${today}`;
  };

  const loadTodaysTask = async () => {
    try {
      const todayKey = getTodayKey();
      const savedTask = await AsyncStorage.getItem(todayKey);
      
     if (savedTask) {
        const taskData = JSON.parse(savedTask);
        setTask(taskData.task);
        setDone(taskData.completed);
        setInput(taskData.userInput || '');
      }
    } catch (error) {
      console.error('Error loading task:', error);
    } finally {
      setLoadingTask(false);
   }
  };

  const saveTask = async (taskText, userInputText, isCompleted) => {
    try {
      const todayKey = getTodayKey();
      const taskData = {
        task: taskText,
        userInput: userInputText,
        completed: isCompleted,
        date: new Date().toISOString(),
        userProfile: {
          year: userProfile.year,
          goal: userProfile.goal,
        }
      };
      
      await AsyncStorage.setItem(todayKey, JSON.stringify(taskData));
      
      // Also save to history
      await addToHistory(taskData);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const addToHistory = async (taskData) => {
    try {
      const historyKey = 'task_history';
      const existingHistory = await AsyncStorage.getItem(historyKey);
      const history = existingHistory ? JSON.parse(existingHistory) : [];
      
      // Check if task for this date already exists
      const todayKey = getTodayKey();
      const existingIndex = history.findIndex(item => item.key === todayKey);
      
      if (existingIndex >= 0) {
        // Update existing
        history[existingIndex] = { ...taskData, key: todayKey };
      } else {
        // Add new
        history.unshift({ ...taskData, key: todayKey });
      }
      
      // Keep only last 30 days
      const recentHistory = history.slice(0, 30);
      await AsyncStorage.setItem(historyKey, JSON.stringify(recentHistory));
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  };

  const handleGetTask = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    const userContext = {
      year: userProfile.year,
      goal: userProfile.goal,
    };
    const recommendation = await getTaskRecommendation(input, userContext);
    setTask(recommendation);
    setDone(false);
    setLoading(false);
    
    // Save the task
    await saveTask(recommendation, input, false);
  };

  const handleToggleDone = async () => {
    const newDoneState = !done;
    setDone(newDoneState);
    
    // Save updated completion status
    await saveTask(task, input, newDoneState);
  };

  if (loadingTask) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.greeting}>Hey {userProfile.name}! 👋</Text>
      <Text style={styles.subtitle}>Goal: {userProfile.goal} · {userProfile.year}</Text>
      
      {!task ? (
        <>
          <Text style={styles.title}>What's stressing you?</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Type here..."
            placeholderTextColor="#777"
            value={input}
            onChangeText={setInput}
            multiline
          />

          <TouchableOpacity style={styles.button} onPress={handleGetTask}>
            <Text style={styles.buttonText}>Get My Task</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Today's Focus</Text>
          
          <View style={styles.card}>
            <Text style={styles.cardText}>{task}</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, done && styles.buttonDone]}
            onPress={handleToggleDone}
          >
            <Text style={styles.buttonText}>
              {done ? "Done! ✓" : "Mark Done"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.encouragement}>
            {done ? "Great work today! 🎉" : "This is enough for today. ✨"}
          </Text>

          {/* Option to get new task */}
          <TouchableOpacity
            style={styles.linkButton}
            onPress={() => {
              setTask('');
              setInput('');
              setDone(false);
            }}
          >
            <Text style={styles.linkText}>Get a different task</Text>
          </TouchableOpacity>
        </>
      )}

      {loading && <ActivityIndicator size="large" color="#3b82f6" style={{marginTop: 20}} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  contentContainer: {
    padding: 20,
    paddingTop: 60,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#3b82f6',
    marginBottom: 30,
  },
  title: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
    color: '#fff',
    fontSize: 16,
    minHeight: 100,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDone: {
    backgroundColor: '#10b981',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#1a1a1a',
    padding: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#10b981',
    marginBottom: 24,
  },
  cardText: {
    fontSize: 18,
    color: '#fff',
    lineHeight: 26,
  },
  encouragement: {
    textAlign: 'center',
    color: '#a3a3a3',
    fontSize: 14,
    marginBottom: 20,
  },
  linkButton: {
    padding: 12,
    alignItems: 'center',
  },
  linkText: {
    color: '#3b82f6',
    fontSize: 14,
  },
});
