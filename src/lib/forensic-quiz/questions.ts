import type { TagWeights } from './tags';

export type QuestionOption = {
  id: string;
  label: string;
  weights: TagWeights;
};

export type Question = {
  id: string;
  prompt: string;
  helper?: string;
  options: QuestionOption[];
};

// Bump this whenever the question set or scoring is changed materially.
// Submissions are stored with the version used so old results stay interpretable.
export const QUIZ_VERSION = '2026-05-14.v1';

export const QUESTIONS: Question[] = [
  {
    id: 'q1_courtroom_scene',
    prompt:
      'In a courtroom drama, which moment grabs your attention most?',
    options: [
      {
        id: 'a',
        label:
          'The cross-examination of an eyewitness whose memory of the crime might be wrong.',
        weights: { T_EYEWITNESS: 3, T_LAW_COURTROOM: 1, S_CRITICAL_SKEPTIC: 1 },
      },
      {
        id: 'b',
        label:
          'The forensic scientist explaining what the DNA evidence does — and does not — actually show.',
        weights: { T_FORENSIC_SCIENCE: 3, S_ANALYTICAL: 2, S_BIOLOGY_SCIENCE: 1 },
      },
      {
        id: 'c',
        label:
          'The defense argument that the defendant’s mental state should change the verdict.',
        weights: { T_COMPETENCY_NGRI: 3, T_NEUROSCIENCE: 1, T_LAW_COURTROOM: 1 },
      },
      {
        id: 'd',
        label: 'The closing argument and the dynamic between the lawyers and the jury.',
        weights: { T_TRIAL_STRATEGY: 3, S_COMMUNICATION: 2, T_LAW_COURTROOM: 1 },
      },
    ],
  },
  {
    id: 'q2_wrongful_conviction_lens',
    prompt:
      'You read a long article about a famous wrongful conviction. Which feeling stays with you longest afterward?',
    options: [
      {
        id: 'a',
        label:
          'Anger about how the police interrogation produced a false confession from an innocent person.',
        weights: { T_INTERROGATIONS: 3, T_WRONGFUL_CONVICTION: 2, S_CRITICAL_SKEPTIC: 1 },
      },
      {
        id: 'b',
        label: 'Curiosity about how the eyewitness so confidently misidentified the wrong person.',
        weights: { T_EYEWITNESS: 3, T_RESEARCH: 2, S_CRITICAL_SKEPTIC: 1 },
      },
      {
        id: 'c',
        label:
          'Concern that an unvalidated forensic technique (like bite-mark or hair analysis) was treated as proof.',
        weights: { T_FORENSIC_SCIENCE: 2, T_WRONGFUL_CONVICTION: 2, S_CRITICAL_SKEPTIC: 3 },
      },
      {
        id: 'd',
        label: 'Determination to change the laws and policies that allowed it to happen.',
        weights: { T_POLICY: 3, T_WRONGFUL_CONVICTION: 2, S_COMMUNICATION: 1 },
      },
    ],
  },
  {
    id: 'q3_sex_offense_comfort',
    prompt:
      'How comfortable would you be conducting a clinical assessment of someone convicted of a serious sexual offense?',
    helper:
      'Be honest — there are excellent careers in forensic psychology that do not require this kind of work.',
    options: [
      { id: 'a', label: 'Very uncomfortable — I would not want this work.', weights: {} },
      { id: 'b', label: 'Uncomfortable, but I could imagine it under the right supervision.', weights: { T_SEX_OFFENSE: 1 } },
      { id: 'c', label: 'Neutral — it depends on the setting.', weights: { T_SEX_OFFENSE: 2, S_EMOTIONAL_RESILIENCE: 1 } },
      {
        id: 'd',
        label: 'Comfortable — I see it as important clinical work.',
        weights: { T_SEX_OFFENSE: 3, T_INCARCERATED: 1, S_EMOTIONAL_RESILIENCE: 2 },
      },
      {
        id: 'e',
        label: 'Very comfortable — reducing reoffense risk through treatment is something I would actively want to do.',
        weights: { T_SEX_OFFENSE: 4, T_INCARCERATED: 2, S_EMOTIONAL_RESILIENCE: 3 },
      },
    ],
  },
  {
    id: 'q4_correctional_setting',
    prompt:
      'How appealing is the idea of working day-to-day inside a jail, prison, or correctional facility?',
    options: [
      { id: 'a', label: 'Not at all appealing — I would prefer almost any other setting.', weights: {} },
      { id: 'b', label: 'Slightly appealing — maybe as a short rotation, not a career.', weights: { T_INCARCERATED: 1 } },
      {
        id: 'c',
        label: 'Moderately appealing — I am drawn to underserved populations.',
        weights: { T_INCARCERATED: 2, T_VICTIM_WORK: 1, S_EMOTIONAL_RESILIENCE: 1 },
      },
      {
        id: 'd',
        label: 'Very appealing — I want to work directly with incarcerated people.',
        weights: { T_INCARCERATED: 3, S_EMOTIONAL_RESILIENCE: 2 },
      },
    ],
  },
  {
    id: 'q5_trauma_resilience',
    prompt:
      'Repeated exposure to graphic case materials — abuse details, crime scene photos, survivor interviews — is part of many forensic careers. How does that sit with you?',
    options: [
      { id: 'a', label: 'It would burn me out quickly. I want a career that avoids it.', weights: { T_RESEARCH: 1, T_POLICY: 1 } },
      { id: 'b', label: 'I can handle some of it but would want strong limits.', weights: { S_EMOTIONAL_RESILIENCE: 1 } },
      {
        id: 'c',
        label: 'I can handle it with support. I do not want it to be the entire job.',
        weights: { S_EMOTIONAL_RESILIENCE: 2, T_VICTIM_WORK: 1 },
      },
      {
        id: 'd',
        label: 'I am drawn to the work specifically because it engages with hard material.',
        weights: { S_EMOTIONAL_RESILIENCE: 3, T_VICTIM_WORK: 2 },
      },
    ],
  },
  {
    id: 'q6_population',
    prompt:
      'If you had to choose, which population would you most want to work with directly?',
    options: [
      {
        id: 'a',
        label: 'Children who have experienced abuse, violence, or are involved in legal proceedings.',
        weights: { T_CHILDREN: 3, T_VICTIM_WORK: 2, S_INTERPERSONAL_WARMTH: 2 },
      },
      {
        id: 'b',
        label: 'Adult survivors of intimate partner violence, sexual assault, or trafficking.',
        weights: { T_VICTIM_WORK: 3, T_DV_IPV: 2, T_TRAFFICKING: 1, S_INTERPERSONAL_WARMTH: 2 },
      },
      {
        id: 'c',
        label: 'People charged with or convicted of crimes (defendants, incarcerated people).',
        weights: { T_INCARCERATED: 3, T_COMPETENCY_NGRI: 1, T_SEX_OFFENSE: 1 },
      },
      {
        id: 'd',
        label: 'I would rather not work directly with any of these populations — give me data, courts, or policy.',
        weights: { T_RESEARCH: 2, T_POLICY: 2, T_LAW_COURTROOM: 1, T_TRIAL_STRATEGY: 1 },
      },
    ],
  },
  {
    id: 'q7_ideal_workday',
    prompt: 'Which of these workday descriptions sounds most like your dream?',
    options: [
      {
        id: 'a',
        label:
          'Morning interviewing a defendant for a court-ordered evaluation; afternoon writing a detailed report for the judge.',
        weights: { T_COMPETENCY_NGRI: 3, T_LAW_COURTROOM: 2, S_ANALYTICAL: 1 },
      },
      {
        id: 'b',
        label:
          'A day in the lab analyzing evidence and writing up technical findings.',
        weights: { T_FORENSIC_SCIENCE: 3, S_BIOLOGY_SCIENCE: 2, S_ANALYTICAL: 2 },
      },
      {
        id: 'c',
        label:
          'A day at a survivor advocacy center: intake interviews, accompanying a survivor to court, coordinating with prosecutors.',
        weights: { T_VICTIM_WORK: 3, S_INTERPERSONAL_WARMTH: 3, T_LAW_COURTROOM: 1 },
      },
      {
        id: 'd',
        label: 'Designing a study, running participants, and analyzing whether a memory technique reduces eyewitness errors.',
        weights: { T_RESEARCH: 3, T_EYEWITNESS: 2, S_ANALYTICAL: 2 },
      },
    ],
  },
  {
    id: 'q8_forensic_validity',
    prompt:
      'How do you react to the claim that several traditional forensic techniques (bite-mark analysis, hair comparison, certain ballistics matches) lack solid empirical support?',
    options: [
      { id: 'a', label: 'I had not thought about it — I would just trust the experts.', weights: {} },
      {
        id: 'b',
        label: 'It bothers me, but I would not want to work on the problem myself.',
        weights: { S_CRITICAL_SKEPTIC: 1 },
      },
      {
        id: 'c',
        label: 'It interests me — I would want to learn which techniques are scientifically defensible.',
        weights: { S_CRITICAL_SKEPTIC: 2, T_FORENSIC_SCIENCE: 1, T_WRONGFUL_CONVICTION: 1 },
      },
      {
        id: 'd',
        label:
          'I would want to be one of the people doing the validation research or pushing reform.',
        weights: { S_CRITICAL_SKEPTIC: 3, T_FORENSIC_SCIENCE: 2, T_WRONGFUL_CONVICTION: 2, T_RESEARCH: 2 },
      },
    ],
  },
  {
    id: 'q9_evidence_style',
    prompt:
      'Which kind of evidence are you more naturally drawn to thinking about?',
    options: [
      {
        id: 'a',
        label: 'Physical / biological evidence — DNA, fingerprints, trace materials.',
        weights: { T_FORENSIC_SCIENCE: 3, S_BIOLOGY_SCIENCE: 2, S_ANALYTICAL: 1 },
      },
      {
        id: 'b',
        label: 'Behavioral evidence — patterns of action, interview statements, psychology of the offender.',
        weights: { T_LIE_DETECTION: 2, T_INTERROGATIONS: 2, S_INVESTIGATIVE: 2 },
      },
      {
        id: 'c',
        label: 'Brain-based evidence — neuroimaging, head injury, cognitive testing.',
        weights: { T_NEUROSCIENCE: 3, S_BIOLOGY_SCIENCE: 1, S_ANALYTICAL: 2 },
      },
      {
        id: 'd',
        label: 'Statistical / population evidence — base rates, risk factors, group patterns.',
        weights: { T_THREAT_ASSESSMENT: 2, T_RESEARCH: 2, S_ANALYTICAL: 3 },
      },
    ],
  },
  {
    id: 'q10_training_tolerance',
    prompt:
      'Many forensic-psychology careers require a doctorate (PhD or PsyD), licensure, and several more years of supervised training. How does that path sound to you?',
    options: [
      { id: 'a', label: 'Too long — I want to start working in this field much sooner.', weights: {} },
      {
        id: 'b',
        label: 'I would consider a master’s, but a doctorate feels like too much.',
        weights: { S_LONG_TERM_TRAINING: 1 },
      },
      {
        id: 'c',
        label: 'I would do it if it were necessary for the work I want to do.',
        weights: { S_LONG_TERM_TRAINING: 2 },
      },
      {
        id: 'd',
        label: 'I am genuinely excited about doctoral training and the depth it provides.',
        weights: { S_LONG_TERM_TRAINING: 3, T_RESEARCH: 1 },
      },
    ],
  },
  {
    id: 'q11_eyewitness_question',
    prompt:
      'Suppose you could investigate any one question about eyewitness identification. Which interests you most?',
    options: [
      {
        id: 'a',
        label: 'How do lineup procedures (sequential vs. simultaneous) affect identification accuracy?',
        weights: { T_EYEWITNESS: 3, T_RESEARCH: 2, S_ANALYTICAL: 1 },
      },
      {
        id: 'b',
        label: 'Why are people so confident in memories that turn out to be wrong?',
        weights: { T_EYEWITNESS: 2, T_RESEARCH: 2, T_NEUROSCIENCE: 1 },
      },
      {
        id: 'c',
        label: 'How can defense attorneys actually use this research to challenge IDs at trial?',
        weights: { T_LAW_COURTROOM: 2, T_EYEWITNESS: 2, T_TRIAL_STRATEGY: 1 },
      },
      {
        id: 'd',
        label: 'How do we get this research adopted as standard practice by police departments?',
        weights: { T_POLICY: 3, T_EYEWITNESS: 1, T_LAW_ENFORCEMENT: 2 },
      },
    ],
  },
  {
    id: 'q12_interrogation_lens',
    prompt:
      'When you think about police interrogations, which question feels most important to you?',
    options: [
      {
        id: 'a',
        label: 'Why do innocent people sometimes confess to crimes they did not commit?',
        weights: { T_INTERROGATIONS: 3, T_WRONGFUL_CONVICTION: 2, T_RESEARCH: 1 },
      },
      {
        id: 'b',
        label: 'How can you actually tell, in the moment, whether someone is being truthful or deceptive?',
        weights: { T_LIE_DETECTION: 3, S_INVESTIGATIVE: 2, S_CRITICAL_SKEPTIC: 1 },
      },
      {
        id: 'c',
        label: 'How should police be trained to interview suspects in ways that are both effective and ethical?',
        weights: { T_LAW_ENFORCEMENT: 2, T_POLICY: 2, T_INTERROGATIONS: 2 },
      },
      {
        id: 'd',
        label: 'How should the legal system treat confessions that may be unreliable?',
        weights: { T_LAW_COURTROOM: 2, T_POLICY: 2, T_WRONGFUL_CONVICTION: 1 },
      },
    ],
  },
  {
    id: 'q13_dv_direct_service',
    prompt:
      'How drawn are you to direct, day-in-day-out work with survivors of domestic or intimate partner violence?',
    options: [
      { id: 'a', label: 'Not particularly drawn — it is important work but not for me.', weights: {} },
      { id: 'b', label: 'Mildly drawn — I would consider it.', weights: { T_DV_IPV: 1, T_VICTIM_WORK: 1 } },
      {
        id: 'c',
        label: 'Very drawn — the relational work and the safety planning both matter to me.',
        weights: { T_DV_IPV: 3, T_VICTIM_WORK: 2, S_INTERPERSONAL_WARMTH: 2 },
      },
      {
        id: 'd',
        label: 'It is a primary reason I am interested in this field.',
        weights: { T_DV_IPV: 4, T_VICTIM_WORK: 3, S_INTERPERSONAL_WARMTH: 3, S_EMOTIONAL_RESILIENCE: 1 },
      },
    ],
  },
  {
    id: 'q14_trafficking_angle',
    prompt:
      'If you wanted to engage with the issue of human trafficking, which angle calls you most?',
    options: [
      {
        id: 'a',
        label: 'Frontline advocacy and clinical care for survivors.',
        weights: { T_TRAFFICKING: 3, T_VICTIM_WORK: 2, S_INTERPERSONAL_WARMTH: 2 },
      },
      {
        id: 'b',
        label: 'Investigation and disruption of trafficking networks (often working with law enforcement).',
        weights: { T_TRAFFICKING: 2, T_LAW_ENFORCEMENT: 2, S_INVESTIGATIVE: 3 },
      },
      {
        id: 'c',
        label: 'Policy reform: changing laws, funding, and immigration practices.',
        weights: { T_TRAFFICKING: 2, T_POLICY: 3, S_COMMUNICATION: 1 },
      },
      {
        id: 'd',
        label: 'I am not particularly drawn to this issue.',
        weights: {},
      },
    ],
  },
  {
    id: 'q15_identity_violence',
    prompt:
      'How interested are you in working on hate crimes and identity-based violence (against people targeted for race, religion, gender identity, sexual orientation, etc.)?',
    options: [
      { id: 'a', label: 'Not especially.', weights: {} },
      { id: 'b', label: 'Somewhat — I see it as one of several issues I care about.', weights: { T_VICTIM_WORK: 1 } },
      {
        id: 'c',
        label: 'Very interested — the systemic dimensions of these crimes are important to me.',
        weights: { T_VICTIM_WORK: 2, T_POLICY: 2, S_COMMUNICATION: 1 },
      },
      {
        id: 'd',
        label: 'It is central to why I am studying this field.',
        weights: { T_VICTIM_WORK: 3, T_POLICY: 3, S_INTERPERSONAL_WARMTH: 1, S_EMOTIONAL_RESILIENCE: 2 },
      },
    ],
  },
  {
    id: 'q16_threat_assessment',
    prompt:
      'A school district hires you to evaluate whether a particular student poses a credible risk of violence and to write a structured risk report. Reaction?',
    options: [
      { id: 'a', label: 'No thanks — too high-stakes, not my interest.', weights: {} },
      {
        id: 'b',
        label: 'I could do it occasionally, but it would not be my main work.',
        weights: { T_THREAT_ASSESSMENT: 1, S_ANALYTICAL: 1 },
      },
      {
        id: 'c',
        label: 'Interesting — I would want training in structured risk tools.',
        weights: { T_THREAT_ASSESSMENT: 3, S_ANALYTICAL: 2 },
      },
      {
        id: 'd',
        label: 'This is exactly the work I want to do — prevention via good assessment.',
        weights: { T_THREAT_ASSESSMENT: 4, S_ANALYTICAL: 2, T_LAW_ENFORCEMENT: 1 },
      },
    ],
  },
  {
    id: 'q17_police_relationship',
    prompt:
      'How do you imagine your relationship with law enforcement, in the work you want to do?',
    options: [
      {
        id: 'a',
        label: 'Working inside or alongside police as a colleague — supporting officers, training, doing fitness-for-duty work.',
        weights: { T_LAW_ENFORCEMENT: 3, T_THREAT_ASSESSMENT: 1 },
      },
      {
        id: 'b',
        label: 'Partnering with police on cases (e.g., behavioral analysis, forensic interviewing) without being part of the department.',
        weights: { T_LAW_ENFORCEMENT: 2, S_INVESTIGATIVE: 2 },
      },
      {
        id: 'c',
        label: 'Critical and reform-minded — I want to study, critique, and improve police practices from the outside.',
        weights: { T_POLICY: 2, T_RESEARCH: 1, S_CRITICAL_SKEPTIC: 2 },
      },
      {
        id: 'd',
        label: 'Mostly separate — I want to work with people on the other side of the system (defense, survivors, defendants).',
        weights: { T_VICTIM_WORK: 1, T_INCARCERATED: 1, T_WRONGFUL_CONVICTION: 1 },
      },
    ],
  },
  {
    id: 'q18_brain_behavior',
    prompt:
      '"How brain injuries, neurological conditions, and cognitive impairments affect criminal behavior and culpability." How interested are you in that question?',
    options: [
      { id: 'a', label: 'Not especially.', weights: {} },
      { id: 'b', label: 'Mildly — it sounds intellectually interesting.', weights: { T_NEUROSCIENCE: 1 } },
      {
        id: 'c',
        label: 'Very interested — I would consider specializing in this.',
        weights: { T_NEUROSCIENCE: 3, S_BIOLOGY_SCIENCE: 2, T_COMPETENCY_NGRI: 1 },
      },
      {
        id: 'd',
        label: 'This is one of the most exciting parts of the field for me.',
        weights: { T_NEUROSCIENCE: 4, S_BIOLOGY_SCIENCE: 2, T_COMPETENCY_NGRI: 2, S_LONG_TERM_TRAINING: 1 },
      },
    ],
  },
  {
    id: 'q19_civil_commitment',
    prompt:
      'Civil commitment evaluations decide whether someone with serious mental illness can be hospitalized against their will, or whether a person who has completed a sex-offense sentence should remain in custody. How does this kind of work strike you?',
    options: [
      { id: 'a', label: 'Too ethically heavy — I would not want this responsibility.', weights: {} },
      { id: 'b', label: 'Important, but not my draw.', weights: { T_CIVIL_COMMITMENT: 1 } },
      {
        id: 'c',
        label: 'Meaningful — I would want to do it carefully, with rigorous standards.',
        weights: { T_CIVIL_COMMITMENT: 3, S_ANALYTICAL: 2, T_LAW_COURTROOM: 1 },
      },
      {
        id: 'd',
        label: 'This is the kind of high-stakes assessment work I am drawn to.',
        weights: { T_CIVIL_COMMITMENT: 4, T_SEX_OFFENSE: 1, S_ANALYTICAL: 2, T_COMPETENCY_NGRI: 2 },
      },
    ],
  },
  {
    id: 'q20_competency_ngri',
    prompt:
      'You are asked to evaluate whether a defendant understands the charges against them well enough to stand trial, or whether they qualify for a not-guilty-by-reason-of-insanity defense. Reaction?',
    options: [
      { id: 'a', label: 'Not for me.', weights: {} },
      { id: 'b', label: 'I could do it, but I would prefer other work.', weights: { T_COMPETENCY_NGRI: 1 } },
      {
        id: 'c',
        label: 'Interesting — the intersection of clinical judgment and law is appealing.',
        weights: { T_COMPETENCY_NGRI: 3, T_LAW_COURTROOM: 2, S_ANALYTICAL: 1 },
      },
      {
        id: 'd',
        label: 'Yes — this is precisely the niche I want.',
        weights: { T_COMPETENCY_NGRI: 4, T_LAW_COURTROOM: 2, S_ANALYTICAL: 2, S_LONG_TERM_TRAINING: 1 },
      },
    ],
  },
  {
    id: 'q21_jury_selection',
    prompt:
      'A trial consultant’s job includes helping attorneys pick a jury, develop themes, and prepare witnesses. How do you feel about that work?',
    options: [
      { id: 'a', label: 'Uncomfortable — it feels like manipulation.', weights: { S_CRITICAL_SKEPTIC: 1 } },
      { id: 'b', label: 'Neutral — not really my interest.', weights: {} },
      {
        id: 'c',
        label: 'Intriguing — it combines psychology and strategy.',
        weights: { T_TRIAL_STRATEGY: 3, T_LAW_COURTROOM: 2, S_COMMUNICATION: 2 },
      },
      {
        id: 'd',
        label: 'Energizing — I love the strategic, applied nature of it.',
        weights: { T_TRIAL_STRATEGY: 4, T_LAW_COURTROOM: 2, S_COMMUNICATION: 3, S_ANALYTICAL: 1 },
      },
    ],
  },
  {
    id: 'q22_expert_testimony',
    prompt:
      '"I would enjoy taking the witness stand and explaining complex psychological research to a jury." How true is that of you?',
    options: [
      { id: 'a', label: 'Not at all true.', weights: {} },
      { id: 'b', label: 'Slightly true.', weights: { S_COMMUNICATION: 1 } },
      {
        id: 'c',
        label: 'Mostly true — I am a strong communicator and enjoy translating research.',
        weights: { S_COMMUNICATION: 3, T_LAW_COURTROOM: 2, T_RESEARCH: 1 },
      },
      {
        id: 'd',
        label: 'Very true — testifying as an expert is part of why this field interests me.',
        weights: { S_COMMUNICATION: 4, T_LAW_COURTROOM: 3, T_TRIAL_STRATEGY: 1, S_LONG_TERM_TRAINING: 1 },
      },
    ],
  },
  {
    id: 'q23_research_vs_practice',
    prompt:
      'Five years in, what does your career rhythm look like?',
    options: [
      {
        id: 'a',
        label: 'Mostly seeing clients or evaluees one-on-one.',
        weights: { S_INTERPERSONAL_WARMTH: 2, T_VICTIM_WORK: 1, T_COMPETENCY_NGRI: 1 },
      },
      {
        id: 'b',
        label: 'A mix of clinical work, court testimony, and consultation.',
        weights: { T_LAW_COURTROOM: 2, S_COMMUNICATION: 1, T_COMPETENCY_NGRI: 1, T_CIVIL_COMMITMENT: 1 },
      },
      {
        id: 'c',
        label: 'Mostly research — designing studies, writing papers, training students.',
        weights: { T_RESEARCH: 4, S_ANALYTICAL: 2, S_LONG_TERM_TRAINING: 2 },
      },
      {
        id: 'd',
        label: 'Mostly applied / non-clinical work: investigation, advocacy, policy, or program leadership.',
        weights: { T_POLICY: 2, S_INVESTIGATIVE: 2, T_VICTIM_WORK: 1 },
      },
    ],
  },
  {
    id: 'q24_change_lever',
    prompt:
      'When you imagine actually changing how the legal system handles psychology-related issues, which lever feels most natural to pull?',
    options: [
      {
        id: 'a',
        label: 'Working one case at a time — each evaluation, each trial, each survivor matters.',
        weights: { T_LAW_COURTROOM: 1, T_VICTIM_WORK: 1, T_COMPETENCY_NGRI: 1 },
      },
      {
        id: 'b',
        label: 'Producing research that the courts and policymakers will eventually have to listen to.',
        weights: { T_RESEARCH: 3, S_ANALYTICAL: 1, S_CRITICAL_SKEPTIC: 1 },
      },
      {
        id: 'c',
        label: 'Working directly on legislation, agency policy, and public advocacy.',
        weights: { T_POLICY: 4, S_COMMUNICATION: 2 },
      },
      {
        id: 'd',
        label: 'Training the next generation of practitioners and police officers to do better.',
        weights: { S_COMMUNICATION: 2, T_LAW_ENFORCEMENT: 1, T_POLICY: 1, T_RESEARCH: 1 },
      },
    ],
  },
  {
    id: 'q25_mission',
    prompt:
      'Pick the mission statement that resonates most strongly with you.',
    options: [
      {
        id: 'a',
        label: 'I want to help people who have been harmed feel safer and more whole.',
        weights: { T_VICTIM_WORK: 3, S_INTERPERSONAL_WARMTH: 2, T_DV_IPV: 1 },
      },
      {
        id: 'b',
        label: 'I want to make sure no one is convicted of a crime they did not commit.',
        weights: { T_WRONGFUL_CONVICTION: 3, S_CRITICAL_SKEPTIC: 2, T_LAW_COURTROOM: 1 },
      },
      {
        id: 'c',
        label: 'I want to bring real science — about brains, behavior, evidence — into the courtroom.',
        weights: { T_RESEARCH: 2, T_NEUROSCIENCE: 1, T_FORENSIC_SCIENCE: 1, S_COMMUNICATION: 2, T_LAW_COURTROOM: 1 },
      },
      {
        id: 'd',
        label: 'I want to predict and prevent serious violence before it happens.',
        weights: { T_THREAT_ASSESSMENT: 3, T_LAW_ENFORCEMENT: 1, S_ANALYTICAL: 2 },
      },
      {
        id: 'e',
        label: 'I want to change the laws and systems that shape who ends up in the criminal-legal system in the first place.',
        weights: { T_POLICY: 4, S_COMMUNICATION: 1, T_RESEARCH: 1 },
      },
    ],
  },
];
