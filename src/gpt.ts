
import OpenAI from 'openai';

const openai = new OpenAI();

const MODEL = 'gpt-4';

export const ask = async (prompt: string): Promise<string> => {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: MODEL,
  });

  // Check if response contains choices object, its first element and the message object
  if (
    !chatCompletion.hasOwnProperty('choices') || 
    !chatCompletion.choices[0] || 
    !chatCompletion.choices[0].hasOwnProperty('message') || 
    !chatCompletion.choices[0].message.hasOwnProperty('content')
  ) {
    throw new Error('Unexpected format in the response from GPT');
  }

  const response = chatCompletion.choices[0].message.content;

  if (response === null) {
    throw new Error('Unexpected null response from GPT');
  }

  return response;
};
