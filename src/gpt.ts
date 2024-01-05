import OpenAI from 'openai';

const openai = new OpenAI();

const MODEL = 'gpt-4';

export const ask = async (prompt: string): Promise<string> => {
  try{
    const chatCompletion = await openai.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: MODEL,
    });
    
    const { choices } = chatCompletion;
    if (!choices.length){
      throw new Error('No responses received from GPT');
    }

    const { message } = choices[0];
    if (!message.content){
      throw new Error('Unexpected null response from GPT');
    }

    return message.content;
  }
  catch(err){
    console.error(err);
    throw err;
  }
};