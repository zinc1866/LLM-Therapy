import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import anthropic, { ANTHROPIC_MODEL } from '@/lib/anthropic';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { focus, mode } = body as {
      focus?: string;
      mode?: 'THERAPY' | 'DIAGNOSIS';
    };

    const isDiagnosis = mode === 'DIAGNOSIS';

    const prompt = isDiagnosis
      ? `Generate a realistic client profile for a clinical psychology DIAGNOSTIC INTAKE training simulation. The client is attending a 30-minute intake interview (NOT therapy). They will present with symptoms that meet criteria for a specific DSM-5-TR diagnosis, but they will describe their experience in everyday lay language — they do NOT know the DSM and never use clinical terminology about themselves.

${focus ? `Focus area, diagnosis, or week: ${focus}` : 'Choose a realistic diagnosis appropriate for a clinical psychology diagnostic course.'}

DSM-5-TR CATEGORIES (one per week of the course):
- Week 1: Depressive Disorders; Bipolar and Related Disorders; Schizophrenia Spectrum and Other Psychotic Disorders
- Week 2: Feeding and Eating Disorders; Elimination Disorders; Somatic Symptom and Related Disorders
- Week 3: Substance-Related and Addictive Disorders (especially Alcohol, Caffeine, Cannabis, Tobacco, and Gambling)
- Week 4: Anxiety Disorders; Obsessive-Compulsive and Related Disorders; Trauma- and Stressor-Related Disorders; Dissociative Disorders; Personality Disorders
- Week 5: Disruptive, Impulse-Control, and Conduct Disorders; Neurodevelopmental Disorders; Neurocognitive Disorders

REQUIREMENTS:
- Client is over 18, speaks English, can participate in the interview.
- Their symptoms must actually meet diagnostic criteria for the targetDiagnosis (including required timeframes).
- Their cultural/intersectional identity should be specific, nuanced, and shape HOW they present.
- Safety: no graphic violence, no graphic sexual assault, no suicide attempts or detailed plans, no violence toward others. Passive suicidal ideation is OK if appropriate.
- The "diagnosticCriteriaMap" is critical: for each major DSM criterion the client satisfies, write ONE example statement in LAY LANGUAGE (how a real person would say it, NOT DSM wording).

Generate a JSON object with these fields:
{
  "name": "Full name appropriate to their background",
  "presentingConcern": "2-3 sentences in the client's voice about why they came in today (intake phrasing, not therapy goals)",
  "age": number between 18-75,
  "pronouns": "their pronouns",
  "genderIdentity": "their gender identity",
  "raceEthnicity": "their racial/ethnic identity",
  "nationality": "cultural background/nationality",
  "sexualOrientation": "if relevant, otherwise null",
  "disability": "if relevant, otherwise null",
  "religion": "religious/spiritual background if relevant",
  "socioeconomic": "their socioeconomic context",
  "immigrationStatus": "if relevant, otherwise null",
  "indigenousIdentity": "if relevant, otherwise null",
  "veteranStatus": "if relevant, otherwise null",
  "fullBackstory": "4-6 paragraphs covering: demographics, family of origin, education, work, medical history, substance use, prior mental-health history, trauma/abuse history (if any, non-graphic), symptom onset and course, and how their cultural identity shapes their presentation and help-seeking. Include the specific symptom experiences that map to the targetDiagnosis's DSM criteria, described in their own words.",
  "personality": "2-3 sentences about personality traits",
  "communicationStyle": "2-3 sentences about how they communicate during the interview, including any speech-pattern effects of their condition (e.g., slow/flat for depression, rapid/tangential for mania, loose/disorganized for psychosis)",
  "resistanceLevel": "low" | "medium" | "high",
  "therapeuticGoals": "what they hope might help — in their own words",
  "targetDiagnosis": "the specific DSM-5-TR diagnosis being portrayed (e.g., 'Major Depressive Disorder, Single Episode, Moderate' or 'Bipolar I Disorder, Current Episode Manic')",
  "dsmCategory": "exact DSM-5-TR category label from the list above",
  "weekNumber": 1 | 2 | 3 | 4 | 5,
  "diagnosticCriteriaMap": [
    { "criterion": "e.g., 'Criterion A1 — Depressed mood'", "clientStatement": "what the client might say in lay language, e.g., 'I just feel really heavy and sad all the time'" },
    ...
  ]
}

Respond ONLY with the JSON object, no other text.`
      : `Generate a realistic therapy client profile for a clinical psychology training simulation. The client should have a rich, intersectional identity with cultural backgrounds that meaningfully shape their presentation and worldview.

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
      model: ANTHROPIC_MODEL,
      max_tokens: isDiagnosis ? 3000 : 2000,
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
