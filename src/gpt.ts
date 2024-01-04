import OpenAI from 'openai';

const openai = new OpenAI();

const MODEL = 'gpt-4';

export const ask = async (prompt: string): Promise<string> => {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: MODEL,
  });

  if (!chatCompletion.choices || chatCompletion.choices.length === 0) {
    throw new Error('Unexpected empty response from GPT');
  }
  
  const [{ message: { content: response } }] = chatCompletion.choices;

  if (response === null) {
    throw new Error('Unexpected null response from GPT');
  }

  return response;
};