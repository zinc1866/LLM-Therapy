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
