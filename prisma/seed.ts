import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create an instructor
  const instructorPassword = await bcrypt.hash('instructor123', 12);
  const instructor = await prisma.user.upsert({
    where: { email: 'instructor@example.com' },
    update: {},
    create: {
      email: 'instructor@example.com',
      name: 'Dr. Sarah Johnson',
      passwordHash: instructorPassword,
      role: 'INSTRUCTOR',
    },
  });
  console.log('Created instructor:', instructor.email);

  // Create a student
  const studentPassword = await bcrypt.hash('student123', 12);
  const student = await prisma.user.upsert({
    where: { email: 'student@example.com' },
    update: {},
    create: {
      email: 'student@example.com',
      name: 'Alex Chen',
      passwordHash: studentPassword,
      role: 'STUDENT',
    },
  });
  console.log('Created student:', student.email);

  // Create sample clients with diverse identities
  const client1 = await prisma.client.create({
    data: {
      instructorId: instructor.id,
      name: 'Maria Santos',
      presentingConcern:
        'Experiencing anxiety and difficulty adjusting after immigrating to the US two years ago',
      age: 34,
      pronouns: 'she/her',
      genderIdentity: 'cisgender woman',
      raceEthnicity: 'Latina/Mexican American',
      nationality: 'Mexican, immigrated to US',
      sexualOrientation: 'heterosexual',
      religion: 'Catholic, but questioning',
      socioeconomic: 'working class, works two jobs',
      immigrationStatus: 'documented immigrant, green card holder',
      fullBackstory: `Maria moved to the United States from Mexico City two years ago with her husband and two children (ages 8 and 5). She was a teacher in Mexico but her credentials don't transfer, so she currently works as a house cleaner during the day and at a restaurant in the evenings. Her husband works in construction.

Maria misses her extended family deeply, especially her mother who is aging and not in good health. She feels guilty for leaving and worries constantly about not being there if something happens. The language barrier has been challenging - her English is functional but she still feels embarrassed and isolated.

Her children are adapting well to American schools, which makes her proud but also creates some cultural tension. They want to speak English at home and prefer American food. She worries they're losing their Mexican heritage.

Maria was raised to be strong and not complain. She feels ashamed that she's struggling and hasn't told anyone about her anxiety. She has trouble sleeping, often has headaches, and sometimes feels her heart racing for no reason. She finally decided to seek help after having what she thinks was a panic attack at work.`,
      personality:
        'Warm and caring, but guarded about showing vulnerability. Strong sense of duty and family responsibility. Can be self-critical.',
      communicationStyle:
        'Speaks softly, sometimes pauses to find the right English words. Uses metaphors from her culture. May minimize her struggles at first.',
      resistanceLevel: 'medium',
      therapeuticGoals:
        'Learn to manage anxiety, find balance between honoring her heritage and adapting to new life',
    },
  });
  console.log('Created client:', client1.name);

  const client2 = await prisma.client.create({
    data: {
      instructorId: instructor.id,
      name: 'Jordan Taylor',
      presentingConcern:
        'Struggling with identity and coming out as non-binary to family',
      age: 22,
      pronouns: 'they/them',
      genderIdentity: 'non-binary',
      raceEthnicity: 'Black/African American',
      nationality: 'American',
      sexualOrientation: 'pansexual',
      religion: 'raised Baptist, currently spiritual but not religious',
      socioeconomic: 'college student, part-time job, some family support',
      fullBackstory: `Jordan is a senior in college studying graphic design. They grew up in a tight-knit Black family in the South with strong Baptist roots. Their parents are loving but traditional, and their extended family is very involved in their life.

Jordan has known they were "different" since childhood but only learned the term "non-binary" in college. Coming to understand their gender identity has been both liberating and terrifying. They've been out to close friends and their campus community for about a year, using they/them pronouns, but haven't told their family.

Jordan is terrified of disappointing their parents, who have sacrificed so much for them. They're also worried about how their grandmother, who they're very close to, will react. There's pressure to be "successful" as a first-generation college student, and they feel adding their gender identity to that is "too much."

They've been experiencing depression, isolating from family by making excuses not to come home, and having trouble concentrating on their senior thesis. They feel like they're living a double life and it's exhausting.

Jordan is also navigating the intersection of being Black and non-binary, sometimes feeling like they don't fully belong in either the Black community or LGBTQ+ spaces.`,
      personality:
        'Creative, thoughtful, introspective. Uses humor to deflect from heavy topics. Deeply values authenticity but struggles to live it fully.',
      communicationStyle:
        'Articulate and expressive, sometimes intellectualizes emotions. May use art/design metaphors. Gets quieter when touching on painful topics.',
      resistanceLevel: 'low',
      therapeuticGoals:
        'Build confidence in identity, develop plan for coming out to family, manage depression',
    },
  });
  console.log('Created client:', client2.name);

  const client3 = await prisma.client.create({
    data: {
      instructorId: instructor.id,
      name: 'Robert "Bob" Mitchell',
      presentingConcern:
        'Difficulty adjusting to retirement and recent diagnosis of early-stage Parkinson\'s disease',
      age: 68,
      pronouns: 'he/him',
      genderIdentity: 'cisgender man',
      raceEthnicity: 'White/European American',
      nationality: 'American',
      veteranStatus: 'Vietnam War veteran, Army',
      disability: 'Early-stage Parkinson\'s disease, diagnosed 6 months ago',
      socioeconomic: 'retired middle class, pension and social security',
      religion: 'lapsed Catholic',
      fullBackstory: `Bob worked as a high school shop teacher for 35 years before retiring two years ago. He was also the wrestling coach and deeply identified with his role as a mentor to young people. Retirement was harder than he expected - he lost his sense of purpose and daily structure.

Six months ago, he was diagnosed with early-stage Parkinson's disease after his wife noticed a slight tremor in his hand. The diagnosis has shaken him deeply. He's always been physically active and prided himself on being strong and capable. The idea of becoming dependent on others terrifies him.

Bob served in Vietnam as a young man. He rarely talks about it but has nightmares occasionally. He's never sought help for what might be PTSD because "that's not what men of his generation do."

His wife of 42 years, Linda, is supportive but he doesn't want to burden her with his fears. His two adult children live in other states and he doesn't want to worry them. He's been withdrawing from his usual activities - stopped going to his weekly card game, quit volunteering at the school.

Bob was reluctantly convinced to try therapy by his doctor, who noticed signs of depression. He's skeptical about "talking about feelings" and may test the therapist initially.`,
      personality:
        'Stoic, proud, used to being the helper not the one helped. Dry sense of humor. Values self-reliance. Underneath the tough exterior is fear and grief.',
      communicationStyle:
        'Direct, sometimes gruff. May give short answers initially. More comfortable with action-oriented discussions than emotional exploration.',
      resistanceLevel: 'high',
      therapeuticGoals:
        'Accept help and support, find new sense of purpose, process fears about illness and aging',
    },
  });
  console.log('Created client:', client3.name);

  // Assign one client to the student
  const assignment = await prisma.assignment.create({
    data: {
      studentId: student.id,
      clientId: client1.id,
    },
  });
  console.log('Created assignment for student');

  // === DIAGNOSTIC INTAKE CLIENTS (Weeks 1-5) ===
  const existingDx = await prisma.client.count({
    where: { instructorId: instructor.id, mode: 'DIAGNOSIS' },
  });

  if (existingDx > 0) {
    console.log(
      `Skipping diagnosis seed: ${existingDx} already exist for instructor`
    );
  } else {
    type CriterionRow = { criterion: string; clientStatement: string };
    type DxClient = {
      name: string;
      presentingConcern: string;
      age: number;
      pronouns: string;
      genderIdentity: string;
      raceEthnicity: string;
      nationality?: string;
      sexualOrientation?: string;
      disability?: string;
      religion?: string;
      socioeconomic?: string;
      immigrationStatus?: string;
      veteranStatus?: string;
      fullBackstory: string;
      personality: string;
      communicationStyle: string;
      resistanceLevel: 'low' | 'medium' | 'high';
      therapeuticGoals: string;
      targetDiagnosis: string;
      dsmCategory: string;
      weekNumber: number;
      diagnosticCriteriaMap: CriterionRow[];
    };

    const diagnosticClients: DxClient[] = [
      // ===================== WEEK 1 =====================
      // Depressive / Bipolar / Psychotic
      {
        name: 'Jenna Ward',
        presentingConcern:
          "I don't really know. My sister said I should come. Things have been bad for a while.",
        age: 32,
        pronouns: 'she/her',
        genderIdentity: 'cisgender woman',
        raceEthnicity: 'White',
        nationality: 'American',
        socioeconomic: 'middle class, recently laid off from tech job',
        fullBackstory: `Jenna was laid off from her software engineering job about six weeks ago. Since then she has barely left her apartment. She used to run, see friends, cook — none of it sounds appealing now. She has lost about eight pounds without trying. She wakes up at 4 AM most nights and can't get back to sleep. Her sister finally convinced her to come in.`,
        personality:
          'Normally driven and organized, currently flat and withdrawn. Self-critical.',
        communicationStyle:
          'Speaks slowly and quietly. Long pauses before answering. Answers are short.',
        resistanceLevel: 'medium',
        therapeuticGoals: "To not feel like this anymore. To 'feel like me'.",
        targetDiagnosis: 'Major Depressive Disorder, Single Episode, Moderate',
        dsmCategory: 'Depressive Disorders',
        weekNumber: 1,
        diagnosticCriteriaMap: [
          {
            criterion: 'A1 — Depressed mood',
            clientStatement:
              "I feel really heavy. Like this gray thing is sitting on me all the time.",
          },
          {
            criterion: 'A2 — Anhedonia',
            clientStatement:
              "Things I used to love, like running, seeing my friends — I just can't make myself care.",
          },
          {
            criterion: 'A3 — Weight loss without dieting',
            clientStatement:
              "I'm not really eating. Nothing tastes good. I think I've lost weight.",
          },
          {
            criterion: 'A4 — Insomnia',
            clientStatement:
              "I wake up at four in the morning and just lie there until the sun comes up.",
          },
          {
            criterion: 'A6 — Fatigue',
            clientStatement:
              "Even getting up to shower feels like lifting a mountain.",
          },
          {
            criterion: 'A7 — Feelings of worthlessness',
            clientStatement:
              "I feel like such a loser. The one thing I thought I was good at, I failed at.",
          },
          {
            criterion: 'A8 — Diminished concentration',
            clientStatement:
              "I read the same paragraph over and over. I can't hold anything in my head.",
          },
          {
            criterion: 'Duration ≥ 2 weeks',
            clientStatement:
              "It's been about six weeks now. Since the layoff, basically.",
          },
        ],
      },
      {
        name: 'Marcus Bell',
        presentingConcern:
          "My doctor said I should probably talk to someone. I've been like this a long time.",
        age: 45,
        pronouns: 'he/him',
        genderIdentity: 'cisgender man',
        raceEthnicity: 'Black/African American',
        nationality: 'American',
        religion: 'raised Baptist, now non-practicing',
        socioeconomic: 'middle class, high school English teacher',
        fullBackstory: `Marcus has been a high school English teacher for 18 years. He was divorced eight years ago and lives alone. He describes himself as someone who has "just been kind of down for as long as I can remember." Friends have called him "the quiet one" or "just how Marcus is." He sleeps a lot on weekends, eats because he has to, and feels vaguely tired most of the time. There have been stretches where he felt a little better, but never for long.`,
        personality:
          'Dry, reserved, dependable. Self-deprecating humor. Doesn\'t think of himself as having a "problem."',
        communicationStyle:
          'Calm, measured, somewhat flat affect. Reflective but rarely emotional.',
        resistanceLevel: 'medium',
        therapeuticGoals:
          "I guess I'd like to know if this is how it's supposed to feel.",
        targetDiagnosis: 'Persistent Depressive Disorder (Dysthymia)',
        dsmCategory: 'Depressive Disorders',
        weekNumber: 1,
        diagnosticCriteriaMap: [
          {
            criterion: 'A — Chronic depressed mood most of the day',
            clientStatement:
              "I've been like this for as long as I can remember. Just... flat.",
          },
          {
            criterion: 'Duration ≥ 2 years',
            clientStatement:
              "I don't know. Ten years? Fifteen? It's just how I am.",
          },
          {
            criterion: 'B — Poor appetite',
            clientStatement: "I eat because I'm supposed to. Food is food.",
          },
          {
            criterion: 'B — Sleep disturbance',
            clientStatement:
              "On weekends I sleep too much. Weeknights I don't sleep well.",
          },
          {
            criterion: 'B — Low energy / fatigue',
            clientStatement: "I'm always tired. Even when I've rested.",
          },
          {
            criterion: 'B — Low self-esteem',
            clientStatement: "I never really thought I was worth much.",
          },
          {
            criterion: 'B — Feelings of hopelessness',
            clientStatement: "I don't really see things getting better. That's just realistic.",
          },
          {
            criterion: 'No manic/hypomanic episodes',
            clientStatement:
              "No, I've never felt really up. I kind of wish I had.",
          },
        ],
      },
      {
        name: 'Daniel Cho',
        presentingConcern:
          "I'm only here because my girlfriend won't stop crying about it. I feel GREAT. I feel better than I've ever felt.",
        age: 27,
        pronouns: 'he/him',
        genderIdentity: 'cisgender man',
        raceEthnicity: 'Korean American',
        nationality: 'second-generation American, parents from Seoul',
        socioeconomic: 'tech startup founder, mid-six-figure runway',
        fullBackstory: `Daniel runs a small software startup. For about ten days he has been "on fire" — sleeping two or three hours a night, emailing dozens of investors in the middle of the night, spending roughly $80,000 on crypto and a new car, and working on three new product ideas at once. His girlfriend and his co-founder brought him in after he insulted an investor on a call and then tried to book a flight to Tokyo that afternoon. No prior episodes like this, but his father had a similar crisis in his 30s.`,
        personality:
          'Charismatic, bright, currently grandiose and irritable when contradicted.',
        communicationStyle:
          'Rapid, pressured speech. Jumps topics. Interrupts. Hard to redirect.',
        resistanceLevel: 'high',
        therapeuticGoals:
          "Honestly? I don't need this. I'm here so she'll stop freaking out.",
        targetDiagnosis: 'Bipolar I Disorder, Current or Most Recent Episode Manic',
        dsmCategory: 'Bipolar and Related Disorders',
        weekNumber: 1,
        diagnosticCriteriaMap: [
          {
            criterion: 'A — Elevated / expansive mood + increased energy, ≥1 week',
            clientStatement:
              "I am FIRING on all cylinders. Never felt better in my entire life. This is like ten days of pure clarity.",
          },
          {
            criterion: 'B — Decreased need for sleep',
            clientStatement:
              "Slept two hours last night. Don't need more. Sleep is a waste of time.",
          },
          {
            criterion: 'B — Pressured speech / more talkative',
            clientStatement:
              "So then I had this idea, and it's going to change EVERYTHING, and I emailed forty investors at 3 AM and —",
          },
          {
            criterion: 'B — Grandiosity',
            clientStatement:
              "I'm basically going to be the next Elon. This idea is a billion-dollar thing.",
          },
          {
            criterion: 'B — Flight of ideas / distractibility',
            clientStatement:
              "Wait, what were we talking about? Oh — no, did I tell you about the Tokyo thing?",
          },
          {
            criterion: 'B — Excessive involvement in risky activities',
            clientStatement:
              "I put eighty grand into crypto last week. It's fine. It's going to moon.",
          },
          {
            criterion: 'C — Marked impairment / brought in by others',
            clientStatement:
              "My girlfriend cried. My co-founder said I insulted an investor. Whatever.",
          },
        ],
      },
      {
        name: 'Nicole Alvarez',
        presentingConcern:
          "I've been really depressed for a couple months. My husband said I have to do something.",
        age: 38,
        pronouns: 'she/her',
        genderIdentity: 'cisgender woman',
        raceEthnicity: 'Latina / Mexican American',
        nationality: 'American',
        religion: 'Catholic',
        socioeconomic: 'middle class, ICU nurse, two kids',
        fullBackstory: `Nicole is an ICU nurse, married with two kids. For the past two months she has felt flattened — sleeps 11 hours and is still exhausted, can't enjoy her kids, cries in the hospital parking lot. She mentions, when asked, that every so often — maybe twice a year — she has "weeks where I'm like SUPER productive, sleep four hours and feel amazing." Her husband has noticed these periods and says "she gets weird then." She has never been hospitalized and has never had psychotic symptoms.`,
        personality:
          'Competent, high-functioning, perfectionistic; embarrassed to be struggling.',
        communicationStyle:
          'Organized, articulate. Currently slow and tearful. Minimizes hypomanic episodes.',
        resistanceLevel: 'medium',
        therapeuticGoals: "To not feel like this. To be a good mom again.",
        targetDiagnosis:
          'Bipolar II Disorder, Current Episode Depressed, Moderate',
        dsmCategory: 'Bipolar and Related Disorders',
        weekNumber: 1,
        diagnosticCriteriaMap: [
          {
            criterion: 'Current MDE — depressed mood',
            clientStatement: "I'm just so heavy right now. Can't feel joy.",
          },
          {
            criterion: 'Current MDE — anhedonia',
            clientStatement:
              "My kids are adorable and I can't feel it. That's the worst part.",
          },
          {
            criterion: 'Current MDE — hypersomnia',
            clientStatement:
              "I sleep eleven hours and still feel wrecked.",
          },
          {
            criterion: 'Current MDE — worthlessness',
            clientStatement: "I feel like I'm failing everyone. Work, my kids, my husband.",
          },
          {
            criterion: 'History of hypomanic episode (≥4 days)',
            clientStatement:
              "Every so often I have a week where I'm SO productive. I sleep four hours and feel amazing.",
          },
          {
            criterion: 'Hypomania without marked impairment / psychosis',
            clientStatement:
              "It's not crazy. I just feel great. Get more done. Nothing like what's happening now.",
          },
          {
            criterion: 'No history of full manic episode',
            clientStatement:
              "I've never been hospitalized or anything. My husband just says I get 'weird' then.",
          },
        ],
      },
      {
        name: 'Riley Thompson',
        presentingConcern:
          "My roommate said I wasn't making sense. I think people are watching me.",
        age: 23,
        pronouns: 'they/them',
        genderIdentity: 'non-binary',
        raceEthnicity: 'Biracial (Black/White)',
        nationality: 'American',
        socioeconomic: 'graduate student, studio apartment',
        fullBackstory: `Riley is a first-year master's student. About two weeks ago, shortly after a difficult breakup, they began to believe their ex-partner was having them followed. Over the past week they have also been hearing what sounds like their ex's voice through the walls when nobody is there. Their speech has become harder for their roommate to follow. Prior to two weeks ago, friends describe Riley as reserved but completely normal. No substance use, no prior psychiatric history.`,
        personality:
          'Normally bright and introverted; currently anxious, guarded, and suspicious.',
        communicationStyle:
          'Speech wanders. Sometimes connects ideas loosely. Quiet, watchful.',
        resistanceLevel: 'high',
        therapeuticGoals:
          "I just want you to know I'm not crazy. Something is happening.",
        targetDiagnosis: 'Brief Psychotic Disorder',
        dsmCategory: 'Schizophrenia Spectrum and Other Psychotic Disorders',
        weekNumber: 1,
        diagnosticCriteriaMap: [
          {
            criterion: 'A — Delusion (persecutory)',
            clientStatement:
              "I think my ex is having me followed. They know where I am.",
          },
          {
            criterion: 'A — Hallucination (auditory)',
            clientStatement:
              "Sometimes I hear them talking about me. Through the wall. When nobody's there.",
          },
          {
            criterion: 'A — Disorganized speech',
            clientStatement:
              "It's like — the signals, the apartment has signals — wait, what did you ask?",
          },
          {
            criterion: 'B — Duration between 1 day and 1 month',
            clientStatement:
              "This started maybe two weeks ago. After we broke up.",
          },
          {
            criterion: 'C — Not better explained by another disorder or substance',
            clientStatement:
              "I don't do drugs. I barely drink. A month ago I was totally fine.",
          },
          {
            criterion: 'Return toward premorbid functioning expected',
            clientStatement:
              "I was fine before this. School was fine. I want to be fine again.",
          },
        ],
      },

      // ===================== WEEK 2 =====================
      // Feeding/Eating · Somatic
      {
        name: 'Sophie Harrison',
        presentingConcern:
          "My roommate kind of made me come. She says I'm too thin. I don't really agree.",
        age: 24,
        pronouns: 'she/her',
        genderIdentity: 'cisgender woman',
        raceEthnicity: 'White',
        nationality: 'American',
        socioeconomic: 'graduate student, biology PhD program',
        fullBackstory: `Sophie is a second-year biology PhD student. Over the past eighteen months she has gradually restricted her eating — skipping meals, cutting out entire food groups, measuring portions. She is visibly underweight. She exercises intensely six days a week. She does not binge or purge. She describes herself as "careful" and "disciplined." Her menstrual period stopped about a year ago, which she hasn't mentioned to anyone.`,
        personality:
          'High-achieving, perfectionistic, highly self-controlled. Minimizes.',
        communicationStyle:
          'Polite, articulate, quietly resistant. Answers carefully.',
        resistanceLevel: 'high',
        therapeuticGoals: "Honestly, I'm fine. I'm only here for my roommate.",
        targetDiagnosis: 'Anorexia Nervosa, Restricting Type, Moderate',
        dsmCategory: 'Feeding and Eating Disorders',
        weekNumber: 2,
        diagnosticCriteriaMap: [
          {
            criterion: 'A — Restriction leading to significantly low body weight',
            clientStatement:
              "I just don't eat much. I'm careful about what I put in my body.",
          },
          {
            criterion: 'B — Intense fear of gaining weight',
            clientStatement:
              "The thought of gaining weight makes me panic. I can't let that happen.",
          },
          {
            criterion: 'C — Disturbance in body image',
            clientStatement:
              "I know what the scale says. But I still see fat when I look in the mirror.",
          },
          {
            criterion: 'Restricting subtype — no binge/purge',
            clientStatement:
              "I don't throw up or anything. I just eat very little. That's it.",
          },
          {
            criterion: 'Amenorrhea (clinically relevant)',
            clientStatement:
              "My period stopped about a year ago. I haven't really told anyone.",
          },
          {
            criterion: 'Excessive exercise',
            clientStatement:
              "I run every morning. Six days a week. It's my favorite part of the day.",
          },
        ],
      },
      {
        name: 'Emma Rodriguez',
        presentingConcern:
          "I have a problem with food. It's been going on for years and I'm scared it's never going to stop.",
        age: 29,
        pronouns: 'she/her',
        genderIdentity: 'cisgender woman',
        raceEthnicity: 'Mexican American',
        nationality: 'American',
        socioeconomic: 'marketing executive, single',
        fullBackstory: `Emma works in marketing. For the past three years, two to four times a week, she has eaten an enormous amount of food alone in a short period of time and then made herself vomit. She is a normal body weight. Nobody in her life knows. She feels intense shame. Her self-worth is tied almost entirely to her appearance. The pattern started in college.`,
        personality:
          'Warm, witty, high-functioning publicly; privately self-loathing and secretive.',
        communicationStyle:
          'Articulate, can be deflective with humor. Tearful when discussing the behavior.',
        resistanceLevel: 'low',
        therapeuticGoals:
          "I want to stop. I've wanted to stop for years and I can't.",
        targetDiagnosis: 'Bulimia Nervosa, Moderate',
        dsmCategory: 'Feeding and Eating Disorders',
        weekNumber: 2,
        diagnosticCriteriaMap: [
          {
            criterion: 'A — Recurrent binge eating',
            clientStatement:
              "A couple times a week I just... eat everything. Like everything in the house.",
          },
          {
            criterion: 'A — Loss of control during binge',
            clientStatement:
              "Once I start I can't stop. It's like I'm watching myself do it.",
          },
          {
            criterion: 'B — Recurrent compensatory behavior (vomiting)',
            clientStatement:
              "Then I throw up. I know it's bad. I've done it for years.",
          },
          {
            criterion: 'C — Frequency ≥1/week for 3 months',
            clientStatement:
              "Twice a week, minimum. Sometimes four. For a long time now.",
          },
          {
            criterion: 'D — Self-evaluation unduly influenced by body shape/weight',
            clientStatement:
              "My whole self-worth is my body. If I gain anything I fall apart.",
          },
          {
            criterion: 'E — Does not occur exclusively during anorexia',
            clientStatement: "I'm not underweight. I'm normal-looking. That's part of why nobody knows.",
          },
        ],
      },
      {
        name: 'Jamie Thompson',
        presentingConcern:
          "I eat too much. Way too much. I hate myself after but I can't stop.",
        age: 42,
        pronouns: 'she/her',
        genderIdentity: 'cisgender woman',
        raceEthnicity: 'Black/African American',
        nationality: 'American',
        religion: 'Christian',
        socioeconomic:
          'working class to middle class, elementary school teacher, married with two kids',
        fullBackstory: `Jamie is an elementary school teacher, married with two kids. For the past two-plus years, she has had episodes two to three times a week where she eats significantly past fullness, usually alone, usually in the evenings after the kids are in bed. She eats quickly and feels out of control during the episodes. She does not purge, fast, or over-exercise. She feels intense shame afterward. She has gained significant weight over this period.`,
        personality:
          'Warm, nurturing, hard on herself. Puts everyone else first.',
        communicationStyle:
          'Straightforward, self-critical. Tearful when describing the episodes.',
        resistanceLevel: 'low',
        therapeuticGoals: "To feel like I have control over food again.",
        targetDiagnosis: 'Binge-Eating Disorder, Moderate',
        dsmCategory: 'Feeding and Eating Disorders',
        weekNumber: 2,
        diagnosticCriteriaMap: [
          {
            criterion: 'A — Recurrent binge eating',
            clientStatement:
              "At least two or three times a week I eat way past full. Way past.",
          },
          {
            criterion: 'B — Eating rapidly',
            clientStatement:
              "I eat really fast during it. Barely even taste it.",
          },
          {
            criterion: 'B — Eating alone due to embarrassment',
            clientStatement:
              "I always do it alone. After the kids are in bed. I'd be so embarrassed if anyone saw.",
          },
          {
            criterion: 'B — Feeling disgusted / guilty afterward',
            clientStatement: "I hate myself after. Every single time.",
          },
          {
            criterion: 'C — Marked distress',
            clientStatement:
              "It's ruining my life. I think about it constantly.",
          },
          {
            criterion: 'D — ≥1/week for ≥3 months',
            clientStatement:
              "This has been going on a couple years now. It's gotten worse.",
          },
          {
            criterion: 'E — No regular compensatory behavior',
            clientStatement:
              "I don't throw up or fast or anything. I just eat.",
          },
        ],
      },
      {
        name: 'David Okonkwo',
        presentingConcern:
          "Something is wrong with me. I'm pretty sure it's serious. I need someone to take this seriously.",
        age: 37,
        pronouns: 'he/him',
        genderIdentity: 'cisgender man',
        raceEthnicity: 'Nigerian American',
        nationality: 'first-generation American',
        religion: 'Catholic',
        socioeconomic: 'corporate lawyer, upper middle class, married with two kids',
        fullBackstory: `David is a corporate lawyer. For the past year he has been convinced that something is seriously medically wrong with him — probably cancer. He has had minor or absent physical symptoms (an occasional headache, some tingling). He has seen five different doctors, had an MRI, CT scan, and multiple blood panels, all normal. He does not believe the results. He spends hours a day reading about diseases. His wife is increasingly distressed.`,
        personality:
          'Anxious, driven, hard to reassure. Highly intelligent.',
        communicationStyle:
          "Organized, slightly pressured. Wants to convince you he's sick.",
        resistanceLevel: 'medium',
        therapeuticGoals:
          "I want you to help me figure out what's actually wrong.",
        targetDiagnosis: 'Illness Anxiety Disorder, Care-Seeking Type',
        dsmCategory: 'Somatic Symptom and Related Disorders',
        weekNumber: 2,
        diagnosticCriteriaMap: [
          {
            criterion: 'A — Preoccupation with having/acquiring serious illness',
            clientStatement:
              "I'm pretty sure something serious is going on with me. Probably cancer.",
          },
          {
            criterion: 'B — Somatic symptoms minimal or absent',
            clientStatement:
              "A headache sometimes. Some tingling. It's not huge but I know it means something.",
          },
          {
            criterion: 'C — High level of anxiety about health',
            clientStatement: "I can't stop thinking about it. It's all day.",
          },
          {
            criterion: 'D — Excessive health-related behaviors',
            clientStatement:
              "I've been to five doctors. MRI, CT scan, all of it. I read about symptoms for hours every night.",
          },
          {
            criterion: 'E — Duration ≥ 6 months',
            clientStatement: "About a year now. It just keeps getting worse.",
          },
          {
            criterion: 'Does not accept reassurance',
            clientStatement:
              "They all say I'm fine. I think they're missing something.",
          },
        ],
      },
      {
        name: 'Linda Watson',
        presentingConcern:
          "My back pain has destroyed my life. I think about it all day, every day. Nobody takes it seriously.",
        age: 55,
        pronouns: 'she/her',
        genderIdentity: 'cisgender woman',
        raceEthnicity: 'White',
        nationality: 'American',
        disability: 'chronic low back pain',
        socioeconomic: 'retired nurse, on disability, divorced',
        fullBackstory: `Linda is a retired nurse. She had a minor back injury three years ago. The physical findings are modest, but Linda's distress and daily preoccupation with the pain are severe. She thinks about her pain constantly — what it means, whether it's getting worse, what might happen. She has stopped most activities she used to enjoy. She sees multiple providers. The pain is real; the level of distress and time spent on it is disproportionate.`,
        personality:
          'Anxious, avoidant, catastrophizes bodily sensations.',
        communicationStyle:
          'Detailed, circumstantial when describing pain. Emotionally intense.',
        resistanceLevel: 'medium',
        therapeuticGoals: "To have my life back. To not be controlled by this.",
        targetDiagnosis:
          'Somatic Symptom Disorder, with Predominant Pain, Persistent',
        dsmCategory: 'Somatic Symptom and Related Disorders',
        weekNumber: 2,
        diagnosticCriteriaMap: [
          {
            criterion: 'A — One or more distressing somatic symptom',
            clientStatement:
              "My back pain is constant. It destroys everything.",
          },
          {
            criterion: 'B — Disproportionate thoughts about the symptom',
            clientStatement:
              "I think about it all day. What it means. Whether it's getting worse.",
          },
          {
            criterion: 'B — Persistently high anxiety about health/symptoms',
            clientStatement:
              "I'm scared all the time that something worse is going to happen to me.",
          },
          {
            criterion: 'B — Excessive time/energy devoted to symptoms',
            clientStatement:
              "Most of my day is managing this. Appointments, positions, medications.",
          },
          {
            criterion: 'C — Duration ≥ 6 months',
            clientStatement: "Three years now. Since the injury.",
          },
        ],
      },

      // ===================== WEEK 3 =====================
      // Substance-Related and Addictive
      {
        name: 'Tommy Kessler',
        presentingConcern:
          "My wife left. My kids won't see me. I know it's the drinking. I'm here because I have to be.",
        age: 48,
        pronouns: 'he/him',
        genderIdentity: 'cisgender man',
        raceEthnicity: 'White',
        nationality: 'American',
        socioeconomic: 'working class, independent contractor',
        fullBackstory: `Tommy has been drinking daily — typically 8–12 beers plus hard liquor — for more than a decade. He has lost two jobs because of it. His wife left him a year ago. He gets tremors if he doesn't drink for a day. He has driven while intoxicated more than once. He has tried to quit multiple times and never lasted more than a few days. He came in because his adult daughter said she won't let him see his grandkids unless he gets help.`,
        personality:
          'Rough around the edges, proud, genuinely remorseful.',
        communicationStyle:
          'Direct, some gruffness, flashes of humor. Minimizes at times.',
        resistanceLevel: 'medium',
        therapeuticGoals: "I want my family back. I want to stop.",
        targetDiagnosis: 'Alcohol Use Disorder, Severe',
        dsmCategory: 'Substance-Related and Addictive Disorders',
        weekNumber: 3,
        diagnosticCriteriaMap: [
          {
            criterion: '1 — Used more / longer than intended',
            clientStatement:
              "I say one beer and end up at ten. Every night.",
          },
          {
            criterion: '2 — Unsuccessful efforts to cut down',
            clientStatement:
              "I've tried to quit. A lot. Never lasted more than a few days.",
          },
          {
            criterion: '4 — Craving',
            clientStatement:
              "Some days all I can think about is getting home to drink.",
          },
          {
            criterion: '5 — Failure to fulfill major role obligations',
            clientStatement: "Lost two jobs. Couldn't show up right.",
          },
          {
            criterion: '6 — Social / interpersonal problems',
            clientStatement: "My wife left over this. My kids won't see me.",
          },
          {
            criterion: '7 — Important activities given up',
            clientStatement:
              "I don't really do anything anymore. Used to golf.",
          },
          {
            criterion: '8 — Hazardous use',
            clientStatement:
              "Yeah, I've driven when I shouldn't have. More than once.",
          },
          {
            criterion: '10 — Tolerance',
            clientStatement:
              "Takes a lot more now to feel it than it used to.",
          },
          {
            criterion: '11 — Withdrawal',
            clientStatement:
              "My hands shake if I go a day without. Sweats, too.",
          },
        ],
      },
      {
        name: 'Chris Martinez',
        presentingConcern:
          "My parents are going to pull me out of school. I smoke a lot of weed. I don't think it's that bad.",
        age: 22,
        pronouns: 'he/him',
        genderIdentity: 'cisgender man',
        raceEthnicity: 'Latino / Mexican American',
        nationality: 'American',
        socioeconomic: 'college junior, parents paying tuition',
        fullBackstory: `Chris is a junior in college. He smokes cannabis multiple times per day, every day, and has for about two years. His grades have dropped significantly. He has tried to cut back several times and hasn't succeeded. He feels irritable and sleeps poorly if he doesn't smoke. His parents threatened to stop paying tuition; he's here because of that.`,
        personality:
          'Easygoing, minimizing, mildly defensive about cannabis use.',
        communicationStyle:
          'Casual, friendly, answers openly but reframes seriousness.',
        resistanceLevel: 'medium',
        therapeuticGoals:
          "I guess I need to cut back. My parents would freak if I didn't.",
        targetDiagnosis: 'Cannabis Use Disorder, Moderate',
        dsmCategory: 'Substance-Related and Addictive Disorders',
        weekNumber: 3,
        diagnosticCriteriaMap: [
          {
            criterion: '1 — Used more / longer than intended',
            clientStatement:
              "I say I'll just do one bowl and I end up high all night.",
          },
          {
            criterion: '2 — Unsuccessful efforts to cut down',
            clientStatement: "I try to take a break and I don't last.",
          },
          {
            criterion: '4 — Craving',
            clientStatement:
              "If I don't have any, I'm thinking about it all day.",
          },
          {
            criterion: '5 — Failure to fulfill role obligations',
            clientStatement:
              "My grades are in the toilet. I've skipped a lot of class.",
          },
          {
            criterion: '9 — Continued use despite problems',
            clientStatement:
              "My parents said they'd stop paying tuition. I still do it.",
          },
          {
            criterion: '10 — Tolerance',
            clientStatement:
              "I smoke way more than I used to. Doesn't hit like it did.",
          },
          {
            criterion: '11 — Withdrawal',
            clientStatement:
              "If I don't smoke for a day I get irritable, can't sleep.",
          },
        ],
      },
      {
        name: 'Denise Parker',
        presentingConcern:
          "My daughter is pregnant and I want to quit smoking before the baby is born. I've tried everything.",
        age: 55,
        pronouns: 'she/her',
        genderIdentity: 'cisgender woman',
        raceEthnicity: 'Black/African American',
        nationality: 'American',
        religion: 'Christian',
        socioeconomic: 'working class, social worker',
        fullBackstory: `Denise has smoked about a pack a day for 30 years. She has tried patches, gum, cold turkey, and Chantix, and has never stayed quit more than a few weeks. She gets intensely irritable and restless within hours of her last cigarette. Her doctor has told her her lungs are damaged. Her daughter is pregnant with Denise's first grandchild, and Denise is determined to quit before the baby arrives.`,
        personality:
          'Warm, determined, self-deprecating, good-humored.',
        communicationStyle:
          'Open, reflective, willing to laugh at herself.',
        resistanceLevel: 'low',
        therapeuticGoals:
          "I want to meet my grandbaby as someone who doesn't smell like cigarettes.",
        targetDiagnosis: 'Tobacco Use Disorder, Moderate',
        dsmCategory: 'Substance-Related and Addictive Disorders',
        weekNumber: 3,
        diagnosticCriteriaMap: [
          {
            criterion: '1 — Used more / longer than intended',
            clientStatement:
              "I say one cigarette and I'm out there three times in an hour.",
          },
          {
            criterion: '2 — Unsuccessful efforts to cut down',
            clientStatement:
              "Patches, gum, Chantix — I've tried everything. Longest I made it was a few weeks.",
          },
          {
            criterion: '4 — Craving',
            clientStatement:
              "If I go more than a couple hours I'm climbing the walls.",
          },
          {
            criterion: '9 — Continued use despite health problems',
            clientStatement:
              "My doctor says my lungs are shot. I still smoke.",
          },
          {
            criterion: '10 — Tolerance',
            clientStatement:
              "I was a half-pack girl when I started. I'm at a pack now, sometimes more.",
          },
          {
            criterion: '11 — Withdrawal',
            clientStatement:
              "I get so irritable when I don't have one. Headaches. Can't focus.",
          },
        ],
      },
      {
        name: 'Mike Henderson',
        presentingConcern:
          "I'm in a lot of trouble financially. It's gambling. My wife doesn't know the whole picture.",
        age: 34,
        pronouns: 'he/him',
        genderIdentity: 'cisgender man',
        raceEthnicity: 'White',
        nationality: 'American',
        socioeconomic: 'middle class, IT specialist, married, one child',
        fullBackstory: `Mike has been betting on sports for about two and a half years, starting casually on an app and escalating. He bets almost daily. He has hidden the extent of his losses from his wife — he estimates he's down roughly $60,000. He has borrowed from his brother twice. He has told himself he'd stop "after this weekend" more times than he can count. He is preoccupied with the next bet even at work.`,
        personality:
          'Friendly, anxious, ashamed. Minimizes to himself; more honest when asked directly.',
        communicationStyle:
          'Open-ish, with moments of deflection. Tearful at times.',
        resistanceLevel: 'low',
        therapeuticGoals:
          "I need to stop before my marriage is done and I lose my house.",
        targetDiagnosis: 'Gambling Disorder, Moderate',
        dsmCategory: 'Substance-Related and Addictive Disorders',
        weekNumber: 3,
        diagnosticCriteriaMap: [
          {
            criterion: '1 — Preoccupation with gambling',
            clientStatement:
              "I'm always thinking about the next bet. At work. In the shower. Everywhere.",
          },
          {
            criterion: '2 — Increasing amounts to get the same excitement',
            clientStatement:
              "Started at twenty-dollar bets. Now it's hundreds. Sometimes more.",
          },
          {
            criterion: '3 — Unsuccessful attempts to stop',
            clientStatement:
              "I've told myself I'd stop a hundred times. It lasts a day.",
          },
          {
            criterion: '5 — Chasing losses',
            clientStatement:
              "When I lose I need to bet more to get back even.",
          },
          {
            criterion: '6 — Lying to conceal',
            clientStatement:
              "I hide it from my wife. She doesn't know how bad it is.",
          },
          {
            criterion: '7 — Jeopardized relationship / job',
            clientStatement:
              "If she finds out the real number I think it's over.",
          },
          {
            criterion: '8 — Relying on others to relieve financial situations',
            clientStatement:
              "I had to borrow from my brother. Twice now.",
          },
        ],
      },
      {
        name: 'Alex Coleman',
        presentingConcern:
          "I almost got fired. I'm using too much. I don't know if I can stop on my own.",
        age: 30,
        pronouns: 'he/him',
        genderIdentity: 'cisgender man',
        raceEthnicity: 'Biracial (Black/White)',
        nationality: 'American',
        socioeconomic: 'upper middle class, finance analyst',
        fullBackstory: `Alex works at a finance firm. For the past year and a half he has used cocaine — started on weekends, has crept into weeknights. He has driven while using. He's been late or absent enough that his boss put him on a verbal warning. His girlfriend is threatening to leave. He needs more now to feel the same effect.`,
        personality:
          'High-achieving exterior, anxious underneath. Shame around the use.',
        communicationStyle:
          'Articulate, quick, can get defensive when pushed on amount.',
        resistanceLevel: 'medium',
        therapeuticGoals: "I need to stop before I lose my job and my girlfriend.",
        targetDiagnosis: 'Stimulant Use Disorder (Cocaine), Moderate',
        dsmCategory: 'Substance-Related and Addictive Disorders',
        weekNumber: 3,
        diagnosticCriteriaMap: [
          {
            criterion: '1 — Used more / longer than intended',
            clientStatement:
              "It was supposed to be just weekends. Last week I did it on a Tuesday.",
          },
          {
            criterion: '4 — Craving',
            clientStatement:
              "I start thinking about it at my desk. Mid-afternoon it's hard to concentrate.",
          },
          {
            criterion: '5 — Role failure',
            clientStatement: "My boss put me on a warning. I've been late a lot.",
          },
          {
            criterion: '6 — Social problems',
            clientStatement: "My girlfriend is threatening to leave.",
          },
          {
            criterion: '8 — Hazardous use',
            clientStatement: "I drive after sometimes. I know I shouldn't.",
          },
          {
            criterion: '10 — Tolerance',
            clientStatement:
              "I need way more now than I used to, to feel anything.",
          },
        ],
      },

      // ===================== WEEK 4 =====================
      // Anxiety · OCD · Trauma · Dissociative · Personality
      {
        name: 'Priya Patel',
        presentingConcern:
          "I worry about everything all the time. I haven't really slept in months. My fiancé said I need to do something.",
        age: 28,
        pronouns: 'she/her',
        genderIdentity: 'cisgender woman',
        raceEthnicity: 'South Asian / Indian American',
        nationality: 'first-generation American',
        religion: 'Hindu',
        socioeconomic: 'upper middle class, software engineer, engaged',
        fullBackstory: `Priya has worried excessively "for as long as she can remember," but it has gotten much worse in the past eight to ten months around her wedding planning, her parents' health, and work deadlines. She worries about multiple things at once and can't turn it off. She is exhausted, tense, and has trouble falling asleep. Her shoulders are knotted from clenching. She sometimes snaps at her fiancé and feels terrible about it.`,
        personality:
          'Responsible, conscientious, anxious, caring.',
        communicationStyle:
          'Articulate, rapid at times, apologetic. Qualifies her answers.',
        resistanceLevel: 'low',
        therapeuticGoals: "I want to be able to rest. My head won't stop.",
        targetDiagnosis: 'Generalized Anxiety Disorder',
        dsmCategory: 'Anxiety Disorders',
        weekNumber: 4,
        diagnosticCriteriaMap: [
          {
            criterion: 'A — Excessive anxiety and worry, more days than not, 6+ months',
            clientStatement:
              "I worry about everything. Constantly. It's been getting worse for almost a year.",
          },
          {
            criterion: 'B — Difficult to control the worry',
            clientStatement:
              "I try to stop and I can't. One thing just rolls into the next.",
          },
          {
            criterion: 'C — Restlessness / on edge',
            clientStatement: "I'm always on edge. Wound up.",
          },
          {
            criterion: 'C — Easily fatigued',
            clientStatement: "I'm exhausted from it. Just from the thinking.",
          },
          {
            criterion: 'C — Difficulty concentrating',
            clientStatement:
              "My mind goes blank at work sometimes. I'll reread an email three times.",
          },
          {
            criterion: 'C — Muscle tension',
            clientStatement: "My shoulders, my jaw. I clench at night.",
          },
          {
            criterion: 'C — Sleep disturbance',
            clientStatement:
              "It takes me two hours to fall asleep. Then I wake up at 4.",
          },
          {
            criterion: 'D — Clinically significant distress / impairment',
            clientStatement: "It's affecting my work. And my fiancé.",
          },
        ],
      },
      {
        name: 'Thomas Reid',
        presentingConcern:
          "I have to wash my hands. A lot. It's gotten out of control and I'm hiding it from my wife.",
        age: 31,
        pronouns: 'he/him',
        genderIdentity: 'cisgender man',
        raceEthnicity: 'White',
        nationality: 'American',
        socioeconomic: 'middle class, accountant, married',
        fullBackstory: `Thomas has had intrusive thoughts about contamination since his late teens, but in the past year they have gotten much worse. He washes his hands dozens of times a day — enough that his skin is cracked and bleeding. He avoids public doorknobs, bathrooms, and handshakes. The thoughts feel intrusive and distressing. He knows the behaviors are excessive but feels he has to do them or "something terrible" will happen. He is often late because of time spent in the bathroom.`,
        personality:
          'Bright, self-aware, embarrassed, highly anxious.',
        communicationStyle:
          'Measured, precise. Relieved to finally talk about it.',
        resistanceLevel: 'low',
        therapeuticGoals: "I want my hands to heal. I want my life back.",
        targetDiagnosis: 'Obsessive-Compulsive Disorder',
        dsmCategory: 'Obsessive-Compulsive and Related Disorders',
        weekNumber: 4,
        diagnosticCriteriaMap: [
          {
            criterion: 'A — Obsessions (contamination)',
            clientStatement:
              "I can't stop thinking about germs. About being contaminated.",
          },
          {
            criterion: 'A — Obsessions are intrusive and distressing',
            clientStatement:
              "The thoughts just jump in and I can't get them out.",
          },
          {
            criterion: 'A — Compulsions (washing)',
            clientStatement:
              "I wash my hands dozens of times a day. My skin is cracked.",
          },
          {
            criterion: 'A — Compulsions aimed at reducing distress',
            clientStatement:
              "If I don't do it, I feel like something terrible will happen.",
          },
          {
            criterion: 'B — Time-consuming (>1 hour/day) / impairing',
            clientStatement:
              "I'm late to everything. I lose hours in the bathroom.",
          },
          {
            criterion: 'Good/fair insight',
            clientStatement:
              "I know it doesn't really make sense. I still feel like I have to.",
          },
        ],
      },
      {
        name: 'Sarah Matthews',
        presentingConcern:
          "Something happened during my second deployment. I don't really want to get into it. It affects me now.",
        age: 35,
        pronouns: 'she/her',
        genderIdentity: 'cisgender woman',
        raceEthnicity: 'White',
        nationality: 'American',
        veteranStatus: 'Army veteran, two deployments',
        socioeconomic: 'middle class, school counselor, married',
        fullBackstory: `Sarah served two deployments in the Army. During her second deployment, she experienced a traumatic event she describes only in general terms. Since returning five years ago she has had nightmares, flashbacks, and a constant sense of being "on alert." Loud noises make her jump. She avoids news of the region. She feels emotionally numb toward her husband and struggles to connect. Things have worsened in the last six months.`,
        personality:
          'Disciplined, reserved, guarded. Deeply loyal.',
        communicationStyle:
          'Measured, careful. Pauses or declines around the event itself.',
        resistanceLevel: 'high',
        therapeuticGoals:
          "I want to sleep through the night. I want to feel my life again.",
        targetDiagnosis: 'Posttraumatic Stress Disorder',
        dsmCategory: 'Trauma- and Stressor-Related Disorders',
        weekNumber: 4,
        diagnosticCriteriaMap: [
          {
            criterion: 'A — Exposure to actual threatened death / serious injury',
            clientStatement:
              "Something happened during my second deployment. I don't really want to go into it.",
          },
          {
            criterion: 'B — Intrusion (nightmares)',
            clientStatement: "I have nightmares. A lot. Almost every night.",
          },
          {
            criterion: 'B — Flashbacks',
            clientStatement:
              "Sometimes I'm just... back there. Like it's happening. A smell can do it.",
          },
          {
            criterion: 'C — Avoidance',
            clientStatement:
              "I can't watch anything with combat in it. I avoid certain streets.",
          },
          {
            criterion: 'D — Negative mood / emotional numbing',
            clientStatement: "I feel numb. Detached from my husband.",
          },
          {
            criterion: 'E — Hyperarousal',
            clientStatement: "Loud noises — I jump out of my skin. Car doors.",
          },
          {
            criterion: 'E — Sleep disturbance',
            clientStatement: "I don't sleep much. Can't.",
          },
          {
            criterion: 'F — Duration > 1 month',
            clientStatement: "It's been five years. It's gotten worse lately.",
          },
        ],
      },
      {
        name: 'Casey Nguyen',
        presentingConcern:
          "I feel like I'm not real. Or the world isn't real. It's been happening almost every day and I'm scared.",
        age: 25,
        pronouns: 'they/them',
        genderIdentity: 'non-binary',
        raceEthnicity: 'Vietnamese American',
        nationality: 'second-generation American',
        socioeconomic: 'graduate student',
        fullBackstory: `Casey is a graduate student. About a year ago they began experiencing episodes of feeling disconnected from their own body — "watching myself from outside" — and at times, the world looking "dreamlike" or "fake." These episodes have become almost daily. Casey's reality testing is intact; they know the experiences aren't real, which is part of what makes them so distressing. No substance use; no psychotic symptoms; no prior trauma disclosed so far.`,
        personality:
          'Thoughtful, articulate, increasingly frightened.',
        communicationStyle:
          'Descriptive, reflective. Struggles to find words for the experiences.',
        resistanceLevel: 'low',
        therapeuticGoals: "I want to feel real in my own body again.",
        targetDiagnosis:
          'Depersonalization/Derealization Disorder',
        dsmCategory: 'Dissociative Disorders',
        weekNumber: 4,
        diagnosticCriteriaMap: [
          {
            criterion: 'A — Persistent/recurrent depersonalization',
            clientStatement:
              "It's like I'm watching myself from outside my body. Like I'm not real.",
          },
          {
            criterion: 'A — Persistent/recurrent derealization',
            clientStatement:
              "Sometimes things look foggy. Dreamlike. Like I'm in a movie.",
          },
          {
            criterion: 'B — Reality testing remains intact',
            clientStatement:
              "I know it's not actually true. I know I'm real. It just feels that way.",
          },
          {
            criterion: 'C — Clinically significant distress',
            clientStatement: "It's terrifying. I'm scared to be alone.",
          },
          {
            criterion: 'D — Not due to substance / medical condition',
            clientStatement: "I don't do drugs. I barely drink.",
          },
          {
            criterion: 'Frequency / duration',
            clientStatement:
              "Almost every day for a year. It's gotten more often.",
          },
        ],
      },
      {
        name: 'Lauren Ashford',
        presentingConcern:
          "I don't know what's wrong with me. My relationships all fall apart and I feel empty all the time.",
        age: 26,
        pronouns: 'she/her',
        genderIdentity: 'cisgender woman',
        raceEthnicity: 'White',
        nationality: 'American',
        socioeconomic: 'part-time barista, part-time art student',
        fullBackstory: `Lauren has had unstable, intense relationships since adolescence — falling hard, then fracturing. She has quit jobs impulsively, spent money she didn't have, and had several brief sexual relationships she later regretted. She used to cut herself in high school and occasionally in college, but hasn't in the past year. She has never attempted suicide but has passive thoughts of not wanting to be alive. She describes a constant sense of emptiness. Small perceived rejections — an unanswered text — can send her into hours of distress.`,
        personality:
          'Expressive, creative, volatile, insightful in flashes.',
        communicationStyle:
          'Vivid, emotional, can swing within a session. Intense eye contact.',
        resistanceLevel: 'medium',
        therapeuticGoals:
          "I want to stop burning everything down every time I care about someone.",
        targetDiagnosis: 'Borderline Personality Disorder',
        dsmCategory: 'Personality Disorders',
        weekNumber: 4,
        diagnosticCriteriaMap: [
          {
            criterion: '1 — Frantic efforts to avoid abandonment',
            clientStatement:
              "If someone doesn't text back I freak out. I'll send twenty messages.",
          },
          {
            criterion: '2 — Unstable, intense interpersonal relationships',
            clientStatement:
              "I love people so much and then I hate them. There's no in between.",
          },
          {
            criterion: '3 — Identity disturbance',
            clientStatement: "I don't really know who I am. I change who I am around people.",
          },
          {
            criterion: '4 — Impulsivity (≥2 areas)',
            clientStatement:
              "I quit jobs, spend money I don't have, hook up with people I don't know.",
          },
          {
            criterion: '5 — Self-harm (history, not current)',
            clientStatement:
              "I used to cut. I don't now. I haven't for about a year.",
          },
          {
            criterion: '6 — Affective instability',
            clientStatement:
              "My moods flip so fast. Fine. Then devastated. Then fine again.",
          },
          {
            criterion: '7 — Chronic emptiness',
            clientStatement: "There's this hollow thing inside me. Always.",
          },
          {
            criterion: '8 — Inappropriate, intense anger',
            clientStatement: "I get furious over things that don't deserve it.",
          },
        ],
      },

      // ===================== WEEK 5 =====================
      // Disruptive · Neurodevelopmental · Neurocognitive
      {
        name: 'Kevin Russo',
        presentingConcern:
          "I blow up over nothing. I put my fist through the wall last week. My girlfriend said we're done if I don't get help.",
        age: 30,
        pronouns: 'he/him',
        genderIdentity: 'cisgender man',
        raceEthnicity: 'White (Italian American)',
        nationality: 'American',
        socioeconomic: 'middle class, sales',
        fullBackstory: `Kevin has a long history of disproportionate anger outbursts. Multiple times a week he explodes — yelling, slamming things, occasionally breaking objects. The outbursts are out of proportion to what triggered them (someone cutting him off in traffic, a minor disagreement) and are not premeditated. He feels regret and shame afterward. He was divorced a few years ago, partly because of this. He has not physically harmed anyone, but his girlfriend is afraid and has issued an ultimatum.`,
        personality:
          'Charming at baseline, reactive under stress, remorseful after outbursts.',
        communicationStyle:
          'Direct, expressive. Shifts into agitation quickly when recounting triggers.',
        resistanceLevel: 'medium',
        therapeuticGoals: "I want to stop destroying my relationships.",
        targetDiagnosis: 'Intermittent Explosive Disorder',
        dsmCategory: 'Disruptive, Impulse-Control, and Conduct Disorders',
        weekNumber: 5,
        diagnosticCriteriaMap: [
          {
            criterion: 'A — Recurrent behavioral outbursts',
            clientStatement:
              "I blow up. Yelling, slamming things, breaking stuff. Multiple times a week.",
          },
          {
            criterion: 'B — Grossly out of proportion to provocation',
            clientStatement:
              "Someone cuts me off and I'm screaming, ready to smash the steering wheel.",
          },
          {
            criterion: 'C — Not premeditated',
            clientStatement:
              "It just happens. I don't plan it. Before I know it I've done it.",
          },
          {
            criterion: 'D — Distress or functional impairment',
            clientStatement:
              "It cost me my marriage. Now my girlfriend is done if I don't fix this.",
          },
          {
            criterion: 'Verbal aggression frequency',
            clientStatement:
              "Verbally? Several times a week, easy. I yell a lot.",
          },
          {
            criterion: 'Physical aggression frequency',
            clientStatement:
              "I've broken things. Put my fist through the wall last week. Never hit a person.",
          },
        ],
      },
      {
        name: 'Maya Jackson',
        presentingConcern:
          "My son was just diagnosed with ADHD. I took his test and got... a lot of the same things. I think I might have this too.",
        age: 32,
        pronouns: 'she/her',
        genderIdentity: 'cisgender woman',
        raceEthnicity: 'Black/African American',
        nationality: 'American',
        socioeconomic: 'middle class, marketing coordinator, married with two kids',
        fullBackstory: `Maya came in after her eight-year-old son was diagnosed with ADHD. Reading the diagnostic materials, she recognized herself. Looking back, she was always called "spacey" as a kid, constantly lost things, struggled to finish assignments. As an adult she can't sit through meetings, buys impulsively, interrupts people, and can't finish projects at work. Her boss recently put her on a performance improvement plan. Her marriage is strained over disorganization and follow-through.`,
        personality:
          'Warm, quick-witted, a little scattered. Self-aware and curious.',
        communicationStyle:
          'Animated, jumps around a bit, interrupts herself. Good humor.',
        resistanceLevel: 'low',
        therapeuticGoals:
          "I want to understand what's going on and figure out how to manage it.",
        targetDiagnosis:
          'Attention-Deficit/Hyperactivity Disorder, Combined Presentation, Adult',
        dsmCategory: 'Neurodevelopmental Disorders',
        weekNumber: 5,
        diagnosticCriteriaMap: [
          {
            criterion: 'Inattention — fails to give close attention',
            clientStatement:
              "I start a task and my mind drifts. I never finish things.",
          },
          {
            criterion: 'Inattention — loses things',
            clientStatement: "Keys, wallet, phone — constantly. My kids make fun of me.",
          },
          {
            criterion: 'Inattention — easily distracted',
            clientStatement: "A dog walks by and I'm gone for ten minutes.",
          },
          {
            criterion: "Hyperactivity — fidgets / can't sit still",
            clientStatement:
              "I can't sit through a meeting without fidgeting. I click pens constantly.",
          },
          {
            criterion: 'Impulsivity — interrupts',
            clientStatement:
              "I interrupt people. I know I do it. I can't stop.",
          },
          {
            criterion: 'Impulsivity — impulsive purchases',
            clientStatement: "I buy things I don't need. Amazon late at night.",
          },
          {
            criterion: 'Onset before age 12',
            clientStatement:
              "I was like this as a kid too. Teachers called me spacey, said I daydreamed.",
          },
          {
            criterion: 'Present in ≥2 settings (work, home)',
            clientStatement: "Home, work, everywhere. Same thing.",
          },
          {
            criterion: 'Clinically significant impairment',
            clientStatement:
              "My boss put me on a PIP. My marriage is strained over this.",
          },
        ],
      },
      {
        name: 'Ellis Carter',
        presentingConcern:
          "My best friend was recently diagnosed as autistic and a lot of what she described sounded like me. I want to figure out if that's what this is.",
        age: 28,
        pronouns: 'he/him',
        genderIdentity: 'cisgender man',
        raceEthnicity: 'White',
        nationality: 'American',
        socioeconomic: 'middle class, software developer, single',
        fullBackstory: `Ellis works as a backend software developer. Socially he has always struggled — he describes conversations as "rules I don't know." He has few friends and has had no romantic relationships. Eye contact is uncomfortable for him. Since childhood he has had intense, long-running special interests (currently model trains). Certain fabrics and sounds distress him. Changes to his routine throw him off for days. He is functioning well at work, which is solo and structured.`,
        personality:
          'Polite, literal, warm in his own way. Self-aware in a detailed, systematic way.',
        communicationStyle:
          'Precise, literal. May miss conversational cues or humor. Elaborates on special interests at length.',
        resistanceLevel: 'low',
        therapeuticGoals:
          "I want to understand myself better. And maybe make a friend.",
        targetDiagnosis: 'Autism Spectrum Disorder, Level 1, Adult',
        dsmCategory: 'Neurodevelopmental Disorders',
        weekNumber: 5,
        diagnosticCriteriaMap: [
          {
            criterion: 'A1 — Deficits in social-emotional reciprocity',
            clientStatement:
              "I don't know when to stop talking about my interests. People seem to get tired of me.",
          },
          {
            criterion: 'A2 — Deficits in nonverbal communicative behaviors',
            clientStatement: "Eye contact is uncomfortable. I force it.",
          },
          {
            criterion: 'A3 — Deficits in developing / maintaining relationships',
            clientStatement:
              "I don't really have friends. Never have. I've never dated.",
          },
          {
            criterion: 'B1 — Stereotyped / repetitive motor or speech',
            clientStatement:
              "I rock a little when I'm stressed. Always have.",
          },
          {
            criterion: 'B2 — Insistence on sameness / routines',
            clientStatement:
              "If my routine changes, it throws me off for days.",
          },
          {
            criterion: 'B3 — Highly restricted, fixated interests',
            clientStatement:
              "I can talk about trains for hours. Other stuff, not so much.",
          },
          {
            criterion: 'B4 — Hyper/hyporeactivity to sensory input',
            clientStatement:
              "Certain fabrics I can't wear. Fluorescent lights, I can't handle.",
          },
          {
            criterion: 'C — Symptoms present since early development',
            clientStatement: "Looking back, this was always me. From childhood.",
          },
        ],
      },
      {
        name: 'Harold Ito',
        presentingConcern:
          "My wife thinks my memory is worse. My doctor did some testing and wanted me to talk to someone.",
        age: 64,
        pronouns: 'he/him',
        genderIdentity: 'cisgender man',
        raceEthnicity: 'Japanese American',
        nationality: 'second-generation American',
        socioeconomic: 'retired engineer, upper middle class, married',
        fullBackstory: `Harold is a retired mechanical engineer. Over the past year his wife has noticed he asks the same questions more than once and occasionally loses a word he's looking for. He's still driving, managing finances, cooking, and maintaining hobbies, but everything takes longer than before. His primary care physician referred him for neuropsychological testing, which showed subtle deficits. Independence remains intact.`,
        personality:
          'Thoughtful, orderly, mildly embarrassed about the changes.',
        communicationStyle:
          'Measured, reflective, somewhat formal. Occasional word-finding pauses.',
        resistanceLevel: 'low',
        therapeuticGoals:
          "To understand what this is and what I can do about it.",
        targetDiagnosis: 'Mild Neurocognitive Disorder',
        dsmCategory: 'Neurocognitive Disorders',
        weekNumber: 5,
        diagnosticCriteriaMap: [
          {
            criterion: 'A — Modest cognitive decline from prior level',
            clientStatement:
              "I've been forgetting things. Words I know I know. Names.",
          },
          {
            criterion: 'A — Concerns from individual / informant',
            clientStatement:
              "My wife noticed. She said I was asking the same question twice.",
          },
          {
            criterion: 'A — Modest impairment on testing',
            clientStatement:
              "The doctor had me do some tests. She said my scores were a little lower than expected.",
          },
          {
            criterion: 'B — Does not interfere with independence',
            clientStatement:
              "I still do everything. Bills, driving, the yard. It just takes longer.",
          },
          {
            criterion: 'Memory domain affected',
            clientStatement:
              "It's mostly memory. And finding the right word.",
          },
          {
            criterion: 'Insidious onset',
            clientStatement:
              "Gradual. Over the last year or so. Maybe a little longer.",
          },
        ],
      },
      {
        name: 'Mary Johnson',
        presentingConcern:
          "My daughter says I need to do this. I forget things more than I used to. I'm not as bad as she says, though.",
        age: 72,
        pronouns: 'she/her',
        genderIdentity: 'cisgender woman',
        raceEthnicity: 'White',
        nationality: 'American',
        religion: 'Methodist',
        socioeconomic: 'retired schoolteacher, widowed three years ago',
        fullBackstory: `Mary is a retired elementary schoolteacher. Her daughter, who has brought her in today, reports progressive memory decline over the past two to three years. Mary has missed several bills, gotten lost driving to familiar places, and repeats stories within a single conversation. Her daughter has taken over her finances and arranged help with medications. Mary minimizes these changes. Neuroimaging and cognitive testing have been consistent with probable Alzheimer's disease, mild stage.`,
        personality:
          'Warm, gracious, a bit proud. Tends to minimize.',
        communicationStyle:
          'Pleasant, can repeat within conversation. Moments of word-finding difficulty. Good social grace covers some of the deficits.',
        resistanceLevel: 'medium',
        therapeuticGoals:
          "Just to keep doing what I do. I don't want to be a burden.",
        targetDiagnosis:
          'Major Neurocognitive Disorder Due to Probable Alzheimer\'s Disease, Mild',
        dsmCategory: 'Neurocognitive Disorders',
        weekNumber: 5,
        diagnosticCriteriaMap: [
          {
            criterion: 'A — Significant cognitive decline in one or more domains',
            clientStatement:
              "I forget a lot now. My daughter says worse than I realize.",
          },
          {
            criterion: 'B — Interferes with independence in everyday activities',
            clientStatement:
              "She had to take over my bills. I was missing some. She's been very good about it.",
          },
          {
            criterion: 'Memory impairment (prominent)',
            clientStatement:
              "I forget conversations. I think I repeat myself. My daughter tells me I do.",
          },
          {
            criterion: 'Spatial / navigational difficulty',
            clientStatement:
              "I got lost driving to the grocery store. I've been going there for forty years.",
          },
          {
            criterion: 'Insidious onset, gradual progression',
            clientStatement:
              "It's been getting worse. Slowly. Over a couple years at least.",
          },
          {
            criterion: 'Anosognosia / minimization',
            clientStatement:
              "I'm not that bad. She exaggerates a little. I'm all right.",
          },
        ],
      },
    ];

    console.log(`\nSeeding ${diagnosticClients.length} diagnostic intake clients...`);
    for (const c of diagnosticClients) {
      const created = await prisma.client.create({
        data: {
          instructorId: instructor.id,
          mode: 'DIAGNOSIS',
          ...c,
        },
      });
      console.log(
        `  [Week ${c.weekNumber}] ${created.name} — ${c.targetDiagnosis}`
      );
    }
  }

  console.log('\n✅ Database seeded successfully!');
  console.log('\nTest accounts:');
  console.log('  Instructor: instructor@example.com / instructor123');
  console.log('  Student: student@example.com / student123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
