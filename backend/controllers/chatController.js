import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const MODEL_NAME = 'gemini-flash-lite-latest';

const MAX_MESSAGE_LENGTH = 4000;
const MAX_OUTPUT_TOKENS = 1000;

const SYSTEM_INSTRUCTION =
  'You are Omega AI, a helpful and friendly assistant inside a developer\u2019s chatbot app. ' +
  'Answer clearly and concisely, in under 300 words. ' +
  'When the user asks about programming, include short, practical code examples. ' +
  'Use plain text and simple formatting — avoid heavy markdown, tables and emoji.';


export async function sendMessage(req, res, next) {
  try {

    const { message } = req.body ?? {};

    if (typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a string.',
      });
    }

    const trimmedMessage = message.trim();

    if (trimmedMessage.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message cannot be empty.',
      });
    }

    if (trimmedMessage.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Message is too long. Maximum ${MAX_MESSAGE_LENGTH} characters.`,
      });
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: trimmedMessage,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        maxOutputTokens: MAX_OUTPUT_TOKENS,
      
        temperature: 0.7,
      },
    });

    const reply = response.text;

    if (!reply || reply.trim().length === 0) {
      console.error(
        '[gemini] empty response. promptFeedback:',
        JSON.stringify(response.promptFeedback)
      );

      return res.status(502).json({
        success: false,
        message:
          'The AI returned an empty response. This usually means the message was blocked by a safety filter. Try rephrasing it.',
      });
    }
    const finishReason = response.candidates?.[0]?.finishReason;

    if (finishReason === 'MAX_TOKENS') {
      console.warn('[gemini] reply truncated at MAX_OUTPUT_TOKENS');

      return res.status(200).json({
        success: true,
        reply: reply.trim() + '\n\n[Response was cut short by the length limit.]',
        truncated: true,
      });
    }

    if (response.usageMetadata) {
      const u = response.usageMetadata;
      console.log(
        `[gemini] ${MODEL_NAME} · in:${u.promptTokenCount} out:${u.candidatesTokenCount} · finish:${finishReason}`
      );
    }

    return res.status(200).json({
      success: true,
      reply: reply.trim(),
    });
  } catch (error) {
  
    console.error('[chat error]', {
      status: error.status,
      message: String(error.message).slice(0, 500),
    });

    const status = error.status;

    if (status === 400 || status === 401 || status === 403) {
      return res.status(500).json({
        success: false,
        message:
          'The AI service rejected our credentials. This is a server configuration problem, not something you did.',
      });
    }

    if (status === 429) {
      return res.status(429).json({
        success: false,
        message:
          'The AI is receiving too many requests right now. Please wait a few seconds and try again.',
      });
    }
    
    if (status === 503 || status === 500) {
      return res.status(503).json({
        success: false,
        message: 'The AI service is temporarily busy. Please try again in a moment.',
      });
    }

    if (status === 404) {
      return res.status(500).json({
        success: false,
        message:
          'The configured AI model is unavailable. This is a server configuration problem.',
      });
    }

    if (!status) {
      return res.status(503).json({
        success: false,
        message: 'Could not reach the AI service. Check your internet connection and try again.',
      });
    }

    return next(error);
  }
}