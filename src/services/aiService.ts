import { GoogleGenAI } from "@google/genai";

const getAIClient = () => {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("A chave de API do Gemini (VITE_GEMINI_API_KEY) não foi configurada.");
  }
  return new GoogleGenAI({ apiKey });
};

export const aiService = {
  async generateLessonDescription(params: {
    studentName: string;
    level: string;
    goal: string;
    duration: string;
    observations?: string;
  }) {
    const prompt = `Você é um instrutor de Pilates experiente. Crie uma descrição técnica e motivadora para uma aula de Pilates com as seguintes informações:
    - Aluno: ${params.studentName}
    - Nível: ${params.level}
    - Objetivo: ${params.goal}
    - Duração: ${params.duration}
    - Observações adicionais: ${params.observations || 'Nenhuma'}

    A descrição deve incluir:
    1. Aquecimento focado no objetivo.
    2. Sequência principal de exercícios.
    3. Finalização/Relaxamento.
    
    Seja conciso mas profissional. Retorne apenas o texto da descrição.`;

    try {
      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });
      return response.text;
    } catch (error: any) {
      console.error("Error generating lesson description:", error);
      throw new Error(error.message || "Falha ao gerar descrição da aula com IA.");
    }
  },

  async generateWhatsAppMessages(params: {
    goal: string;
    tone: 'formal' | 'amigável';
    context: string;
  }) {
    const prompt = `Crie 3 variações curtas de mensagens de WhatsApp para um studio de Pilates.
    - Objetivo: ${params.goal}
    - Tom: ${params.tone}
    - Contexto: ${params.context}

    Regras:
    - Devem ser curtas e diretas.
    - Use emojis de forma moderada se o tom for amigável.
    - Retorne as 3 variações em um formato JSON: { "variations": ["msg1", "msg2", "msg3"] }`;

    try {
      const ai = getAIClient();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      const result = JSON.parse(response.text);
      return result.variations as string[];
    } catch (error: any) {
      console.error("Error generating WhatsApp messages:", error);
      throw new Error(error.message || "Falha ao gerar mensagens de WhatsApp com IA.");
    }
  }
};
