// src/services/AI/panicMode.js

import { callGroq } from './groqClient';

export async function getTaskRecommendation(userInput, userContext) {
  try {
    return await callGroq([
      {
        role: 'system',
        content: 'You are a supportive guide. Give ONE specific task (30-60 min). Be encouraging.'
      },
      {
        role: 'user',
        content: `Goal: ${userContext.goal}\nStressed about: ${userInput}\n\nGive ONE task to do now.`
      }
    ], 150);
  } catch (error) {
    return "Take a 30-minute break. You've got this. 💙";
  }
}