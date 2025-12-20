// src/services/AI/timeline.js

import { callGroqJSON } from './groqClient';

export async function generateTimeline(selectedSkills, userProfile) {
  try {
    const targetDate = new Date();
    const months = { '3 months': 3, '6 months': 6, '1 year': 12, '2 years': 24 };
    targetDate.setMonth(targetDate.getMonth() + (months[userProfile.timeline] || 6));
    
    const timeline = await callGroqJSON([
      {
        role: 'system',
        content: `Create a learning timeline. Return ONLY JSON:
{
  "mainGoal": "Goal",
  "phases": [{
    "id": "phase_1",
    "title": "Name",
    "description": "What it achieves",
    "icon": "📚",
    "duration": "X weeks",
    "dailyActions": ["Action 1", "Action 2"],
    "milestones": [{"title": "Milestone", "target": 50, "current": 0}]
  }]
}`
      },
      {
        role: 'user',
        content: `Goal: "${userProfile.goal}"
Timeline: ${userProfile.timeline}
Skills to learn: ${selectedSkills.map(s => s.skill).join(', ')}
Daily time: ${userProfile.dailyTime}

Create 3-5 phases with daily actions and milestones.`
      }
    ], 2000);
    
    return {
      ...timeline,
      targetDate: targetDate.toISOString().split('T')[0],
      currentPhase: 0
    };
  } catch (error) {
    return {
      mainGoal: userProfile.goal,
      currentPhase: 0,
      phases: [
        {
          id: "phase_1",
          title: "Getting Started",
          description: "Build foundation",
          icon: "📚",
          duration: "8 weeks",
          dailyActions: ["Learn and practice"],
          milestones: [{ title: "Complete basics", target: 1, current: 0 }]
        }
      ]
    };
  }
}

export function getCurrentDailyActions(timeline) {
  return timeline.phases[timeline.currentPhase]?.dailyActions || [];
}

export function updatePhaseProgress(timeline, phaseIdx, milestoneIdx, newValue) {
  const updated = { ...timeline };
  if (updated.phases[phaseIdx]?.milestones[milestoneIdx]) {
    updated.phases[phaseIdx].milestones[milestoneIdx].current = newValue;
    
    // Check if all milestones done -> move to next phase
    const allDone = updated.phases[phaseIdx].milestones.every(m => m.current >= m.target);
    if (allDone && phaseIdx === timeline.currentPhase && phaseIdx < timeline.phases.length - 1) {
      updated.currentPhase++;
    }
  }
  return updated;
}