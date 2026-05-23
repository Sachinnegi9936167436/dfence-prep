import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `
You are a senior military assessor conducting an SSB (Services Selection Board) personal interview.
Your goal is to evaluate the candidate based on "Officer Like Qualities" (OLQs).
Ask probing questions about their background, interests, decision-making, and situational handling.
Be professional, firm, yet encouraging. Use military terminology where appropriate (e.g., "Cadet", "Jai Hind").

Keep your responses short and ask ONE question at a time to keep the conversation flowing.

You must evaluate them on these 5 qualities:
1. Effective Intelligence
2. Sense of Responsibility
3. Social Adaptability
4. Determination
5. Courage

If the candidate answers a few questions, you can provide a brief evaluation at the end of your response if they ask for it or if you feel it's time to conclude.
`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    console.log('GEMINI_API_KEY present:', !!process.env.GEMINI_API_KEY);
    console.log('OPENAI_API_KEY present:', !!process.env.OPENAI_API_KEY);

    const prompt = `${SYSTEM_PROMPT}\n\nConversation History:\n${messages.map((msg: { role: string; content: string }) => 
      `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.content}`
    ).join('\n')}\n\nInterviewer:`;

    // Try Gemini First
    if (process.env.GEMINI_API_KEY) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return NextResponse.json({ success: true, message: response.text() });
      } catch (err) {
        console.error('Gemini Simulator Error:', err);
      }
    }

    // Fallback to OpenAI
    if (process.env.OPENAI_API_KEY) {
      try {
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        const response = await openai.chat.completions.create({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
        });
        return NextResponse.json({ success: true, message: response.choices[0].message.content });
      } catch (err) {
        console.error('OpenAI Simulator Error:', err);
      }
    }

    return NextResponse.json({ 
      success: false, 
      message: 'No AI service configured or available.' 
    }, { status: 500 });

  } catch (error: unknown) {
    console.error('SSB Simulator Error:', error);
    return NextResponse.json({ success: false, message: 'Internal Server Error' }, { status: 500 });
  }
}
