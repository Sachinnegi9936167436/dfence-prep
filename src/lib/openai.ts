import { GoogleGenerativeAI } from "@google/generative-ai";
import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface GeneratedQuiz {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hostileExplanation?: string;
}

const fallbackQuizzes = (text: string, category: string): GeneratedQuiz[] => {
  const sentences = text
    .split(/[.!?]/)
    .map(s => s.trim())
    .filter(s => s.length > 40 && s.length < 200);

  const getSentence = (i: number) => sentences[i % Math.max(sentences.length, 1)] || `${category} related development`;

  const s1 = getSentence(0);
  const s2 = getSentence(1);
  const s3 = getSentence(2);

  return [
    {
      question: `With reference to recent ${category} developments, which of the following statements is most accurate?`,
      options: [
        s1.substring(0, 80),
        `There have been no significant changes in the ${category} sector recently`,
        `The ${category} situation remains unchanged from last quarter`,
        `International agencies have suspended ${category}-related activities`,
      ],
      correctAnswer: s1.substring(0, 80),
      explanation: `${s1}. This reflects the latest developments in the ${category} domain that are relevant to current affairs for defence examinations.`,
      hostileExplanation: `Negative, Cadet. Your situational awareness is lacking. The correct intel is: ${s1.substring(0, 60)}...`
    },
    {
      question: `In the context of ${category}, consider the following statement: "${s2.substring(0, 60)}..." — what does this indicate?`,
      options: [
        `Significant progress and activity in the ${category} sector`,
        `A decline in ${category} related engagements`,
        `Withdrawal from international ${category} commitments`,
        `A pause in ongoing ${category} operations`,
      ],
      correctAnswer: `Significant progress and activity in the ${category} sector`,
      explanation: `${s2}. This statement highlights ongoing activity and development in the ${category} field, which is frequently examined in CDS, NDA, and AFCAT papers.`,
      hostileExplanation: `Recalibrate your focus! The correct strategic assessment is significant progress in the ${category} sector. Keep up.`
    },
    {
      question: `Which of the following best describes the current focus in the domain of ${category} as per recent reports?`,
      options: [
        `Active engagement and strategic updates`,
        `Complete diplomatic freeze on ${category} matters`,
        `Reduction in budgetary allocation for ${category}`,
        `Transfer of ${category} responsibilities to state governments`,
      ],
      correctAnswer: `Active engagement and strategic updates`,
      explanation: `${s3}. Recent developments indicate active engagement and updates in ${category}, a topic of importance for aspirants of CDS, NDA, and AFCAT examinations.`,
      hostileExplanation: `Incorrect. An officer must know this. The domain of ${category} is seeing active engagement and updates.`
    },
  ];
};

export async function generateMCQsFromText(text: string, category: string): Promise<GeneratedQuiz[]> {
  const prompt = `
    You are a subject-matter expert for Indian Defence exams (CDS, NDA, AFCAT).
    Based on the news below (category: ${category}), generate exactly 3 MCQs.
    
    STRICT RULES:
    1. Format: STANDALONE questions as seen in real papers.
    2. Respond ONLY with a valid JSON object:
    {
      "quizzes": [
        {
          "question": "...",
          "options": ["...", "...", "...", "..."],
          "correctAnswer": "...",
          "explanation": "...",
          "hostileExplanation": "..."
        }
      ]
    }
    
    News: "${text.substring(0, 3000)}"
  `;

  // Try Gemini First
  if (process.env.GEMINI_API_KEY) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      let content = response.text();
      
      // Clean up markdown if Gemini returns it
      content = content.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const parsed = JSON.parse(content);
      return parsed.quizzes || parsed;
    } catch (err) {
      console.error('Gemini MCQ Error:', err);
    }
  }

  // Fallback to OpenAI
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-key-here') {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
        response_format: { type: 'json_object' }
      });
      const content = response.choices[0].message.content;
      if (content) {
        const parsed = JSON.parse(content);
        return parsed.quizzes || parsed;
      }
    } catch (err) {
      console.error('OpenAI MCQ Error:', err);
    }
  }

  return fallbackQuizzes(text, category);
}

export async function generateSummaryFromText(text: string): Promise<string> {
  const prompt = `
    You are an expert news editor. Provide a comprehensive summary of the following news article in 5-7 detailed bullet points.
    Use simple, human-readable English.
    
    Article: "${text.substring(0, 3500)}"
  `;

  // Try Gemini First
  if (process.env.GEMINI_API_KEY) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (err) {
      console.error('Gemini Summary Error:', err);
    }
  }

  // Fallback to OpenAI
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your-key-here') {
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
      });
      return response.choices[0].message.content || text.substring(0, 300) + "...";
    } catch (err) {
      console.error('OpenAI Summary Error:', err);
    }
  }

  return text.substring(0, 300) + "...";
}
