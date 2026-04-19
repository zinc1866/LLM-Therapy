'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Mode = 'THERAPY' | 'DIAGNOSIS';

interface CriterionRow {
  criterion: string;
  clientStatement: string;
}

const DSM_CATEGORIES: { week: number; label: string }[] = [
  { week: 1, label: 'Depressive Disorders' },
  { week: 1, label: 'Bipolar and Related Disorders' },
  { week: 1, label: 'Schizophrenia Spectrum and Other Psychotic Disorders' },
  { week: 2, label: 'Feeding and Eating Disorders' },
  { week: 2, label: 'Elimination Disorders' },
  { week: 2, label: 'Somatic Symptom and Related Disorders' },
  { week: 3, label: 'Substance-Related and Addictive Disorders' },
  { week: 4, label: 'Anxiety Disorders' },
  { week: 4, label: 'Obsessive-Compulsive and Related Disorders' },
  { week: 4, label: 'Trauma- and Stressor-Related Disorders' },
  { week: 4, label: 'Dissociative Disorders' },
  { week: 4, label: 'Personality Disorders' },
  { week: 5, label: 'Disruptive, Impulse-Control, and Conduct Disorders' },
  { week: 5, label: 'Neurodevelopmental Disorders' },
  { week: 5, label: 'Neurocognitive Disorders' },
];

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [generateFocus, setGenerateFocus] = useState('');

  const [mode, setMode] = useState<Mode>('THERAPY');
  const [criteriaRows, setCriteriaRows] = useState<CriterionRow[]>([
    { criterion: '', clientStatement: '' },
  ]);

  const [formData, setFormData] = useState({
    // Basic Info
    name: '',
    presentingConcern: '',

    // Demographics
    age: '',
    pronouns: '',
    genderIdentity: '',
    raceEthnicity: '',
    nationality: '',

    // Identity Factors
    sexualOrientation: '',
    disability: '',
    religion: '',
    socioeconomic: '',
    immigrationStatus: '',
    indigenousIdentity: '',
    veteranStatus: '',

    // Clinical
    fullBackstory: '',
    personality: '',
    communicationStyle: '',
    resistanceLevel: 'medium',
    therapeuticGoals: '',

    // Diagnosis
    targetDiagnosis: '',
    dsmCategory: '',
    weekNumber: '',
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleGenerate = async () => {
    setError('');
    setGenerating(true);

    try {
      const response = await fetch('/api/clients/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          focus: generateFocus || undefined,
          mode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate client');
      }

      setFormData({
        name: data.name || '',
        presentingConcern: data.presentingConcern || '',
        age: data.age?.toString() || '',
        pronouns: data.pronouns || '',
        genderIdentity: data.genderIdentity || '',
        raceEthnicity: data.raceEthnicity || '',
        nationality: data.nationality || '',
        sexualOrientation: data.sexualOrientation || '',
        disability: data.disability || '',
        religion: data.religion || '',
        socioeconomic: data.socioeconomic || '',
        immigrationStatus: data.immigrationStatus || '',
        indigenousIdentity: data.indigenousIdentity || '',
        veteranStatus: data.veteranStatus || '',
        fullBackstory: data.fullBackstory || '',
        personality: data.personality || '',
        communicationStyle: data.communicationStyle || '',
        resistanceLevel: data.resistanceLevel || 'medium',
        therapeuticGoals: data.therapeuticGoals || '',
        targetDiagnosis: data.targetDiagnosis || '',
        dsmCategory: data.dsmCategory || '',
        weekNumber: data.weekNumber ? String(data.weekNumber) : '',
      });

      if (
        mode === 'DIAGNOSIS' &&
        Array.isArray(data.diagnosticCriteriaMap) &&
        data.diagnosticCriteriaMap.length > 0
      ) {
        setCriteriaRows(
          data.diagnosticCriteriaMap.map(
            (r: { criterion?: string; clientStatement?: string }) => ({
              criterion: r.criterion || '',
              clientStatement: r.clientStatement || '',
            })
          )
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate client');
    } finally {
      setGenerating(false);
    }
  };

  const updateCriterion = (
    index: number,
    field: keyof CriterionRow,
    value: string
  ) => {
    setCriteriaRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  };

  const addCriterionRow = () => {
    setCriteriaRows((prev) => [...prev, { criterion: '', clientStatement: '' }]);
  };

  const removeCriterionRow = (index: number) => {
    setCriteriaRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const cleanedCriteria = criteriaRows.filter(
        (r) => r.criterion.trim() && r.clientStatement.trim()
      );

      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : null,
          mode,
          weekNumber:
            mode === 'DIAGNOSIS' && formData.weekNumber
              ? parseInt(formData.weekNumber)
              : null,
          diagnosticCriteriaMap:
            mode === 'DIAGNOSIS' && cleanedCriteria.length > 0
              ? cleanedCriteria
              : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create client');
      }

      router.push('/instructor/clients');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/instructor/clients"
          className="text-primary-600 hover:underline text-sm"
        >
          &larr; Back to Clients
        </Link>
        <h1 className="text-3xl font-bold mt-2">Create Simulated Client</h1>
        <p className="text-gray-600 mt-2">
          Define a client profile with diverse intersectional identities for
          students to practice with.
        </p>
      </div>

      {/* Generate Client Section */}
      <div className="card bg-gradient-to-r from-primary-50 to-purple-50 border-primary-200 mb-8">
        <h2 className="text-lg font-semibold mb-2">Generate Client with AI</h2>
        <p className="text-sm text-gray-600 mb-4">
          Let AI create a diverse client profile with authentic cultural backgrounds.
          You can edit the generated profile before saving.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={generateFocus}
            onChange={(e) => setGenerateFocus(e.target.value)}
            placeholder="Optional: focus area (e.g., 'immigrant family dynamics', 'LGBTQ+ identity', 'grief')"
            className="input flex-1"
          />
          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="btn btn-primary whitespace-nowrap"
          >
            {generating ? 'Generating...' : 'Generate Client'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Client Mode */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-2">Client Mode</h2>
          <p className="text-sm text-gray-500 mb-4">
            Choose the type of simulation. Therapy clients are for ongoing
            therapy practice. Diagnosis clients are for intake / diagnostic
            interview practice with a hidden target DSM-5-TR diagnosis.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <label
              className={`flex-1 cursor-pointer border rounded-lg p-4 ${
                mode === 'THERAPY'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="mode"
                value="THERAPY"
                checked={mode === 'THERAPY'}
                onChange={() => setMode('THERAPY')}
                className="mr-2"
              />
              <span className="font-semibold">Therapy</span>
              <p className="text-xs text-gray-600 mt-1">
                Ongoing therapy sessions, growth arc across sessions.
              </p>
            </label>
            <label
              className={`flex-1 cursor-pointer border rounded-lg p-4 ${
                mode === 'DIAGNOSIS'
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name="mode"
                value="DIAGNOSIS"
                checked={mode === 'DIAGNOSIS'}
                onChange={() => setMode('DIAGNOSIS')}
                className="mr-2"
              />
              <span className="font-semibold">Diagnosis (Intake)</span>
              <p className="text-xs text-gray-600 mt-1">
                Single intake interview. Client expresses symptoms in lay
                language; 75-word response cap; diagnosis revealed in debrief.
              </p>
            </label>
          </div>
        </div>

        {/* Diagnostic Intake Setup (conditional) */}
        {mode === 'DIAGNOSIS' && (
          <div className="card border-primary-200">
            <h2 className="text-xl font-semibold mb-2">
              Diagnostic Intake Setup
            </h2>
            <p className="text-sm text-gray-500 mb-4">
              Hidden from students. Drives the client&apos;s symptom
              presentation and powers the post-session debrief.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="targetDiagnosis" className="label">
                  Target Diagnosis *
                </label>
                <input
                  id="targetDiagnosis"
                  name="targetDiagnosis"
                  value={formData.targetDiagnosis}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Major Depressive Disorder, Moderate"
                />
              </div>
              <div>
                <label htmlFor="weekNumber" className="label">
                  Week Number
                </label>
                <select
                  id="weekNumber"
                  name="weekNumber"
                  value={formData.weekNumber}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">—</option>
                  <option value="1">Week 1</option>
                  <option value="2">Week 2</option>
                  <option value="3">Week 3</option>
                  <option value="4">Week 4</option>
                  <option value="5">Week 5</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label htmlFor="dsmCategory" className="label">
                  DSM Category
                </label>
                <select
                  id="dsmCategory"
                  name="dsmCategory"
                  value={formData.dsmCategory}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">—</option>
                  {DSM_CATEGORIES.map((c) => (
                    <option key={c.label} value={c.label}>
                      Week {c.week} — {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="label">Diagnostic Criteria Map</label>
              <p className="text-xs text-gray-500 mb-2">
                Optional but recommended. Each row pairs a DSM criterion with
                a lay-language statement the client might make. The AI uses
                these to stay consistent and the debrief uses them to show
                students what to listen for. Do NOT use DSM wording in the
                client statement — write how a real person would say it.
              </p>
              <div className="space-y-2">
                {criteriaRows.map((row, i) => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2">
                    <input
                      value={row.criterion}
                      onChange={(e) =>
                        updateCriterion(i, 'criterion', e.target.value)
                      }
                      placeholder="Criterion (e.g., A1 – Depressed mood)"
                      className="input md:col-span-5"
                    />
                    <input
                      value={row.clientStatement}
                      onChange={(e) =>
                        updateCriterion(i, 'clientStatement', e.target.value)
                      }
                      placeholder="Client statement (lay language)"
                      className="input md:col-span-6"
                    />
                    <button
                      type="button"
                      onClick={() => removeCriterionRow(i)}
                      className="btn btn-secondary md:col-span-1"
                      aria-label="Remove row"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addCriterionRow}
                className="btn btn-secondary mt-2"
              >
                + Add Criterion
              </button>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <p className="text-sm text-gray-500 mb-4">
            This information will be visible to students.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="label">
                Client Name *
              </label>
              <input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="presentingConcern" className="label">
                Presenting Concern (visible to students) *
              </label>
              <textarea
                id="presentingConcern"
                name="presentingConcern"
                value={formData.presentingConcern}
                onChange={handleChange}
                className="input"
                rows={2}
                placeholder="Brief description of why the client is seeking therapy"
                required
              />
            </div>
          </div>
        </div>

        {/* Demographics */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Demographics</h2>
          <p className="text-sm text-gray-500 mb-4">
            These details inform the AI&apos;s portrayal but are not shown to
            students.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="age" className="label">
                Age
              </label>
              <input
                id="age"
                name="age"
                type="number"
                min="0"
                max="120"
                value={formData.age}
                onChange={handleChange}
                className="input"
              />
            </div>
            <div>
              <label htmlFor="pronouns" className="label">
                Pronouns
              </label>
              <input
                id="pronouns"
                name="pronouns"
                value={formData.pronouns}
                onChange={handleChange}
                className="input"
                placeholder="e.g., she/her, he/him, they/them"
              />
            </div>
            <div>
              <label htmlFor="genderIdentity" className="label">
                Gender Identity
              </label>
              <input
                id="genderIdentity"
                name="genderIdentity"
                value={formData.genderIdentity}
                onChange={handleChange}
                className="input"
                placeholder="e.g., woman, man, non-binary"
              />
            </div>
            <div>
              <label htmlFor="raceEthnicity" className="label">
                Race/Ethnicity
              </label>
              <input
                id="raceEthnicity"
                name="raceEthnicity"
                value={formData.raceEthnicity}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Black/African American, Latinx"
              />
            </div>
            <div>
              <label htmlFor="nationality" className="label">
                Nationality/Cultural Background
              </label>
              <input
                id="nationality"
                name="nationality"
                value={formData.nationality}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Korean American, Nigerian"
              />
            </div>
          </div>
        </div>

        {/* Identity Factors */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Identity Factors</h2>
          <p className="text-sm text-gray-500 mb-4">
            Intersectional identities that shape the client&apos;s lived
            experience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="sexualOrientation" className="label">
                Sexual Orientation
              </label>
              <input
                id="sexualOrientation"
                name="sexualOrientation"
                value={formData.sexualOrientation}
                onChange={handleChange}
                className="input"
                placeholder="e.g., gay, bisexual, heterosexual, asexual"
              />
            </div>
            <div>
              <label htmlFor="disability" className="label">
                Disability Status
              </label>
              <input
                id="disability"
                name="disability"
                value={formData.disability}
                onChange={handleChange}
                className="input"
                placeholder="e.g., chronic pain, deaf, wheelchair user"
              />
            </div>
            <div>
              <label htmlFor="religion" className="label">
                Religious/Spiritual Background
              </label>
              <input
                id="religion"
                name="religion"
                value={formData.religion}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Muslim, Jewish, Buddhist, atheist"
              />
            </div>
            <div>
              <label htmlFor="socioeconomic" className="label">
                Socioeconomic Status
              </label>
              <input
                id="socioeconomic"
                name="socioeconomic"
                value={formData.socioeconomic}
                onChange={handleChange}
                className="input"
                placeholder="e.g., working class, professional, unemployed"
              />
            </div>
            <div>
              <label htmlFor="immigrationStatus" className="label">
                Immigration Status
              </label>
              <input
                id="immigrationStatus"
                name="immigrationStatus"
                value={formData.immigrationStatus}
                onChange={handleChange}
                className="input"
                placeholder="e.g., first-generation immigrant, refugee"
              />
            </div>
            <div>
              <label htmlFor="indigenousIdentity" className="label">
                Indigenous Identity
              </label>
              <input
                id="indigenousIdentity"
                name="indigenousIdentity"
                value={formData.indigenousIdentity}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Navajo Nation, First Nations"
              />
            </div>
            <div>
              <label htmlFor="veteranStatus" className="label">
                Veteran Status
              </label>
              <input
                id="veteranStatus"
                name="veteranStatus"
                value={formData.veteranStatus}
                onChange={handleChange}
                className="input"
                placeholder="e.g., Army veteran, active duty spouse"
              />
            </div>
          </div>
        </div>

        {/* Clinical Details */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Clinical Details</h2>
          <p className="text-sm text-gray-500 mb-4">
            Detailed information for the AI to authentically portray this
            client.
          </p>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullBackstory" className="label">
                Full Backstory *
              </label>
              <textarea
                id="fullBackstory"
                name="fullBackstory"
                value={formData.fullBackstory}
                onChange={handleChange}
                className="input"
                rows={6}
                placeholder="Detailed background including family history, significant life events, current living situation, relationships, work/education, and how their identities have shaped their experiences..."
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="personality" className="label">
                  Personality Traits
                </label>
                <textarea
                  id="personality"
                  name="personality"
                  value={formData.personality}
                  onChange={handleChange}
                  className="input"
                  rows={3}
                  placeholder="e.g., introverted, anxious, warm but guarded, uses humor as defense"
                />
              </div>
              <div>
                <label htmlFor="communicationStyle" className="label">
                  Communication Style
                </label>
                <textarea
                  id="communicationStyle"
                  name="communicationStyle"
                  value={formData.communicationStyle}
                  onChange={handleChange}
                  className="input"
                  rows={3}
                  placeholder="e.g., tends to intellectualize, avoids eye contact, speaks softly"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="resistanceLevel" className="label">
                  Resistance Level
                </label>
                <select
                  id="resistanceLevel"
                  name="resistanceLevel"
                  value={formData.resistanceLevel}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="low">
                    Low - Open and willing to engage
                  </option>
                  <option value="medium">
                    Medium - Some hesitation, needs rapport
                  </option>
                  <option value="high">
                    High - Defensive, slow to open up
                  </option>
                </select>
              </div>
              <div>
                <label htmlFor="therapeuticGoals" className="label">
                  Therapeutic Goals
                </label>
                <input
                  id="therapeuticGoals"
                  name="therapeuticGoals"
                  value={formData.therapeuticGoals}
                  onChange={handleChange}
                  className="input"
                  placeholder="What the client hopes to achieve in therapy"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Creating...' : 'Create Client'}
          </button>
          <Link href="/instructor/clients" className="btn btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
