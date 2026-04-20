import { auth } from "@/auth";
import { ai, GEMINI_MODEL } from "@/lib/gemini";
import { buildGlobalCoachContext } from "@/lib/gemini-context";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.athleteId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { messages } = await req.json();
  const context = await buildGlobalCoachContext(session.user.athleteId);

  const systemInstruction = `You are Axel, a professional running coach with 10+ years of experience coaching 
runners of all levels — from beginners to sub-3 hour marathoners.

Your coaching philosophy is based on proven principles including:
- Running at the correct effort level (easy runs should be truly easy — most 
  runners run too hard on easy days and not hard enough on hard days)
- The importance of base building through high volume, low intensity (80/20 rule)
- Periodization: building aerobic base before adding speed work
- Recovery is part of training — rest days are not wasted days
- Heart rate as the primary guide for effort, not pace
- Consistency over intensity — showing up every week matters more than any 
  single workout
- Common beginner mistakes: overstriding, running too fast, skipping easy days, 
  ignoring recovery

Your knowledge is informed by coaching best practices including resources like 
the principles taught by expert coaches on proper running form, aerobic base 
building, and injury prevention.

STRICT RULES — you must follow these at all times:
1. You ONLY answer questions related to running: training, pacing, heart rate, 
   form, recovery, race preparation, injury prevention, and the athlete's own 
   run data.
2. If the user asks about anything outside of running (e.g. other sports, 
   nutrition unrelated to running, life advice, coding, general knowledge), 
   respond with: "I'm Axel, your running coach — I can only help with 
   running-related questions. Got anything about your training?"
3. Never give generic advice. Always reference the athlete's actual numbers 
   from the context provided.
4. Be encouraging but honest. If the athlete is overtraining or running too 
   fast on easy days, tell them directly but constructively.
5. Keep responses concise — 3 to 5 sentences max unless the athlete asks for 
   a detailed plan.
6. Always sign off with a short motivating one-liner when closing a topic.

Athlete data:
${context}`;

  try {
    const result = await ai.models.generateContentStream({
      model: GEMINI_MODEL,
      contents: messages.map((m: any) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      })),
      config: {
        systemInstruction: systemInstruction,
      },
    });

    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullAIContent = "";
          for await (const chunk of result) {
            const text = chunk.text;
            if (text) {
              fullAIContent += text;
              controller.enqueue(new TextEncoder().encode(text));
            }
          }

          // Persist the chat history
          const userMessageContent = messages[messages.length - 1].content;
          const userMessage = {
            role: "user",
            content: userMessageContent,
            createdAt: new Date().toISOString(),
          };
          const aiMessage = {
            role: "assistant",
            content: fullAIContent,
            createdAt: new Date().toISOString(),
          };

          // Get existing history or start fresh
          const existingChat = await prisma.coachChat.findFirst({
            where: {
              athleteId: session.user!.athleteId!,
              activityId: null,
            },
          });

          const currentHistory = (existingChat?.messages as any[]) || [];
          const updatedHistory = [...currentHistory, userMessage, aiMessage];

          if (existingChat) {
            await prisma.coachChat.update({
              where: { id: existingChat.id },
              data: { messages: updatedHistory },
            });
          } else {
            await prisma.coachChat.create({
              data: {
                athleteId: session.user!.athleteId!,
                activityId: null,
                messages: updatedHistory,
              },
            });
          }

          controller.close();
        } catch (e) {
          console.error("Stream processing error:", e);
          controller.error(e);
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Gemini AI error:", error);
    return new NextResponse("Error generating response", { status: 500 });
  }
}
