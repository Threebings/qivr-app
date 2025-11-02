import { useState, useEffect } from 'react';
import { Search, Phone, Mail, MapPin, Globe, Filter, X, Check, Calendar, ChevronRight, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Provider {
  id: string;
  provider_name: string;
  specialty: string;
  practice_name: string;
  phone_number: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  website_url: string;
  accepts_new_patients: boolean;
  insurance_accepted: string[];
  languages_spoken: string[];
  subspecialty: string;
  notes: string;
}

interface Referral {
  id: string;
  provider_id: string;
  referral_date: string;
  referral_reason: string;
  status: string;
  appointment_date: string | null;
  notes: string;
  provider?: Provider;
}

export function Providers() {
  const { user } = useAuth();
  const [providers, setProviders] = useState<Provider[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [filteredProviders, setFilteredProviders] = useState<Provider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showReferralModal, setShowReferralModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'browse' | 'my-referrals'>('browse');

  useEffect(() => {
    loadData();
  }, [user]);

  useEffect(() => {
    filterProviders();
  }, [providers, searchQuery, selectedSpecialty]);

  const loadData = async () => {
    await Promise.all([loadProviders(), loadReferrals()]);
  };

  const loadProviders = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('healthcare_providers')
        .select('*')
        .order('provider_name', { ascending: true });

      if (error) throw error;
      if (data) setProviders(data);
    } catch (error) {
      console.error('Error loading providers:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReferrals = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('patient_referrals')
        .select(`
          *,
          provider:healthcare_providers(*)
        `)
        .eq('patient_id', user.id)
        .order('referral_date', { ascending: false });

      if (error) throw error;
      if (data) setReferrals(data);
    } catch (error) {
      console.error('Error loading referrals:', error);
    }
  };

  const filterProviders = () => {
    let filtered = [...providers];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        p =>
          p.provider_name.toLowerCase().includes(query) ||
          p.practice_name.toLowerCase().includes(query) ||
          p.city.toLowerCase().includes(query) ||
          p.subspecialty?.toLowerCase().includes(query)
      );
    }

    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(p => p.specialty === selectedSpecialty);
    }

    setFilteredProviders(filtered);
  };

  const specialties = [
    { value: 'all', label: 'All Specialties' },
    { value: 'orthopedic_surgeon', label: 'Orthopedic Surgeon' },
    { value: 'physical_therapist', label: 'Physical Therapist' },
    { value: 'pain_specialist', label: 'Pain Specialist' },
    { value: 'neurosurgeon', label: 'Neurosurgeon' },
    { value: 'sports_medicine', label: 'Sports Medicine' },
    { value: 'chiropractor', label: 'Chiropractor' },
    { value: 'imaging_radiology', label: 'Imaging & Radiology' },
  ];

  const getSpecialtyLabel = (specialty: string) => {
    const found = specialties.find(s => s.value === specialty);
    return found?.label || specialty.replace('_', ' ');
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      scheduled: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center pb-24">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-qivr-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading providers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-24">
      <div className="bg-white px-6 py-4 border-b border-gray-200 sticky top-0 z-10">
        <h1 className="text-xl font-semibold text-[#1F2937]">Healthcare Providers</h1>
        <p className="text-sm text-gray-600 mt-1">Find specialists for your care needs</p>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'browse'
                ? 'bg-qivr-blue text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            Browse Providers
          </button>
          <button
            onClick={() => setActiveTab('my-referrals')}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
              activeTab === 'my-referrals'
                ? 'bg-qivr-blue text-white'
                : 'bg-white text-gray-700 border border-gray-300'
            }`}
          >
            My Referrals ({referrals.length})
          </button>
        </div>

        {activeTab === 'browse' ? (
          <>
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, practice, or location..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qivr-blue focus:border-transparent"
                />
              </div>

              <div className="flex space-x-2 overflow-x-auto pb-2">
                {specialties.map(specialty => (
                  <button
                    key={specialty.value}
                    onClick={() => setSelectedSpecialty(specialty.value)}
                    className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      selectedSpecialty === specialty.value
                        ? 'bg-qivr-blue text-white'
                        : 'bg-white text-gray-700 border border-gray-300'
                    }`}
                  >
                    {specialty.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-sm text-gray-600">
              {filteredProviders.length} provider{filteredProviders.length !== 1 ? 's' : ''} found
            </div>

            <div className="space-y-3">
              {filteredProviders.map(provider => (
                <div
                  key={provider.id}
                  className="bg-white rounded-2xl p-5 border border-gray-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#1F2937]">{provider.provider_name}</h3>
                      <p className="text-sm text-gray-600">{provider.practice_name}</p>
                    </div>
                    {provider.accepts_new_patients && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Accepting Patients
                      </span>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-700">
                      <span className="px-2 py-1 bg-qivr-blue/10 text-qivr-blue rounded font-medium">
                        {getSpecialtyLabel(provider.specialty)}
                      </span>
                      {provider.subspecialty && (
                        <span className="ml-2 text-gray-600">
                          • {provider.subspecialty.replace('_', ' ')}
                        </span>
                      )}
                    </div>

                    <div className="flex items-start space-x-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{provider.address}, {provider.city}, {provider.state} {provider.zip_code}</span>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 flex-shrink-0" />
                      <a href={`tel:${provider.phone_number}`} className="hover:text-qivr-blue">
                        {provider.phone_number}
                      </a>
                    </div>

                    {provider.email && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 flex-shrink-0" />
                        <a href={`mailto:${provider.email}`} className="hover:text-qivr-blue">
                          {provider.email}
                        </a>
                      </div>
                    )}

                    {provider.website_url && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Globe className="w-4 h-4 flex-shrink-0" />
                        <a
                          href={provider.website_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-qivr-blue"
                        >
                          Visit Website
                        </a>
                      </div>
                    )}
                  </div>

                  {provider.insurance_accepted.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 mb-1">Insurance Accepted:</p>
                      <div className="flex flex-wrap gap-1">
                        {provider.insurance_accepted.slice(0, 3).map((insurance, idx) => (
                          <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {insurance}
                          </span>
                        ))}
                        {provider.insurance_accepted.length > 3 && (
                          <span className="text-xs text-gray-600">
                            +{provider.insurance_accepted.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setSelectedProvider(provider);
                        setShowReferralModal(true);
                      }}
                      className="bg-qivr-blue text-white py-2.5 px-4 rounded-lg font-medium hover:bg-qivr-blue-dark transition-colors flex items-center justify-center space-x-2"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book Appointment</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProvider(provider);
                        setShowReferralModal(true);
                      }}
                      className="bg-white text-qivr-blue border-2 border-qivr-blue py-2.5 px-4 rounded-lg font-medium hover:bg-qivr-blue hover:text-white transition-colors flex items-center justify-center space-x-2"
                      aria-label="Request a referral to this provider"
                    >
                      <FileText className="w-4 h-4" />
                      <span>Request Referral</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="space-y-3">
            {referrals.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Referrals Yet</h3>
                <p className="text-gray-500 mb-6">Browse providers to request your first referral</p>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="bg-qivr-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-qivr-blue-dark transition-colors"
                >
                  Browse Providers
                </button>
              </div>
            ) : (
              referrals.map(referral => (
                <div
                  key={referral.id}
                  className="bg-white rounded-2xl p-5 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-[#1F2937]">
                        {referral.provider?.provider_name}
                      </h3>
                      <p className="text-sm text-gray-600">{referral.provider?.practice_name}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(referral.status)}`}>
                      {referral.status.charAt(0).toUpperCase() + referral.status.slice(1)}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3">
                    <div className="text-sm">
                      <span className="text-gray-600">Referral Date:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {new Date(referral.referral_date).toLocaleDateString()}
                      </span>
                    </div>

                    {referral.appointment_date && (
                      <div className="text-sm">
                        <span className="text-gray-600">Appointment:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {new Date(referral.appointment_date).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="text-sm">
                      <span className="text-gray-600">Reason:</span>
                      <p className="text-gray-900 mt-1">{referral.referral_reason}</p>
                    </div>

                    {referral.notes && (
                      <div className="text-sm">
                        <span className="text-gray-600">Notes:</span>
                        <p className="text-gray-900 mt-1">{referral.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <a
                      href={`tel:${referral.provider?.phone_number}`}
                      className="hover:text-qivr-blue"
                    >
                      {referral.provider?.phone_number}
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {showReferralModal && selectedProvider && (
        <ReferralModal
          provider={selectedProvider}
          onClose={() => {
            setShowReferralModal(false);
            setSelectedProvider(null);
          }}
          onSuccess={() => {
            setShowReferralModal(false);
            setSelectedProvider(null);
            loadReferrals();
            setActiveTab('my-referrals');
          }}
        />
      )}
    </div>
  );
}

function ReferralModal({
  provider,
  onClose,
  onSuccess,
}: {
  provider: Provider;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    referral_reason: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      const { error } = await supabase.from('patient_referrals').insert({
        patient_id: user.id,
        provider_id: provider.id,
        referral_reason: formData.referral_reason,
        notes: formData.notes,
        status: 'pending',
      });

      if (error) throw error;
      onSuccess();
    } catch (error) {
      console.error('Error creating referral:', error);
      alert('Failed to create referral');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#1F2937]">Book Appointment</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-1">{provider.provider_name}</h3>
            <p className="text-sm text-gray-600">{provider.practice_name}</p>
            <p className="text-sm text-gray-600 mt-2">
              {getSpecialtyLabel(provider.specialty)}
              {provider.subspecialty && ` - ${provider.subspecialty.replace('_', ' ')}`}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Appointment
              </label>
              <textarea
                required
                value={formData.referral_reason}
                onChange={(e) => setFormData({ ...formData, referral_reason: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qivr-blue focus:border-transparent resize-none"
                placeholder="e.g., Persistent lower back pain requiring surgical evaluation"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qivr-blue focus:border-transparent resize-none"
                placeholder="Any additional information..."
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                This appointment request will be saved to your records. The provider's office will contact you to confirm your appointment date and time.
              </p>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 bg-qivr-blue text-white py-3 px-6 rounded-lg font-semibold hover:bg-qivr-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Booking...' : 'Book Appointment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  function getSpecialtyLabel(specialty: string) {
    const specialties: Record<string, string> = {
      orthopedic_surgeon: 'Orthopedic Surgeon',
      physical_therapist: 'Physical Therapist',
      pain_specialist: 'Pain Specialist',
      neurosurgeon: 'Neurosurgeon',
      sports_medicine: 'Sports Medicine',
      chiropractor: 'Chiropractor',
      imaging_radiology: 'Imaging & Radiology',
    };
    return specialties[specialty] || specialty.replace('_', ' ');
  }
}
