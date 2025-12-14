import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getTaskRecommendation } from './src/services/ai';

export default function DailyView({ userProfile }) {
  const [input, setInput] = useState('');
  const [task, setTask] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleGetTask = async () => {
    if (!input.trim()) return;
    
    setLoading(true);
    const userContext = {
      year: userProfile.year,
      goal: userProfile.goal,
    };
    const recommendation = await getTaskRecommendation(input, userContext);
    setTask(recommendation);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.greeting}>Hey {userProfile.name}! 👋</Text>
      <Text style={styles.subtitle}>Goal: {userProfile.goal} · {userProfile.year}</Text>
      
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

      {loading && <ActivityIndicator size="large" color="#3b82f6" />}

      {!loading && task !== '' && (
        <>
          <View style={styles.card}>
            <Text style={styles.cardText}>{task}</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, done && styles.buttonDone]}
            onPress={() => setDone(!done)}
          >
            <Text style={styles.buttonText}>
              {done ? "Done! ✓" : "Mark Done"}
            </Text>
          </TouchableOpacity>

          <Text style={styles.encouragement}>
            This is enough for today. ✨
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
    paddingTop: 60,
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
  },
});
