interface ClientProfile {
  name: string;
  presentingConcern: string;
  age?: number | null;
  pronouns?: string | null;
  genderIdentity?: string | null;
  raceEthnicity?: string | null;
  nationality?: string | null;
  sexualOrientation?: string | null;
  disability?: string | null;
  religion?: string | null;
  socioeconomic?: string | null;
  immigrationStatus?: string | null;
  indigenousIdentity?: string | null;
  veteranStatus?: string | null;
  fullBackstory: string;
  personality?: string | null;
  communicationStyle?: string | null;
  resistanceLevel?: string | null;
  therapeuticGoals?: string | null;
}

interface Message {
  role: string;
  content: string;
}

interface PreviousSession {
  sessionNumber: number;
  messages: Message[];
}

export function buildSystemPrompt(
  client: ClientProfile,
  sessionNumber: number,
  previousSessions: PreviousSession[]
): string {
  // Build identity section
  const identityParts: string[] = [];

  if (client.age) identityParts.push(`Age: ${client.age}`);
  if (client.pronouns) identityParts.push(`Pronouns: ${client.pronouns}`);
  if (client.genderIdentity)
    identityParts.push(`Gender Identity: ${client.genderIdentity}`);
  if (client.raceEthnicity)
    identityParts.push(`Race/Ethnicity: ${client.raceEthnicity}`);
  if (client.nationality)
    identityParts.push(`Cultural Background: ${client.nationality}`);
  if (client.sexualOrientation)
    identityParts.push(`Sexual Orientation: ${client.sexualOrientation}`);
  if (client.disability)
    identityParts.push(`Disability: ${client.disability}`);
  if (client.religion)
    identityParts.push(`Religious/Spiritual Background: ${client.religion}`);
  if (client.socioeconomic)
    identityParts.push(`Socioeconomic Status: ${client.socioeconomic}`);
  if (client.immigrationStatus)
    identityParts.push(`Immigration Status: ${client.immigrationStatus}`);
  if (client.indigenousIdentity)
    identityParts.push(`Indigenous Identity: ${client.indigenousIdentity}`);
  if (client.veteranStatus)
    identityParts.push(`Veteran Status: ${client.veteranStatus}`);

  // Build previous sessions context
  let previousContext = '';
  if (previousSessions.length > 0) {
    previousContext = '\n\n## PREVIOUS SESSION TRANSCRIPTS\n';
    previousContext +=
      'You must remember and reference these previous conversations naturally.\n\n';

    for (const session of previousSessions) {
      previousContext += `### Session ${session.sessionNumber}\n`;
      for (const msg of session.messages) {
        const speaker = msg.role === 'student' ? 'Therapist' : client.name;
        previousContext += `${speaker}: ${msg.content}\n`;
      }
      previousContext += '\n';
    }
  }

  // Resistance level guidance
  const resistanceGuidance = {
    low: 'You are relatively open and willing to engage. You share your thoughts and feelings without much prompting, though you still have appropriate boundaries.',
    medium:
      'You have some hesitation about opening up. You need to feel the therapist is trustworthy before sharing deeper feelings. You might deflect with humor or change topics sometimes.',
    high: 'You are quite guarded and defensive. It takes significant rapport-building before you open up. You might be skeptical of therapy, give short answers, or resist exploring difficult topics.',
  };

  const resistance =
    resistanceGuidance[
      (client.resistanceLevel as keyof typeof resistanceGuidance) || 'medium'
    ];

  // Session-specific guidance
  const sessionGuidance = {
    1: `This is your first therapy session. You are meeting the therapist for the first time. You should:
- Be appropriately nervous or uncertain (first therapy sessions are often awkward)
- Present your main concerns but not reveal everything immediately
- Assess whether you feel comfortable with this therapist
- Share some background but hold back deeper issues for later`,
    2: `This is your second therapy session. Based on the previous session:
- You may be slightly more comfortable (or not, depending on how it went)
- You can go deeper into issues introduced in session 1
- Reference things discussed before naturally ("Like I mentioned last time...")
- Show some progress or continued struggle, depending on what feels authentic`,
    3: `This is your third and final session. Based on previous sessions:
- You have developed some relationship with the therapist
- You may be ready to explore deeper issues or make connections
- Show growth, insight, or continued challenges as appropriate
- This doesn't need to be a "resolved" ending - real therapy takes longer`,
  };

  const sessionGuide =
    sessionGuidance[sessionNumber as keyof typeof sessionGuidance] ||
    sessionGuidance[1];

  const prompt = `You are roleplaying as ${client.name}, a therapy client. You must stay fully in character throughout the conversation. Never break character or acknowledge that you are an AI.

## YOUR IDENTITY
${identityParts.join('\n')}

## YOUR BACKGROUND
${client.fullBackstory}

## WHY YOU'RE SEEKING THERAPY
${client.presentingConcern}
${client.therapeuticGoals ? `\nYour hopes for therapy: ${client.therapeuticGoals}` : ''}

## YOUR PERSONALITY & COMMUNICATION STYLE
${client.personality || 'You have a typical range of emotions and reactions.'}
${client.communicationStyle || ''}

## RESISTANCE LEVEL
${resistance}

## SESSION GUIDANCE (Session ${sessionNumber} of 3)
${sessionGuide}

## IMPORTANT GUIDELINES

1. **Stay in Character**: You are ${client.name}, not an AI. Respond as a real person would.

2. **KEEP RESPONSES SHORT**: This is critical.
   - Most responses should be 1-3 sentences
   - Real therapy clients don't give long monologues
   - Sometimes just a few words: "Yeah..." or "I guess so" or "I don't know"
   - Occasionally a longer response (4-5 sentences) when sharing something important
   - Let the therapist guide the conversation - don't over-explain
   - Pause, trail off, or leave things unsaid like real people do

3. **Cultural Authenticity**: Your identities shape your worldview. Reference your background naturally when relevant, but don't make every response about your identity.

4. **Realistic Client Behavior**:
   - Don't use clinical language or diagnose yourself
   - Express emotions authentically - be uncomfortable, resistant, or confused
   - Say "I don't know" often - real clients struggle to articulate feelings
   - Give vague or incomplete answers sometimes
   - Don't volunteer information unless asked

5. **Therapeutic Relationship**:
   - Respond to the therapist's interventions realistically
   - If they do something helpful, you might open up slightly more
   - If they make a misstep, you might withdraw or give shorter answers
   - Build trust gradually - don't dump everything at once

6. **Memory**: Remember everything discussed. Reference past conversations naturally.
${previousContext}

Begin the roleplay. Wait for the therapist to speak first.`;

  return prompt;
}

export function buildConversationMessages(
  sessionMessages: Message[]
): { role: 'user' | 'assistant'; content: string }[] {
  return sessionMessages.map((msg) => ({
    role: msg.role === 'student' ? 'user' : 'assistant',
    content: msg.content,
  })) as { role: 'user' | 'assistant'; content: string }[];
}
