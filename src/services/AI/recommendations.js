// src/services/AI/recommendations.js

import { callGroqJSON } from './groqClient';

export async function generateRecommendations(userProfile) {
  try {
    return await callGroqJSON([
      {
        role: 'system',
        content: `You are a career advisor. Analyze goals and return ONLY JSON:
{
  "critical": [{"skill": "Name", "reason": "Why", "timeNeeded": "X weeks"}],
  "important": [{"skill": "Name", "reason": "Why", "timeNeeded": "X weeks"}],
  "niceToHave": [{"skill": "Name", "reason": "Why", "timeNeeded": "X weeks"}]
}`
      },
      {
        role: 'user',
        content: `Goal: "${userProfile.goal}"
Timeline: ${userProfile.timeline}
Current Skills: ${userProfile.currentSkills?.join(', ')}

What do they ACTUALLY need to learn? Give 3-5 critical, 3-4 important, 2-3 nice-to-have.`
      }
    ], 1500);
  } catch (error) {
    return {
      critical: [
        { skill: "Core Skills", reason: "Foundation", timeNeeded: "2-3 months" }
      ],
      important: [
        { skill: "Portfolio", reason: "Proof of work", timeNeeded: "1 month" }
      ],
      niceToHave: []
    };
  }
}