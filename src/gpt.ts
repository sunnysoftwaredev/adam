import OpenAI from 'openai';

const OPENAI = new OpenAI();

const MODEL = 'gpt-4';

export const ask = async (prompt: string): Promise<string> => {
  const chatCompletion = await OPENAI.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: MODEL,
  });
  
  if (!chatCompletion.choices[0]?.message.content) {
    throw new Error('Unexpected null response from GPT');
  }

  return chatCompletion.choices[0].message.content;
};