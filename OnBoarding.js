import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const QUESTIONS = [
  {
    id: 1,
    question: "What's your name?",
    placeholder: "Enter your name",
    key: "name",
  },
  {
    id: 2,
    question: "What year are you in?",
    options: ["Freshman", "Sophomore", "Junior", "Senior"],
    key: "year",
  },
  {
    id: 3,
    question: "What's your career goal?",
    options: ["SDE", "Data Science", "Product Manager", "Other"],
    key: "goal",
  },
  {
    id: 4,
    question: "Current skill level?",
    options: ["Beginner", "Some Experience", "Intermediate", "Advanced"],
    key: "skillLevel",
  },
  {
    id: 5,
    question: "What's stressing you most right now?",
    placeholder: "Type here...",
    key: "currentStress",
    multiline: true,
  },
];

export default function Onboarding({ onComplete }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [textInput, setTextInput] = useState('');

  const question = QUESTIONS[currentQuestion];

  const handleAnswer = async (answer) => {
    const newAnswers = { ...answers, [question.key]: answer };
    setAnswers(newAnswers);

    if (currentQuestion === QUESTIONS.length - 1) {
      // Last question - save and complete
      await AsyncStorage.setItem('userProfile', JSON.stringify(newAnswers));
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      onComplete(newAnswers);
    } else {
      // Next question
      setCurrentQuestion(currentQuestion + 1);
      setTextInput('');
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress indicator */}
      <Text style={styles.progress}>
        {currentQuestion + 1} / {QUESTIONS.length}
      </Text>

      {/* Question */}
      <Text style={styles.question}>{question.question}</Text>

      {/* Answer options */}
      {question.options ? (
        // Multiple choice
        <View style={styles.optionsContainer}>
          {question.options.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.optionButton}
              onPress={() => handleAnswer(option)}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        // Text input
        <View>
          <TextInput
            style={[styles.input, question.multiline && styles.inputMultiline]}
            placeholder={question.placeholder}
            placeholderTextColor="#777"
            value={textInput}
            onChangeText={setTextInput}
            multiline={question.multiline}
          />
          <TouchableOpacity
            style={styles.nextButton}
            onPress={() => handleAnswer(textInput)}
            disabled={!textInput.trim()}
          >
            <Text style={styles.nextButtonText}>
              {currentQuestion === QUESTIONS.length - 1 ? "Get Started" : "Next"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
    padding: 20,
    justifyContent: 'center',
  },
  progress: {
    position: 'absolute',
    top: 60,
    right: 20,
    color: '#777',
    fontSize: 14,
  },
  question: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 30,
  },
  optionsContainer: {
    gap: 12,
  },
  optionButton: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#3b82f6',
    color: '#fff',
    fontSize: 16,
    marginBottom: 20,
  },
  inputMultiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  nextButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});