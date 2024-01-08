import OpenAI from 'openai';

const openai = new OpenAI();

const MODEL = 'gpt-4-1106-preview';

export const ask = async (prompt: string): Promise<string> => {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: MODEL,
  });

  if (!chatCompletion?.choices || !chatCompletion.choices[0]?.message) {
    throw new Error('Invalid response structure from GPT');
  }

  const response = chatCompletion.choices[0].message.content;
  
  if (response === null) {
    throw new Error('Unexpected null response content from GPT');
  }

  return response;
};
