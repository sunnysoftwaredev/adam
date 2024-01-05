import OpenAI from 'openai';

const openai = new OpenAI();

const MODEL = 'gpt-4';

export const ask = async (prompt: string): Promise<string> => {
  try {
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: MODEL,
    });

    const response = chatCompletion.choices[0]?.message?.content;
  
    if (response === null || response === undefined) {
      throw new Error('Unexpected null or undefined response from GPT');
    }

    return response;
  } catch (error) {
    throw new Error(`Failed to create chat completion: ${error.message}`);
  }
};
