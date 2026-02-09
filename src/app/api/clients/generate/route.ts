import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import anthropic from '@/lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'instructor') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { focus } = body; // Optional focus area for the generated client

    const prompt = `Generate a realistic therapy client profile for a clinical psychology training simulation. The client should have a rich, intersectional identity with cultural backgrounds that meaningfully shape their presentation and worldview.

${focus ? `Focus area or theme: ${focus}` : 'Create a diverse client with an interesting combination of identities.'}

IMPORTANT GUIDELINES FOR CULTURAL AUTHENTICITY:
- The client's cultural background should deeply influence HOW they present in therapy, not just be a label
- Consider: attitudes toward mental health/therapy in their culture, family dynamics, communication norms, help-seeking behaviors
- Include cultural strengths and protective factors, not just challenges
- Think about acculturation stress, intergenerational dynamics, code-switching, cultural identity development
- Consider how intersecting identities compound or create unique experiences
- Avoid stereotypes - create a specific, nuanced individual

Generate a JSON object with these fields:
{
  "name": "Full name appropriate to their background",
  "presentingConcern": "2-3 sentences about why they're seeking therapy (what they would tell a therapist)",
  "age": number between 18-75,
  "pronouns": "their pronouns",
  "genderIdentity": "their gender identity",
  "raceEthnicity": "their racial/ethnic identity",
  "nationality": "cultural background/nationality",
  "sexualOrientation": "if relevant to their presentation, otherwise null",
  "disability": "if relevant, otherwise null",
  "religion": "religious/spiritual background if relevant",
  "socioeconomic": "their socioeconomic context",
  "immigrationStatus": "if relevant, otherwise null",
  "indigenousIdentity": "if relevant, otherwise null",
  "veteranStatus": "if relevant, otherwise null",
  "fullBackstory": "4-6 paragraphs covering: family background and dynamics, significant life events, current life situation, relationships, work/education, and CRITICALLY - how their cultural identities shape their worldview, help-seeking behavior, and presentation in therapy. Include specific cultural nuances.",
  "personality": "2-3 sentences about their personality traits",
  "communicationStyle": "2-3 sentences about how they communicate, including any cultural influences on their communication (e.g., indirect communication styles, views on authority figures, comfort with emotional expression)",
  "resistanceLevel": "low" | "medium" | "high",
  "therapeuticGoals": "what they hope to achieve"
}

Respond ONLY with the JSON object, no other text.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== 'text') {
      throw new Error('Unexpected response type');
    }

    // Extract JSON from response (handle markdown code blocks)
    let jsonText = content.text.trim();

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.slice(7);
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.slice(3);
    }
    if (jsonText.endsWith('```')) {
      jsonText = jsonText.slice(0, -3);
    }
    jsonText = jsonText.trim();

    // Parse the JSON response
    const clientData = JSON.parse(jsonText);

    return NextResponse.json(clientData);
  } catch (error) {
    console.error('Error generating client:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `Failed to generate client: ${message}` },
      { status: 500 }
    );
  }
}
