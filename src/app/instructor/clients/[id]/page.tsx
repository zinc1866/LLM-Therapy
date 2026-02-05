'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

interface ClientData {
  name: string;
  presentingConcern: string;
  age: string;
  pronouns: string;
  genderIdentity: string;
  raceEthnicity: string;
  nationality: string;
  sexualOrientation: string;
  disability: string;
  religion: string;
  socioeconomic: string;
  immigrationStatus: string;
  indigenousIdentity: string;
  veteranStatus: string;
  fullBackstory: string;
  personality: string;
  communicationStyle: string;
  resistanceLevel: string;
  therapeuticGoals: string;
}

export default function EditClientPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<ClientData>({
    name: '',
    presentingConcern: '',
    age: '',
    pronouns: '',
    genderIdentity: '',
    raceEthnicity: '',
    nationality: '',
    sexualOrientation: '',
    disability: '',
    religion: '',
    socioeconomic: '',
    immigrationStatus: '',
    indigenousIdentity: '',
    veteranStatus: '',
    fullBackstory: '',
    personality: '',
    communicationStyle: '',
    resistanceLevel: 'medium',
    therapeuticGoals: '',
  });

  useEffect(() => {
    async function loadClient() {
      try {
        const response = await fetch(`/api/clients/${id}`);
        if (!response.ok) throw new Error('Failed to load client');
        const client = await response.json();

        setFormData({
          name: client.name || '',
          presentingConcern: client.presentingConcern || '',
          age: client.age?.toString() || '',
          pronouns: client.pronouns || '',
          genderIdentity: client.genderIdentity || '',
          raceEthnicity: client.raceEthnicity || '',
          nationality: client.nationality || '',
          sexualOrientation: client.sexualOrientation || '',
          disability: client.disability || '',
          religion: client.religion || '',
          socioeconomic: client.socioeconomic || '',
          immigrationStatus: client.immigrationStatus || '',
          indigenousIdentity: client.indigenousIdentity || '',
          veteranStatus: client.veteranStatus || '',
          fullBackstory: client.fullBackstory || '',
          personality: client.personality || '',
          communicationStyle: client.communicationStyle || '',
          resistanceLevel: client.resistanceLevel || 'medium',
          therapeuticGoals: client.therapeuticGoals || '',
        });
      } catch {
        setError('Failed to load client');
      } finally {
        setLoading(false);
      }
    }

    loadClient();
  }, [id]);

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
    setSaving(true);

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? parseInt(formData.age) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update client');
      }

      router.push('/instructor/clients');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you sure you want to delete this client? All associated sessions and transcripts will be permanently deleted.'
      )
    ) {
      return;
    }

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete client');

      router.push('/instructor/clients');
      router.refresh();
    } catch {
      setError('Failed to delete client');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading client...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link
          href="/instructor/clients"
          className="text-primary-600 hover:underline text-sm"
        >
          &larr; Back to Clients
        </Link>
        <h1 className="text-3xl font-bold mt-2">Edit Client</h1>
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
                Presenting Concern *
              </label>
              <textarea
                id="presentingConcern"
                name="presentingConcern"
                value={formData.presentingConcern}
                onChange={handleChange}
                className="input"
                rows={2}
                required
              />
            </div>
          </div>
        </div>

        {/* Demographics */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Demographics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="age" className="label">
                Age
              </label>
              <input
                id="age"
                name="age"
                type="number"
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
              />
            </div>
          </div>
        </div>

        {/* Identity Factors */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Identity Factors</h2>
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
              />
            </div>
          </div>
        </div>

        {/* Clinical Details */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Clinical Details</h2>
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
                  <option value="low">Low - Open and willing</option>
                  <option value="medium">Medium - Some hesitation</option>
                  <option value="high">High - Defensive</option>
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
                />
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={handleDelete}
            className="btn btn-danger"
          >
            Delete Client
          </button>
          <div className="flex gap-4">
            <Link href="/instructor/clients" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
