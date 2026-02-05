'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewClientPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : null,
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

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
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
