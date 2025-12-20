
import { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const QUESTIONS = [
  // 1. Welcome + Name
  {
    id: 1,
    question: "Let's start with your name",
    placeholder: "Enter your name",
    key: "name",
    type: "text",
  },
  
  // 2. Current Status
  {
    id: 2,
    question: "What best describes you?",
    options: [
      "College Student",
      "Recent Graduate",
      "Working Professional",
      "Career Changer",
      "Between Jobs"
    ],
    key: "status",
    type: "options",
  },
  
  // 3. Field/Domain
  {
    id: 3,
    question: "What field are you in?",
    options: [
      "Computer Science/Engineering",
      "Data Science/Analytics",
      "Product Management",
      "Design (UI/UX)",
      "Other Tech Field"
    ],
    key: "field",
    type: "options",
  },
  
  // 4. Year (if student) - Conditional
  {
    id: 4,
    question: "What year are you in?",
    options: ["Freshman", "Sophomore", "Junior", "Senior", "Graduate Student"],
    key: "year",
    type: "options",
    condition: (answers) => answers.status === "College Student",
  },
  
  // 5. Specific Goal (Free text - IMPORTANT)
  {
    id: 5,
    question: "What do you want to achieve?",
    subtitle: "Be specific! This helps us create your personalized path.",
    placeholder: "Example: 'Land SDE internship at FAANG by Summer 2025' or 'Become a senior engineer in 2 years'",
    key: "goal",
    type: "text",
    multiline: true,
  },
  
  // 6. Timeline
  {
    id: 6,
    question: "When do you want to achieve this?",
    subtitle: "This helps us pace your learning journey",
    options: [
      "3 months",
      "6 months",
      "1 year",
      "2 years",
      "No specific deadline"
    ],
    key: "timeline",
    type: "options",
  },
  
  // 7. Skill Level
  {
    id: 7,
    question: "How would you rate your current skill level?",
    subtitle: "In your field overall",
    options: [
      "Beginner - Just starting out",
      "Intermediate - Can build projects",
      "Advanced - Strong foundation"
    ],
    key: "skillLevel",
    type: "options",
  },
  
  // 8. Current Skills (Multi-select)
  {
    id: 8,
    question: "What skills do you already have?",
    subtitle: "Select all that apply. This helps us avoid teaching what you already know.",
    options: [
      "Data Structures & Algorithms",
      "Web Development (Frontend)",
      "Web Development (Backend)",
      "Mobile Development",
      "Machine Learning/AI",
      "System Design",
      "Docker/DevOps",
      "Cloud (AWS/Azure/GCP)",
      "Databases (SQL/NoSQL)",
      "Git/Version Control",
      "None yet - Just starting"
    ],
    key: "currentSkills",
    type: "multiselect",
  },
  
  // 9. Daily Time Commitment
  {
    id: 9,
    question: "How much time can you dedicate daily?",
    subtitle: "Be realistic - we'll build a plan that fits your schedule",
    options: [
      "30 minutes",
      "1 hour",
      "2 hours",
      "3+ hours",
      "Varies (weekends more)"
    ],
    key: "dailyTime",
    type: "options",
  },
  
  // 10. Main Blocker
  {
    id: 10,
    question: "What's holding you back the most?",
    subtitle: "Understanding this helps us support you better",
    options: [
      "Don't know what to learn",
      "Not enough time",
      "Lack of confidence",
      "Feel overwhelmed",
      "No clear direction",
      "Procrastination"
    ],
    key: "blocker",
    type: "options",
  },
];

export default function Onboarding({ onComplete }) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [textInput, setTextInput] = useState('');
  const [selectedMultiple, setSelectedMultiple] = useState([]);

  // Filter out conditional questions that don't apply
  const getVisibleQuestions = () => {
    return QUESTIONS.filter(q => !q.condition || q.condition(answers));
  };

  const visibleQuestions = getVisibleQuestions();
  const question = visibleQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === visibleQuestions.length - 1;

  const handleAnswer = async (answer) => {
    const newAnswers = { ...answers, [question.key]: answer };
    setAnswers(newAnswers);

    if (isLastQuestion) {
      // Last question - save and complete
      try {
        await AsyncStorage.setItem('userProfile', JSON.stringify(newAnswers));
        await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
        onComplete(newAnswers);
      } catch (error) {
        console.error('Error saving onboarding:', error);
      }
    } else {
      // Next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setTextInput('');
      setSelectedMultiple([]);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setTextInput('');
      setSelectedMultiple([]);
    }
  };

  const handleMultiSelectToggle = (option) => {
    setSelectedMultiple(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };

  const handleMultiSelectSubmit = () => {
    if (selectedMultiple.length > 0) {
      handleAnswer(selectedMultiple);
    }
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Back button */}
      {currentQuestionIndex > 0 && (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBack}
        >
          <Ionicons name="chevron-back" size={20} color="#999" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      )}

      {/* Progress indicator */}
      <View style={styles.progressContainer}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>
            Question {currentQuestionIndex + 1} of {visibleQuestions.length}
          </Text>
          <Text style={styles.progressText}>
            {Math.round(((currentQuestionIndex + 1) / visibleQuestions.length) * 100)}%
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill,
              { width: `${((currentQuestionIndex + 1) / visibleQuestions.length) * 100}%` }
            ]}
          />
        </View>
      </View>

      {/* Question */}
      <Text style={styles.question}>{question.question}</Text>
      
      {question.subtitle && (
        <Text style={styles.subtitle}>{question.subtitle}</Text>
      )}

      {/* Answer options */}
      {question.type === 'options' && (
        <View style={styles.optionsContainer}>
          {question.options.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.optionButton}
              onPress={() => handleAnswer(option)}
              activeOpacity={0.7}
            >
              <Text style={styles.optionText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {question.type === 'multiselect' && (
        <View style={styles.multiselectContainer}>
          <View style={styles.optionsContainer}>
            {question.options.map((option) => {
              const isSelected = selectedMultiple.includes(option);
              return (
                <TouchableOpacity
                  key={option}
                  onPress={() => handleMultiSelectToggle(option)}
                  activeOpacity={0.7}
                  style={[
                    styles.multiselectButton,
                    isSelected && styles.multiselectButtonSelected
                  ]}
                >
                  <View style={styles.multiselectContent}>
                    <View style={[
                      styles.checkbox,
                      isSelected && styles.checkboxSelected
                    ]}>
                      {isSelected && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                    <Text style={styles.multiselectText}>{option}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          
          <TouchableOpacity
            onPress={handleMultiSelectSubmit}
            disabled={selectedMultiple.length === 0}
            style={[
              styles.submitButton,
              selectedMultiple.length === 0 && styles.submitButtonDisabled
            ]}
            activeOpacity={0.7}
          >
            <Text style={styles.submitButtonText}>
              {isLastQuestion ? "Complete Setup →" : "Continue →"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {question.type === 'text' && (
        <View style={styles.textInputContainer}>
          <TextInput
            value={textInput}
            onChangeText={setTextInput}
            placeholder={question.placeholder}
            placeholderTextColor="#777"
            multiline={question.multiline}
            numberOfLines={question.multiline ? 4 : 1}
            style={[
              styles.input,
              question.multiline && styles.inputMultiline
            ]}
          />
          <TouchableOpacity
            onPress={() => handleAnswer(textInput)}
            disabled={!textInput.trim()}
            style={[
              styles.submitButton,
              !textInput.trim() && styles.submitButtonDisabled
            ]}
            activeOpacity={0.7}
          >
            <Text style={styles.submitButtonText}>
              {isLastQuestion ? "Complete Setup →" : "Continue →"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
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
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    color: '#999',
    fontSize: 16,
    marginLeft: 4,
  },
  progressContainer: {
    marginBottom: 32,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressText: {
    color: '#777',
    fontSize: 14,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#1a1a1a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  question: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#999',
    marginBottom: 32,
    lineHeight: 22,
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
  multiselectContainer: {
    gap: 16,
  },
  multiselectButton: {
    backgroundColor: '#1a1a1a',
    padding: 20,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#333',
  },
  multiselectButtonSelected: {
    backgroundColor: '#1e3a8a',
    borderColor: '#3b82f6',
  },
  multiselectContent: {
    flexDirection: 'row',
    alignItems: 'center',
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
  multiselectText: {
    color: '#fff',
    fontSize: 18,
    flex: 1,
  },
  textInputContainer: {
    gap: 16,
  },
  input: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
    color: '#fff',
    fontSize: 18,
  },
  inputMultiline: {
    minHeight: 120,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#3b82f6',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#333',
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});