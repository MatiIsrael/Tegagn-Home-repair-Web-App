import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  Trash2, 
  CheckCircle, 
  AlertCircle 
} from 'lucide-react';
import { PLACEHOLDER_WORKERS } from '../data/mockData';
import { FormInput, FormTextarea } from '../components/common/FormInput';
import { Select } from '../components/common/Select';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const WorkerProfileEdit: React.FC = () => {
  const navigate = useNavigate();
  const worker = PLACEHOLDER_WORKERS[0]; // Abebe Tadesse

  const [formData, setFormData] = useState({
    tradeTitle: worker.tradeTitle,
    hourlyRate: worker.hourlyRate.toString(),
    experienceYears: worker.experienceYears.toString(),
    bio: worker.bio,
    city: worker.city,
    serviceAreas: worker.serviceAreas.join(', '),
    trade: worker.trade,
  });

  const [skills, setSkills] = useState<string[]>(worker.skills);
  const [newSkill, setNewSkill] = useState('');
  const [certifications, setCertifications] = useState<string[]>(worker.certifications);
  const [newCert, setNewCert] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.tradeTitle.trim() || formData.tradeTitle.trim().length < 4) {
      errs.tradeTitle = 'Headline must be at least 4 characters.';
    }
    const rate = parseFloat(formData.hourlyRate);
    if (isNaN(rate) || rate < 10 || rate > 300) {
      errs.hourlyRate = 'Rate must be between $10 and $300/hr.';
    }
    const exp = parseInt(formData.experienceYears, 10);
    if (isNaN(exp) || exp < 1 || exp > 60) {
      errs.experienceYears = 'Experience must be between 1 and 60 years.';
    }
    if (!formData.bio.trim() || formData.bio.trim().length < 20) {
      errs.bio = 'Bio must be at least 20 characters describing your skills.';
    }
    if (!formData.city.trim()) {
      errs.city = 'Primary city or region is required.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleAddCert = () => {
    if (newCert.trim() && !certifications.includes(newCert.trim())) {
      setCertifications([...certifications, newCert.trim()]);
      setNewCert('');
    }
  };

  const handleRemoveCert = (certToRemove: string) => {
    setCertifications(certifications.filter(c => c !== certToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Simulated client-side update (In production: PATCH /api/v1/workers/me/)
    setIsSaved(true);
    setTimeout(() => {
      navigate('/worker/dashboard');
    }, 1200);
  };

  const tradeOptions = [
    { value: 'plumber', label: 'Plumbing' },
    { value: 'electrician', label: 'Electrical' },
    { value: 'carpenter', label: 'Carpentry' },
    { value: 'painter', label: 'Painting' },
    { value: 'builder', label: 'Masonry & Building' },
    { value: 'hvac', label: 'HVAC & AC Service' },
    { value: 'locksmith', label: 'Locksmith' },
    { value: 'roofer', label: 'Roofing Repairs' },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-6 border-b border-slate-200">
        <div>
          <Link
            to="/worker/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Worker Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Edit Trade Profile
          </h1>
          <p className="text-sm text-slate-500">
            Keep your hourly pricing, skills, and service coverage updated to attract ideal clients.
          </p>
        </div>

        {isSaved && (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg text-xs font-bold animate-pulse">
            <CheckCircle className="w-4 h-4" />
            <span>Profile Updated!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Core Trade & Pricing */}
        <Card className="p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Trade Classification & Rates</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Select
              label="Primary Trade Craft"
              options={tradeOptions}
              value={formData.trade}
              onChange={(e) => setFormData({ ...formData, trade: e.target.value as any })}
            />

            <FormInput
              label="Professional Headline / Title"
              type="text"
              required
              value={formData.tradeTitle}
              error={errors.tradeTitle}
              onChange={(e) => {
                setFormData({ ...formData, tradeTitle: e.target.value });
                if (errors.tradeTitle) setErrors({ ...errors, tradeTitle: '' });
              }}
              helperText="E.g. Master Plumber & Concealed Pipe Specialist"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormInput
              label="Hourly Rate ($ USD / hr)"
              type="number"
              min="10"
              max="300"
              required
              value={formData.hourlyRate}
              error={errors.hourlyRate}
              onChange={(e) => {
                setFormData({ ...formData, hourlyRate: e.target.value });
                if (errors.hourlyRate) setErrors({ ...errors, hourlyRate: '' });
              }}
            />

            <FormInput
              label="Years of Trade Experience"
              type="number"
              min="1"
              max="60"
              required
              value={formData.experienceYears}
              error={errors.experienceYears}
              onChange={(e) => {
                setFormData({ ...formData, experienceYears: e.target.value });
                if (errors.experienceYears) setErrors({ ...errors, experienceYears: '' });
              }}
            />
          </div>
        </Card>

        {/* Bio & Location */}
        <Card className="p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900">About & Service Region</h2>

          <FormTextarea
            label="Professional Bio"
            rows={4}
            required
            value={formData.bio}
            error={errors.bio}
            onChange={(e) => {
              setFormData({ ...formData, bio: e.target.value });
              if (errors.bio) setErrors({ ...errors, bio: '' });
            }}
            helperText="Highlight your key trade specialties, customer satisfaction approach, and equipment."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormInput
              label="City & District"
              type="text"
              required
              value={formData.city}
              error={errors.city}
              onChange={(e) => {
                setFormData({ ...formData, city: e.target.value });
                if (errors.city) setErrors({ ...errors, city: '' });
              }}
            />

            <FormInput
              label="Service Neighborhoods (comma-separated)"
              type="text"
              value={formData.serviceAreas}
              onChange={(e) => setFormData({ ...formData, serviceAreas: e.target.value })}
              helperText="E.g. Bole, Kazanchis, Sarbet, CMC"
            />
          </div>
        </Card>

        {/* Skills Tag Manager */}
        <Card className="p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Skills & Specializations</h2>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add skill (e.g. Copper Piping, Pressure Valves)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-1 text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Button
              type="button"
              variant="outline"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleAddSkill}
            >
              Add Skill
            </Button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand-50 text-brand-800 text-xs font-semibold border border-brand-200"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-brand-400 hover:text-brand-700 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </Card>

        {/* Certifications Manager */}
        <Card className="p-6 sm:p-8 space-y-6">
          <h2 className="text-lg font-bold text-slate-900">Trade Certifications & Licenses</h2>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add license / qualification title..."
              value={newCert}
              onChange={(e) => setNewCert(e.target.value)}
              className="flex-1 text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
            <Button
              type="button"
              variant="outline"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleAddCert}
            >
              Add Cert
            </Button>
          </div>

          <ul className="space-y-2 pt-2">
            {certifications.map((cert) => (
              <li
                key={cert}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800"
              >
                <span>✓ {cert}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCert(cert)}
                  className="text-slate-400 hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <Link to="/worker/dashboard">
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="primary" icon={<Save className="w-4 h-4" />}>
            Save Profile Changes
          </Button>
        </div>

        {/* Django architecture hint */}
        <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-500 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-slate-400" />
          <span>Profile changes update the Django <code>WorkerProfile</code> model via <code>PATCH /api/v1/workers/me/</code>.</span>
        </div>

      </form>
    </div>
  );
};
