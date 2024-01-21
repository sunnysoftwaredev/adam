import OpenAI from 'openai';

const openai = new OpenAI();

const MODEL = 'gpt-4-1106-preview';

export const ask = async (prompt: string): Promise<string> => {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: MODEL,
  });

  const choice = chatCompletion.choices[0];
  
  if (!choice?.message?.content) {
    throw new Error('Unexpected null or undefined response from GPT');
  }
  
  return choice.message.content;
};
