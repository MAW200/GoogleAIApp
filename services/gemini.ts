import { GoogleGenAI, Type, Schema } from "@google/genai";
import { KnowledgeGap, UserContext, InterviewAnswer } from "../types";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API_KEY not found in environment");
  return new GoogleGenAI({ apiKey });
};

// Helper to convert Blob to Base64 (strip data URI prefix)
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const transcribeVideo = async (videoBlob: Blob): Promise<string> => {
  const ai = getClient();
  const base64Data = await blobToBase64(videoBlob);

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "video/mp4", // Defaulting to generic mp4/webm container handling
              data: base64Data,
            },
          },
          { text: "Transcribe the speech in this video interview answer verbatim. If there is no speech, say '[No speech detected]'." }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Transcription error:", error);
    return "[Error generating transcript]";
  }
};

export const generateGaps = async (context: UserContext): Promise<KnowledgeGap[]> => {
  const ai = getClient();
  
  const prompt = `
    You are an AI Orchestrator for an employee offboarding system.
    The employee is leaving the company. Your goal is to identify "Knowledge Gaps" based on their role and department.
    
    Employee Context:
    Name: ${context.name}
    Role: ${context.role}
    Department: ${context.department}
    
    Generate 4 specific, high-impact knowledge gaps that often occur when someone in this specific role leaves. 
    For each gap, provide a structured interview question script.
    Ensure the tone is professional, investigative but supportive.
  `;

  const schema: Schema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        id: { type: Type.STRING, description: "Unique identifier (e.g., gap-1)" },
        title: { type: Type.STRING, description: "Short title of the knowledge gap (e.g., 'Legacy Payment API')" },
        summary: { type: Type.STRING, description: "Why this is a risk (e.g., 'You are the only maintainer of X')" },
        primaryQuestion: { type: Type.STRING, description: "The main open-ended question to ask." },
        memoryPrompt: { type: Type.STRING, description: "A specific trigger to help them remember (e.g., 'Think about the Q4 outage...')" },
        followUpQuestion: { type: Type.STRING, description: "A specific detail-oriented follow-up." },
      },
      required: ["id", "title", "summary", "primaryQuestion", "memoryPrompt", "followUpQuestion"],
    },
  };

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
      systemInstruction: "You are an expert HR Knowledge Transfer specialist.",
    },
  });

  if (response.text) {
    return JSON.parse(response.text) as KnowledgeGap[];
  }
  
  return [];
};

export const generateFinalHandover = async (context: UserContext, gaps: KnowledgeGap[], answers: Record<string, InterviewAnswer>): Promise<string> => {
  const ai = getClient();

  // Format data for the model
  const interviewData = gaps.map(gap => {
    const ans = answers[gap.id]?.content || "No answer provided.";
    return `Topic: ${gap.title}\nQuestion: ${gap.primaryQuestion}\nTranscript of Video Answer: ${ans}\n---\n`;
  }).join("\n");

  const prompt = `
    Create a professional Knowledge Handover Document based on the following video interview transcripts.
    
    Employee: ${context.name} (${context.role})
    
    Transcript:
    ${interviewData}
    
    Output Format: Markdown.
    Structure:
    1. Executive Summary
    2. Critical Risks Identified
    3. Detailed Knowledge Transfer (per topic)
    4. Recommended Next Steps for the team taking over.
  `;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text || "Failed to generate summary.";
};