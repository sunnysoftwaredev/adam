import OpenAI from 'openai';

const openai = new OpenAI();

const MODEL = 'gpt-4-1106-preview';

export const ask = async (prompt: string): Promise<string> => {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: MODEL,
  });

  if (!chatCompletion.choices?.[0]?.message?.content) {
    throw new Error('Received null or undefined response from OpenAI. Please check if the model is correctly specified and the API is responding properly.');
  }

  const response = chatCompletion.choices[0].message.content;
  
  return response;
};
