// Tag vocabulary for the Forensic Psychology career-interest quiz.
// Each quiz option contributes weights to one or more tags; each career has a
// target weight per tag. Scoring is the dot product of the two vectors.
//
// Two families of tags:
//   T_*  topical interests (the subject matter someone is drawn to)
//   S_*  skills / dispositions (how they like to work)

export const TAGS = [
  // Topical interests
  'T_LIE_DETECTION',
  'T_INTERROGATIONS',
  'T_EYEWITNESS',
  'T_FORENSIC_SCIENCE',
  'T_WRONGFUL_CONVICTION',
  'T_THREAT_ASSESSMENT',
  'T_SEX_OFFENSE',
  'T_VICTIM_WORK',
  'T_DV_IPV',
  'T_TRAFFICKING',
  'T_NEUROSCIENCE',
  'T_LAW_COURTROOM',
  'T_POLICY',
  'T_LAW_ENFORCEMENT',
  'T_RESEARCH',
  'T_CHILDREN',
  'T_INCARCERATED',
  'T_TRIAL_STRATEGY',
  'T_CIVIL_COMMITMENT',
  'T_COMPETENCY_NGRI',

  // Skills / dispositions
  'S_CRITICAL_SKEPTIC',
  'S_EMOTIONAL_RESILIENCE',
  'S_INTERPERSONAL_WARMTH',
  'S_ANALYTICAL',
  'S_COMMUNICATION',
  'S_LONG_TERM_TRAINING',
  'S_INVESTIGATIVE',
  'S_BIOLOGY_SCIENCE',
] as const;

export type Tag = (typeof TAGS)[number];

export type TagWeights = Partial<Record<Tag, number>>;
