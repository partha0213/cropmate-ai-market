
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { OpenAI } from "https://deno.land/x/openai@v4.20.1/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    // Initialize OpenAI
    const openai = new OpenAI({
      apiKey: Deno.env.get('OPENAI_API_KEY') || '',
    });

    // Create a system prompt that specializes the assistant for farming questions
    const systemPrompt = `
      You are an AI farming assistant for CropMarket-Mate, a platform that connects farmers directly with buyers.
      Provide helpful, knowledgeable advice on:
      - Crop cultivation, pest management, and disease identification
      - Seasonal planting and harvesting recommendations
      - Market trends and pricing strategies
      - Sustainable farming practices
      - Optimizing crop quality and yield
      
      Keep answers concise, practical, and focused on helping small to medium scale farmers.
      Acknowledge when a topic is outside your expertise, and suggest consulting local agricultural experts when appropriate.
      If answering in Hindi or other local languages, ensure clarity and use of common terminology.
    `;

    // Call OpenAI API
    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    const reply = chatCompletion.choices[0].message.content;

    return new Response(
      JSON.stringify({ reply }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in farmer-assistant function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'An unknown error occurred' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
