// src/services/AI/groqClient.js

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

export async function callGroq(messages, maxTokens = 500) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.7,
        max_tokens: maxTokens,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message);
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq error:', error);
    throw error;
  }
}

export async function callGroqJSON(messages, maxTokens = 1000) {
  const response = await callGroq(messages, maxTokens);
  const clean = response.replace(/```json\n?|```\n?/g, '').trim();
  return JSON.parse(clean);
}