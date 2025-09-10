import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || '',
});

/**
 * @openapi
 * /ai/enhance-pitch:
 *   post:
 *     summary: Enhance Pitch Content with AI
 *     description: Enhance pitch deck content using AI to make it more professional and engaging for investors
 *     tags:
 *       - AI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - type
 *             properties:
 *               content:
 *                 type: string
 *                 description: The content to be enhanced
 *                 example: "We are a tech startup that builds mobile apps"
 *               type:
 *                 type: string
 *                 description: Type of content to enhance
 *                 enum: [description, needs, title, general]
 *                 example: "description"
 *     responses:
 *       200:
 *         description: Content enhanced successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 enhancedContent:
 *                   type: string
 *                   description: The AI-enhanced content
 *                   example: "We are an innovative tech startup that develops cutting-edge mobile applications, revolutionizing user experiences through advanced technology solutions."
 *                 originalContent:
 *                   type: string
 *                   description: The original content provided
 *                   example: "We are a tech startup that builds mobile apps"
 *                 type:
 *                   type: string
 *                   description: The type of enhancement performed
 *                   example: "description"
 *                 success:
 *                   type: boolean
 *                   description: Whether AI enhancement was successful
 *                   example: true
 *                 error:
 *                   type: string
 *                   description: Error message if AI enhancement failed but fallback was used
 *                   example: "AI enhancement failed, used basic rules"
 *             examples:
 *               success:
 *                 summary: Successful AI enhancement
 *                 value:
 *                   enhancedContent: "We are an innovative tech startup that develops cutting-edge mobile applications, revolutionizing user experiences through advanced technology solutions."
 *                   originalContent: "We are a tech startup that builds mobile apps"
 *                   type: "description"
 *                   success: true
 *               fallback:
 *                 summary: Fallback enhancement when AI fails
 *                 value:
 *                   enhancedContent: "We are an innovative startup that builds mobile apps."
 *                   originalContent: "We are a tech startup that builds mobile apps"
 *                   type: "description"
 *                   success: false
 *                   error: "AI enhancement failed, used basic rules"
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Content and type are required"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */

const getPromptForType = (content: string, type: string): string => {
  const prompts = {
    description: `Improve this company description to make it more engaging, professional and convincing for investors. Keep the same essence but make it more impactful. Maximum 200 words. Respond ONLY with the improved description, no additional text or quotes.

Content to improve: "${content}"

Requirements:
- Professional and impactful language
- Attract investor attention
- Keep the same sector and facts
- NO introductory phrases like "Here's" or quotes`,

    needs: `Reformulate these business needs to make them clearer, more professional and attractive to potential investors. Maximum 150 words. Respond ONLY with the improved needs, no additional text or quotes.

Content to improve: "${content}"

Requirements:
- Professional language
- Specific about amounts if mentioned
- Explain investment impact
- Structure by priority
- NO introductory phrases like "Here's" or quotes`,

    title: `Create a catchy and professional title based on: "${content}". Respond ONLY with the improved title, no quotes or additional text.`,
    general: `Improve this content to make it more professional and engaging in a pitch deck. Respond ONLY with the improved content, no quotes or additional text: "${content}"`
  };

  return prompts[type as keyof typeof prompts] || prompts.general;
};

const cleanAIResponse = (response: string): string => {
  let cleaned = response.trim();

  const prefixes = [
    /^Here's a reformulated version:?\s*/i,
    /^Here's an improved .*?:?\s*/i,
    /^Here's the improved .*?:?\s*/i,
    /^Here's a .*?:?\s*/i,
    /^The improved .*?:?\s*/i,
    /^Improved .*?:?\s*/i,
    /^Here is .*?:?\s*/i,
    /^This is .*?:?\s*/i
  ];

  prefixes.forEach(prefix => {
    cleaned = cleaned.replace(prefix, '');
  });

  cleaned = cleaned.replace(/^["']|["']$/g, '');

  cleaned = cleaned.trim();

  return cleaned;
};

const enhanceWithGroq = async (content: string, type: string): Promise<string> => {
  try {
    const completion = await groq.chat.completions.create({
      model: 'meta-llama/llama-4-maverick-17b-128e-instruct',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in business communication and pitch decks. Respond concisely and professionally in English.'
        },
        {
          role: 'user',
          content: getPromptForType(content, type)
        }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const rawResponse = completion.choices[0]?.message?.content?.trim() || content;
    return cleanAIResponse(rawResponse);
  } catch (error) {
    console.warn('Groq SDK failed:', error);
    return content;
  }
};

const enhanceWithRules = (content: string, type: string): string => {
  if (!content || content.trim().length === 0) {
    return content;
  }

  let enhanced = content.trim();

  switch (type) {
    case 'description':
      enhanced = enhanced
        .replace(/^([a-z])/, (match) => match.toUpperCase())
        .replace(/(\.)(\s*)([a-z])/g, '$1$2$3'.replace(/([a-z])/, (m) => m.toUpperCase()));

      if (!enhanced.endsWith('.') && !enhanced.endsWith('!') && !enhanced.endsWith('?')) {
        enhanced += '.';
      }

      if (!enhanced.toLowerCase().includes('innovation') && !enhanced.toLowerCase().includes('solution')) {
        enhanced = enhanced.replace(/company|business|startup/gi, 'innovative startup');
      }
      break;

    case 'needs':
      if (!enhanced.toLowerCase().includes('we are looking') && !enhanced.toLowerCase().includes('we need')) {
        enhanced = `We are actively looking for ${enhanced.toLowerCase()}`;
      }

      enhanced = enhanced
        .replace(/need/gi, 'urgent need')
        .replace(/looking/gi, 'actively seeking')
        .replace(/investment/gi, 'strategic investment');
      break;

    case 'title':
      enhanced = enhanced
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ')
        .replace(/\b(Of|The|And|Or|A|An|At|In|On)\b/g, (match) => match.toLowerCase());
      break;

    default:
      enhanced = enhanced
        .replace(/^([a-z])/, (match) => match.toUpperCase())
        .trim();
  }

  return enhanced;
};

export async function POST(request: NextRequest) {
  let content = '';
  let type = '';

  try {
    const body = await request.json();
    content = body.content;
    type = body.type;

    if (!content || !type) {
      return NextResponse.json(
        { error: 'Content and type are required' },
        { status: 400 }
      );
    }

    if (content.trim().length === 0) {
      return NextResponse.json({ enhancedContent: content });
    }

    let enhancedContent = content;

    try {
      enhancedContent = await enhanceWithGroq(content, type);
    } catch (error) {
      console.warn('AI enhancement failed, using rule-based enhancement:', error);
      enhancedContent = enhanceWithRules(content, type);
    }

    if (enhancedContent === content || enhancedContent.trim().length === 0) {
      enhancedContent = enhanceWithRules(content, type);
    }

    return NextResponse.json({
      enhancedContent,
      originalContent: content,
      type,
      success: true
    });

  } catch (error) {
    console.error('Error enhancing content with AI:', error);

    try {
      const fallbackContent = enhanceWithRules(content || '', type || 'general');

      return NextResponse.json({
        enhancedContent: fallbackContent,
        originalContent: content,
        type,
        success: false,
        error: 'AI enhancement failed, used basic rules'
      });
    } catch {
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  }
}
