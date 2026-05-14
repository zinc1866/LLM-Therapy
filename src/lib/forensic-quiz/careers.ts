import type { TagWeights } from './tags';

export type Resource = {
  label: string;
  // A free-text "where to look" string. We avoid hardcoding URLs that may rot;
  // students can search the resource name. Instructors can update as needed.
  description: string;
};

export type Career = {
  id: string;
  title: string;
  shortPitch: string; // one-line hook used in card headers
  description: string; // 2-4 sentences describing the day-to-day work
  credentials: string; // 2-4 sentences on degrees, licensure, training
  resources: Resource[];
  weights: TagWeights; // tag profile this career rewards
};

export const CAREERS: Career[] = [
  {
    id: 'forensic_psychologist_general',
    title: 'Forensic Psychologist (General Practice)',
    shortPitch:
      'A licensed psychologist who applies clinical expertise to questions raised by the legal system.',
    description:
      'Forensic psychologists conduct court-ordered evaluations (competence to stand trial, criminal responsibility, custody, civil commitment), consult with attorneys, and often testify as expert witnesses. The work blends interviewing, psychological testing, careful report writing, and translating clinical findings into language judges and juries can use.',
    credentials:
      'Doctorate (PhD or PsyD) in clinical or counseling psychology, a one-year predoctoral internship, and a postdoctoral year — often with formal forensic training. State psychology licensure is required. Many practitioners also pursue board certification through the American Board of Forensic Psychology (ABFP).',
    resources: [
      { label: 'American Psychology-Law Society (APA Division 41)', description: 'Professional home for forensic psychology; student section, mentorship, careers page.' },
      { label: 'American Board of Forensic Psychology (ABFP)', description: 'Information on board certification and what training pathways look like.' },
      { label: 'AP-LS Guide to Graduate Programs in Forensic and Legal Psychology', description: 'Searchable list of accredited and forensic-focused doctoral programs.' },
    ],
    weights: {
      T_LAW_COURTROOM: 3,
      T_COMPETENCY_NGRI: 2,
      T_CIVIL_COMMITMENT: 2,
      S_LONG_TERM_TRAINING: 3,
      S_ANALYTICAL: 2,
      S_COMMUNICATION: 2,
    },
  },
  {
    id: 'forensic_neuropsychologist',
    title: 'Forensic Neuropsychologist',
    shortPitch:
      'Brain–behavior expert who helps courts understand how neurological conditions affect criminal and civil questions.',
    description:
      'Forensic neuropsychologists assess cognitive functioning in cases involving traumatic brain injury, dementia, intellectual disability, or neurological disease. Their reports inform questions about competency, criminal responsibility, capacity, and damages in personal-injury litigation. Expect a heavy emphasis on standardized testing, validity assessment (effort/malingering), and clear technical writing.',
    credentials:
      'Doctorate in clinical psychology with a neuropsychology specialization, a two-year postdoctoral fellowship in clinical neuropsychology (Houston Conference standards), and licensure. Many pursue board certification through the American Board of Clinical Neuropsychology (ABCN) and additional forensic credentials.',
    resources: [
      { label: 'American Academy of Clinical Neuropsychology (AACN)', description: 'Standards, training pathways, and student resources.' },
      { label: 'National Academy of Neuropsychology (NAN)', description: 'Practice information and continuing-education materials.' },
      { label: 'AP-LS Division 41', description: 'Forensic-side overlap and conferences.' },
    ],
    weights: {
      T_NEUROSCIENCE: 4,
      T_COMPETENCY_NGRI: 2,
      T_LAW_COURTROOM: 2,
      S_BIOLOGY_SCIENCE: 2,
      S_ANALYTICAL: 3,
      S_LONG_TERM_TRAINING: 3,
    },
  },
  {
    id: 'police_psychologist',
    title: 'Police / Public Safety Psychologist',
    shortPitch:
      'A psychologist embedded with law enforcement, supporting officers and shaping how police work gets done.',
    description:
      'Police psychologists do pre-employment screening, fitness-for-duty evaluations, post-incident counseling, hostage-negotiation consultation, and training (de-escalation, interview skills, bias). The work is genuinely collaborative with law enforcement agencies.',
    credentials:
      'Doctorate in clinical, counseling, or I-O psychology and licensure. Many also hold board certification in police and public safety psychology through the American Board of Police and Public Safety Psychology (ABPPSP).',
    resources: [
      { label: 'APA Division 18 — Police and Public Safety Section', description: 'Professional section dedicated to police psychology.' },
      { label: 'IACP Police Psychological Services Section', description: 'Practice guidelines used in the field.' },
      { label: 'Society for Police and Criminal Psychology (SPCP)', description: 'Conferences and student opportunities.' },
    ],
    weights: {
      T_LAW_ENFORCEMENT: 4,
      T_THREAT_ASSESSMENT: 1,
      S_INTERPERSONAL_WARMTH: 1,
      S_LONG_TERM_TRAINING: 3,
      S_COMMUNICATION: 2,
    },
  },
  {
    id: 'correctional_psychologist',
    title: 'Correctional Psychologist',
    shortPitch:
      'A clinician who provides mental-health care and assessment inside jails and prisons.',
    description:
      'Correctional psychologists do intake screening, crisis intervention, individual and group therapy, and assessment for incarcerated people. They navigate a complex setting where confidentiality, safety, and the institution’s rules are constantly in tension.',
    credentials:
      'Most positions require a doctorate (PhD/PsyD) and licensure, though some assessment and counseling roles accept a master’s in counseling or social work. Federal Bureau of Prisons and state DOC systems are major employers; many offer loan-repayment programs.',
    resources: [
      { label: 'International Association for Correctional and Forensic Psychology (IACFP)', description: 'Field-defining professional organization.' },
      { label: 'APA Criminal Justice Section (Div 18)', description: 'Section dedicated to corrections work.' },
      { label: 'Federal Bureau of Prisons — Psychology Services', description: 'Information on internships and job pathways.' },
    ],
    weights: {
      T_INCARCERATED: 4,
      T_VICTIM_WORK: 1,
      S_EMOTIONAL_RESILIENCE: 3,
      S_INTERPERSONAL_WARMTH: 2,
      S_LONG_TERM_TRAINING: 2,
    },
  },
  {
    id: 'sex_offense_specialist',
    title: 'Sex-Offense-Specific Evaluator and Treatment Provider',
    shortPitch:
      'A specialist who assesses and treats people who have committed sexual offenses.',
    description:
      'These clinicians conduct pre-sentence and sex-offender risk evaluations (Static-99R, STABLE-2007, ACUTE-2007), provide individual and group treatment, and consult on civil commitment of sexually violent persons (SVP). The population is challenging and the work is grounded in carefully validated risk tools.',
    credentials:
      'Most jurisdictions require a master’s or doctorate in a mental-health field, licensure, and specialized post-licensure training. Many providers hold ATSA (Association for the Treatment and Prevention of Sexual Abuse) clinical certification or state-level sex-offender treatment provider credentials.',
    resources: [
      { label: 'Association for the Treatment and Prevention of Sexual Abuse (ATSA)', description: 'The flagship professional organization for this work.' },
      { label: 'Static-99R / STABLE-2007 training', description: 'Standard actuarial and dynamic risk tools used in the field.' },
      { label: 'SOMAPI (Sex Offender Management Assessment and Planning Initiative)', description: 'Federally produced overview of the evidence base.' },
    ],
    weights: {
      T_SEX_OFFENSE: 4,
      T_INCARCERATED: 2,
      T_CIVIL_COMMITMENT: 2,
      S_EMOTIONAL_RESILIENCE: 3,
      S_ANALYTICAL: 2,
      S_LONG_TERM_TRAINING: 2,
    },
  },
  {
    id: 'threat_assessment',
    title: 'Violence Threat Assessment Specialist',
    shortPitch:
      'A psychologist or behavioral analyst who helps prevent targeted violence by carefully evaluating risk.',
    description:
      'Threat assessment professionals work with schools, workplaces, universities, federal agencies, and law enforcement to evaluate concerning behavior and recommend interventions. The discipline emphasizes structured professional judgment (SPJ) instruments such as the HCR-20, WAVR-21, and youth-focused tools (SAVRY, ERASOR).',
    credentials:
      'A doctorate in clinical or counseling psychology with forensic training is typical for evaluator roles; school psychology and forensic social work also enter this space. Specialized training through ATAP (Association of Threat Assessment Professionals) is widely valued; some agencies require a clearance.',
    resources: [
      { label: 'Association of Threat Assessment Professionals (ATAP)', description: 'Largest professional body for threat assessment practice.' },
      { label: 'Cawood & Corcoran, Violence Assessment and Intervention', description: 'Foundational practitioner text.' },
      { label: 'U.S. Secret Service NTAC reports', description: 'Free, empirically grounded reports on targeted violence prevention.' },
    ],
    weights: {
      T_THREAT_ASSESSMENT: 4,
      T_LAW_ENFORCEMENT: 2,
      S_ANALYTICAL: 3,
      S_INVESTIGATIVE: 2,
      S_LONG_TERM_TRAINING: 2,
    },
  },
  {
    id: 'civil_commitment_evaluator',
    title: 'Civil Commitment / NGRI / Competency Evaluator',
    shortPitch:
      'A forensic clinician whose job is the high-stakes legal evaluation: can this person stand trial, were they responsible, should they be hospitalized?',
    description:
      'These evaluators interview defendants, review records, administer forensic assessment instruments (e.g., MacCAT-CA, R-CRAS, ECST-R), and write reports the court relies on. Many work for state forensic hospitals, court clinics, or in private forensic practice.',
    credentials:
      'Doctorate in clinical/counseling psychology, licensure, and specific forensic training are standard. State-specific certifications exist (for example, "qualified forensic evaluator" rosters); ABFP board certification is the senior-level credential.',
    resources: [
      { label: 'American Academy of Forensic Psychology (AAFP) workshops', description: 'High-quality continuing education in forensic assessment.' },
      { label: 'Specialty Guidelines for Forensic Psychology (APA, 2013)', description: 'Practice document every aspiring forensic evaluator should read.' },
      { label: 'Melton, Petrila, Poythress & Slobogin, Psychological Evaluations for the Courts', description: 'The standard reference text.' },
    ],
    weights: {
      T_COMPETENCY_NGRI: 4,
      T_CIVIL_COMMITMENT: 3,
      T_LAW_COURTROOM: 3,
      S_ANALYTICAL: 2,
      S_LONG_TERM_TRAINING: 3,
    },
  },
  {
    id: 'trial_consultant',
    title: 'Trial / Jury Consultant',
    shortPitch:
      'A behind-the-scenes psychologist who helps attorneys pick juries, develop themes, and prepare witnesses.',
    description:
      'Trial consultants run mock trials and focus groups, conduct community attitude surveys, advise on voir dire, help with witness preparation, and shape demonstrative exhibits. The work is strategic, applied, and travel-heavy.',
    credentials:
      'Many trial consultants hold a doctorate in social, cognitive, or experimental psychology — clinical training is not always required. Membership in the American Society of Trial Consultants (ASTC) is a strong signal in the field. Some enter through law firms or via a JD/PhD pathway.',
    resources: [
      { label: 'American Society of Trial Consultants (ASTC)', description: 'Professional standards, conferences, and a member directory.' },
      { label: 'Court Call (ASTC journal)', description: 'Practitioner-oriented publication.' },
      { label: 'Trial-consulting firms (look at their team pages)', description: 'A useful way to see the actual training paths people take into the field.' },
    ],
    weights: {
      T_TRIAL_STRATEGY: 4,
      T_LAW_COURTROOM: 3,
      S_COMMUNICATION: 3,
      S_ANALYTICAL: 2,
      S_LONG_TERM_TRAINING: 1,
    },
  },
  {
    id: 'expert_witness',
    title: 'Expert Witness (Subject-Matter Specialist)',
    shortPitch:
      'A researcher or clinician who explains complex psychological science to judges and juries.',
    description:
      'Many forensic careers include expert testimony, but some psychologists build a substantial part of their practice around being called as a subject-matter expert — on eyewitness memory, false confessions, traumatic memory, repressed-memory claims, child-witness reliability, or risk assessment. Most hold full-time research or clinical positions and consult on the side.',
    credentials:
      'A doctorate in psychology (clinical, cognitive, social, or developmental, depending on the topic) is essentially required, along with a substantial publication record in the area you testify about. State licensure is needed for clinical testimony.',
    resources: [
      { label: 'AP-LS Division 41 — Expert Witness section', description: 'Guidance and ethical considerations.' },
      { label: 'Daubert standard and Federal Rules of Evidence 702', description: 'The legal framework experts must understand.' },
      { label: 'Faigman et al., Modern Scientific Evidence', description: 'Standard multi-volume reference.' },
    ],
    weights: {
      S_COMMUNICATION: 4,
      T_LAW_COURTROOM: 3,
      T_RESEARCH: 2,
      S_LONG_TERM_TRAINING: 2,
      S_CRITICAL_SKEPTIC: 1,
    },
  },
  {
    id: 'forensic_interviewer',
    title: 'Forensic Interviewer (Children & Vulnerable Witnesses)',
    shortPitch:
      'A specialist who interviews children, survivors, and witnesses in a way that protects accuracy and the person.',
    description:
      'Forensic interviewers work at Children’s Advocacy Centers, child welfare agencies, and multidisciplinary teams. They use structured, research-based protocols (NICHD, ChildFirst®/Finding Words, RATAC) so that interviews are admissible in court without re-traumatizing the witness.',
    credentials:
      'A bachelor’s or master’s in social work, psychology, or criminal justice, plus completion of an accredited forensic-interviewer training and ongoing peer review. Doctoral-level evaluators sometimes specialize here too.',
    resources: [
      { label: 'National Children’s Advocacy Center (NCAC)', description: 'Training and standards for forensic interviewing of children.' },
      { label: 'NICHD Investigative Interview Protocol', description: 'Evidence-based protocol used worldwide.' },
      { label: 'APSAC (American Professional Society on the Abuse of Children)', description: 'Guidelines, conferences, and credentialing.' },
    ],
    weights: {
      T_CHILDREN: 4,
      T_VICTIM_WORK: 3,
      S_INTERPERSONAL_WARMTH: 3,
      S_INVESTIGATIVE: 2,
      S_EMOTIONAL_RESILIENCE: 2,
    },
  },
  {
    id: 'victim_advocate',
    title: 'Victim Advocate / Survivor Services Specialist',
    shortPitch:
      'A frontline supporter for survivors of crime, navigating the legal and social systems with them.',
    description:
      'Victim advocates help survivors of violent crime, sexual assault, and trafficking access services, complete protective orders, prepare for court testimony, and connect to mental-health care. Many work in prosecutor’s offices, hospitals, rape-crisis centers, or community-based organizations.',
    credentials:
      'A bachelor’s in psychology, social work, or criminal justice is the typical entry point; many supervisory roles require a master’s. National Advocate Credentialing Program (NACP) certification is widely recognized.',
    resources: [
      { label: 'National Organization for Victim Assistance (NOVA)', description: 'Professional home and credentialing pathway.' },
      { label: 'Office for Victims of Crime (OVC, U.S. DOJ)', description: 'Funding sources, training, and the federal legal landscape.' },
      { label: 'RAINN, NCADV, Polaris Project', description: 'Major issue-area organizations (sexual violence, DV, trafficking) that hire and train advocates.' },
    ],
    weights: {
      T_VICTIM_WORK: 4,
      T_DV_IPV: 2,
      T_TRAFFICKING: 1,
      S_INTERPERSONAL_WARMTH: 4,
      S_EMOTIONAL_RESILIENCE: 2,
      S_LONG_TERM_TRAINING: 0,
    },
  },
  {
    id: 'dv_ipv_counselor',
    title: 'Domestic / Intimate Partner Violence Counselor',
    shortPitch:
      'A clinician focused on the psychology and safety of survivors of intimate partner violence.',
    description:
      'DV/IPV counselors provide individual and group therapy for survivors, conduct danger assessments (e.g., the Danger Assessment scale), help with safety planning, and consult with shelters, courts, and police. Some also work with people who have used violence (BIP — Batterer Intervention Programs).',
    credentials:
      'A master’s in clinical mental health, social work, or marriage and family therapy with state licensure (LPC/LCSW/LMFT) is the most common path. Specialized training through state DV coalitions and NCADV is essential.',
    resources: [
      { label: 'National Coalition Against Domestic Violence (NCADV)', description: 'Training, advocacy, and policy work.' },
      { label: 'Futures Without Violence', description: 'National training and policy organization.' },
      { label: 'Danger Assessment (Jacquelyn Campbell)', description: 'Widely used lethality assessment, with formal training pathway.' },
    ],
    weights: {
      T_DV_IPV: 4,
      T_VICTIM_WORK: 3,
      S_INTERPERSONAL_WARMTH: 4,
      S_EMOTIONAL_RESILIENCE: 2,
      S_LONG_TERM_TRAINING: 2,
    },
  },
  {
    id: 'anti_trafficking_specialist',
    title: 'Anti-Human-Trafficking Specialist',
    shortPitch:
      'A practitioner working to identify, support, and protect survivors of labor and sex trafficking.',
    description:
      'Anti-trafficking specialists may serve survivors directly (case management, trauma-informed therapy), work on identification and rescue alongside law enforcement, or focus on policy, immigration relief (T and U visas), and prevention. The field is genuinely interdisciplinary.',
    credentials:
      'Entry roles take a bachelor’s in social work, psychology, or related fields; clinical and supervisory roles require an MSW, MA in counseling, or doctorate. Specialized trauma and trafficking training (Polaris, OVC TTAC) is expected.',
    resources: [
      { label: 'Polaris Project', description: 'Operates the U.S. National Human Trafficking Hotline; major training and policy hub.' },
      { label: 'Office for Victims of Crime — Human Trafficking Capacity Building Center', description: 'Free training and technical assistance.' },
      { label: 'HEAL Trafficking', description: 'Health-focused anti-trafficking professionals network.' },
    ],
    weights: {
      T_TRAFFICKING: 4,
      T_VICTIM_WORK: 3,
      S_INTERPERSONAL_WARMTH: 2,
      S_EMOTIONAL_RESILIENCE: 3,
      T_POLICY: 1,
    },
  },
  {
    id: 'eyewitness_researcher',
    title: 'Eyewitness Memory / Legal-Cognition Researcher',
    shortPitch:
      'An academic scientist studying how memory, identification, and testimony actually work.',
    description:
      'These researchers run experiments on lineup procedures, suggestibility, post-event misinformation, confidence-accuracy relationships, and how to communicate eyewitness science to courts and police. Many also testify and consult with reform commissions.',
    credentials:
      'A PhD in cognitive, social, or experimental psychology (often legal psychology programs at John Jay, Iowa State, Florida International, etc.). The path is research-heavy from undergrad onward (RAships, posters, conference talks).',
    resources: [
      { label: 'AP-LS (Division 41) student section', description: 'Student-focused resources, conference, awards.' },
      { label: 'Wells, Memon, & Penrod, "Eyewitness Evidence"', description: 'Standard scholarly review.' },
      { label: 'National Academy of Sciences, "Identifying the Culprit" (2014)', description: 'Field-defining policy report.' },
    ],
    weights: {
      T_EYEWITNESS: 4,
      T_RESEARCH: 4,
      S_ANALYTICAL: 3,
      S_LONG_TERM_TRAINING: 3,
      S_CRITICAL_SKEPTIC: 2,
    },
  },
  {
    id: 'false_confession_researcher',
    title: 'False-Confession & Interrogation Reform Researcher',
    shortPitch:
      'A researcher and advocate working to make police interrogations more accurate and less coercive.',
    description:
      'This work involves laboratory and field studies of interrogation tactics (Reid technique vs. PEACE / HIG-style information-gathering), analysis of real interrogation transcripts, and partnership with reform organizations and police trainers.',
    credentials:
      'PhD in social, cognitive, or legal psychology, or a clinical PhD with a research focus. Some practitioners enter via JD/PhD or a master’s plus a research role at a reform organization.',
    resources: [
      { label: 'High-Value Detainee Interrogation Group (HIG) research program', description: 'U.S. federal program funding science-based interrogation research.' },
      { label: 'Center on Wrongful Convictions (Northwestern Pritzker Law)', description: 'Influential research and litigation hub.' },
      { label: 'Saul Kassin’s research', description: 'Foundational scholarship on false confessions.' },
    ],
    weights: {
      T_INTERROGATIONS: 4,
      T_WRONGFUL_CONVICTION: 3,
      T_RESEARCH: 3,
      S_CRITICAL_SKEPTIC: 2,
      S_LONG_TERM_TRAINING: 2,
    },
  },
  {
    id: 'innocence_investigator',
    title: 'Innocence Project / Wrongful Conviction Investigator',
    shortPitch:
      'A case investigator working to free people who were wrongly convicted.',
    description:
      'Innocence-network staff investigate post-conviction claims of innocence: locating witnesses, reviewing trial records, requesting DNA testing, working with attorneys, and coordinating media and policy efforts. Roles range from intake paralegal to staff investigator to forensic-science consultant.',
    credentials:
      'A bachelor’s in psychology, criminal justice, journalism, or social work is the common entry; staff attorney roles require a JD; some teams hire forensic scientists and psychologists. Many people start as student volunteers in an Innocence Project clinic.',
    resources: [
      { label: 'Innocence Network', description: 'Umbrella organization for ~70 member projects across the U.S. and abroad.' },
      { label: 'The Innocence Project (NY)', description: 'Flagship organization; hires staff and runs an active intern/clinic program.' },
      { label: 'National Registry of Exonerations', description: 'Searchable database of known U.S. exonerations and their causes.' },
    ],
    weights: {
      T_WRONGFUL_CONVICTION: 4,
      T_LAW_COURTROOM: 1,
      S_INVESTIGATIVE: 3,
      S_CRITICAL_SKEPTIC: 2,
      S_COMMUNICATION: 2,
    },
  },
  {
    id: 'forensic_science_reformer',
    title: 'Forensic Science Reformer / Validation Researcher',
    shortPitch:
      'A scientist working to make sure the techniques used in court are actually grounded in evidence.',
    description:
      'These researchers run validation studies of pattern-matching disciplines (fingerprints, firearms, bite marks, hair, footwear), develop better statistics for forensic comparisons, and serve on standards bodies (OSAC) and reform commissions. Some testify when courts admit weak techniques.',
    credentials:
      'A PhD in forensic science, statistics, cognitive psychology, or a related discipline, often combined with a faculty or government-lab position (NIST, FBI Lab, university). Some enter via a forensic master’s plus deep statistical or cognitive training.',
    resources: [
      { label: 'NIST Organization of Scientific Area Committees (OSAC)', description: 'Standards body where reform actually happens.' },
      { label: 'PCAST 2016 report on forensic feature-comparison methods', description: 'Foundational critique of unvalidated techniques.' },
      { label: 'CSAFE (Center for Statistics and Applications in Forensic Evidence)', description: 'NIST-funded research center; student opportunities.' },
    ],
    weights: {
      T_FORENSIC_SCIENCE: 4,
      T_WRONGFUL_CONVICTION: 2,
      T_RESEARCH: 3,
      S_CRITICAL_SKEPTIC: 4,
      S_ANALYTICAL: 3,
      S_BIOLOGY_SCIENCE: 1,
    },
  },
  {
    id: 'forensic_scientist',
    title: 'Forensic Scientist / Crime Lab Analyst',
    shortPitch:
      'A bench scientist who analyzes physical evidence — DNA, drugs, trace materials — for criminal cases.',
    description:
      'Forensic scientists work in crime labs (state, federal, or private), processing evidence and writing technical reports that may be used at trial. Specializations include serology/DNA, firearms, latent prints, toxicology, and digital forensics. Strict chain-of-custody and quality-assurance requirements shape the work.',
    credentials:
      'A bachelor’s in forensic science, biology, or chemistry is the typical floor; many DNA roles require specific coursework specified by the FBI Quality Assurance Standards. Master’s degrees are increasingly the norm for advancement.',
    resources: [
      { label: 'American Academy of Forensic Sciences (AAFS)', description: 'Largest professional organization across forensic disciplines.' },
      { label: 'FBI Laboratory and DEA Forensic Laboratories', description: 'Major employers; descriptions of training expectations.' },
      { label: 'Forensic Science Foundation Student Resources', description: 'Career and scholarship information for students.' },
    ],
    weights: {
      T_FORENSIC_SCIENCE: 4,
      S_BIOLOGY_SCIENCE: 4,
      S_ANALYTICAL: 3,
      S_INVESTIGATIVE: 2,
      S_LONG_TERM_TRAINING: 1,
    },
  },
  {
    id: 'cj_policy_analyst',
    title: 'Criminal Justice Policy Analyst / Researcher',
    shortPitch:
      'A researcher whose work shapes laws, agency policy, and how the legal system operates at scale.',
    description:
      'Policy analysts work at think tanks (Vera Institute, Urban, RAND), advocacy organizations (ACLU, Sentencing Project), federal agencies (NIJ, BJS), and state policy offices. They synthesize evidence, write reports, brief legislators, and design pilot programs.',
    credentials:
      'A master’s degree (MPP, MSW, criminal justice, public health, psychology) is typical; PhDs lead larger research programs. Quantitative and writing skills are central; policy fellowships and internships are the most common entry point.',
    resources: [
      { label: 'Vera Institute of Justice', description: 'Major non-profit research and policy organization.' },
      { label: 'National Institute of Justice (NIJ)', description: 'Federal research arm of the U.S. DOJ; funding and graduate fellowships.' },
      { label: 'The Sentencing Project / Council on Criminal Justice', description: 'Two more strong policy-research orgs to follow.' },
    ],
    weights: {
      T_POLICY: 4,
      T_RESEARCH: 2,
      S_COMMUNICATION: 3,
      S_ANALYTICAL: 3,
      S_LONG_TERM_TRAINING: 2,
    },
  },
  {
    id: 'behavioral_analyst_profiler',
    title: 'Behavioral Analyst / Investigative Profiler',
    shortPitch:
      'A behavioral specialist who supports criminal investigations by analyzing offender patterns.',
    description:
      'Far less glamorous than TV portrays. Real-world behavioral analysts (FBI BAU, state fusion centers, and a handful of police agencies) work on indirect personality assessment, threat assessment, equivocal-death analysis, and investigative strategy. Most spend significant time on threat cases, not serial-killer hunts.',
    credentials:
      'FBI BAU agents are FBI Special Agents first; behavioral analysts often hold a master’s or doctorate in psychology, criminology, or behavioral science with substantial law-enforcement or analytic experience. Civilian roles also exist at fusion centers and consulting firms.',
    resources: [
      { label: 'International Criminal Investigative Analysis Fellowship (ICIAF)', description: 'Professional credentialing for criminal investigative analysts.' },
      { label: 'FBI Behavioral Analysis Unit publications', description: 'Realistic picture of what BAU work involves.' },
      { label: 'Society for Police and Criminal Psychology (SPCP)', description: 'Crossover community for this kind of work.' },
    ],
    weights: {
      T_LAW_ENFORCEMENT: 3,
      T_THREAT_ASSESSMENT: 2,
      S_INVESTIGATIVE: 4,
      S_ANALYTICAL: 2,
      T_LIE_DETECTION: 1,
      S_LONG_TERM_TRAINING: 2,
    },
  },
];

export const CAREERS_BY_ID: Record<string, Career> = Object.fromEntries(
  CAREERS.map((c) => [c.id, c])
);
