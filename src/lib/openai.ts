import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface GeneratedQuiz {
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

export async function generateMCQsFromText(text: string, category: string): Promise<GeneratedQuiz[]> {
  const fallbackQuizzes = (_reason: string): GeneratedQuiz[] => {
    // Extract meaningful sentences from the article text
    const sentences = text
      .split(/[.!?]/)
      .map(s => s.trim())
      .filter(s => s.length > 40 && s.length < 200);

    // Helper to pick a sentence by index (looping if not enough sentences)
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
      },
    ];
  };

  if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your-key-here') {
    return fallbackQuizzes("OpenAI API Key is missing or default");
  }

  const prompt = `
You are a subject-matter expert and question paper setter for Indian Defence entrance examinations — CDS (Combined Defence Services), NDA (National Defence Academy), and AFCAT (Air Force Common Admission Test).

Your task: Based on the news article below (category: ${category}), generate exactly 3 MCQs in the authentic style of CDS/NDA/AFCAT exams.

STRICT RULES FOR QUESTION STYLE:
1. Use concise, formal language exactly as seen in CDS/NDA/AFCAT papers. No conversational tone.
2. Vary the question types across the 3 questions — use different openers such as:
   - "Which of the following..." / "Consider the following statements..."
   - "Who among the following..." / "With reference to..."
   - "What is/was..." / "In the context of..."
   - Assertion (A) and Reason (R) format where the candidate picks which is correct.
3. Options must be realistic and plausible — avoid obviously silly distractors. All 4 options must look like they could be correct to an unprepared candidate, exactly like real exam options.
4. Difficulty should be moderate to hard — not trivially easy.
5. The explanation must be concise (2-3 sentences), factual, and exam-oriented.
6. Do NOT use phrases like "Based on the article" or "According to the text" — write standalone questions as they appear in a real question paper.
7. Ensure correctAnswer is EXACTLY one of the 4 options (character-for-character match).

Respond ONLY with a valid JSON object — no markdown, no extra text:
{
  "quizzes": [
    {
      "question": "...",
      "options": ["...", "...", "...", "..."],
      "correctAnswer": "...",
      "explanation": "..."
    }
  ]
}

News article text:
"${text.substring(0, 2500)}"
`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.5,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    if (!content) return fallbackQuizzes("AI returned empty response");
    
    const parsed = JSON.parse(content);
    if (parsed.quizzes && Array.isArray(parsed.quizzes)) {
      return parsed.quizzes;
    }
    if (Array.isArray(parsed)) {
      return parsed as GeneratedQuiz[];
    }
    return Object.values(parsed).find(Array.isArray) as GeneratedQuiz[] || fallbackQuizzes("AI response structure unexpected");
  } catch (error) {
    console.error('Error generating MCQs:', error);
    return fallbackQuizzes("OpenAI API reported an error or is out of credits");
  }
}
