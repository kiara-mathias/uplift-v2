const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY;

export async function getTaskRecommendation(userInput, userContext) {
  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'You are a supportive guide helping overwhelmed students. Give ONE specific task (30-60 min). Be encouraging and practical.'
          },
          {
            role: 'user',
            content: `User: ${userContext.year}, Goal: ${userContext.goal}\nStressed about: ${userInput}\n\nGive them ONE specific task to do today.`
          }
        ],
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('API Error:', data);
      throw new Error(data.error?.message || 'API request failed');
    }
    
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error:', error);
    return 'Take a 30-minute break and come back with a clear mind.';
  }
}
