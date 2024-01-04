import OpenAI from 'openai';

// OpenAI instance
const openai = new OpenAI();

// Selected model
const MODEL = 'gpt-4';

/**
 * Function to prompt the OpenAI API with a user message
 * @param prompt - the message from the user
 * @returns - the content of the response message
 * @throws - an Error if the response from the API is null
 */
export const ask = async (prompt: string): Promise<string> => {
  // Create a chat completion with the user's prompt
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    model: MODEL,
  });

  // Extract the first response message content
  const response = chatCompletion.choices[0]?.message?.content;

  // If the response is null, throw an unexpected null response error
  if (!response) {
    throw new Error('Unexpected null response from GPT');
  }

  // Return the response message content
  return response;
};