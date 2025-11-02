import { useState, useEffect } from 'react';
import { ArrowLeft, Upload, FileText, Download, Trash2, Eye, Plus, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface MedicalRecord {
  id: string;
  document_name: string;
  document_type: string;
  document_url: string;
  file_size: number;
  mime_type: string;
  uploaded_date: string;
  notes: string;
}

interface MedicalRecordsProps {
  onBack: () => void;
}

export function MedicalRecords({ onBack }: MedicalRecordsProps) {
  const { user } = useAuth();
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);

  useEffect(() => {
    loadRecords();
  }, [user]);

  const loadRecords = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('medical_records')
        .select('*')
        .eq('patient_id', user.id)
        .order('uploaded_date', { ascending: false });

      if (error) throw error;
      if (data) setRecords(data);
    } catch (error) {
      console.error('Error loading medical records:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteRecord = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setRecords(records.filter(r => r.id !== id));
    } catch (error) {
      console.error('Error deleting record:', error);
    }
  };

  const getDocumentTypeIcon = (type: string) => {
    return <FileText className="w-5 h-5" />;
  };

  const getDocumentTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      lab_result: 'Lab Result',
      imaging: 'Imaging',
      prescription: 'Prescription',
      report: 'Medical Report',
      discharge_summary: 'Discharge Summary',
      other: 'Other',
    };
    return labels[type] || type;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const groupedRecords = records.reduce((acc, record) => {
    const type = record.document_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(record);
    return acc;
  }, {} as Record<string, MedicalRecord[]>);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFB] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-qivr-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading medical records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFB] pb-24">
      <div className="bg-white px-6 py-4 border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center text-qivr-blue hover:text-qivr-blue-light transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          <h1 className="text-xl font-semibold text-[#1F2937]">Medical Records</h1>
          <button
            onClick={() => setShowUploadModal(true)}
            className="text-qivr-blue hover:text-qivr-blue-light"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {records.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No Medical Records</h3>
            <p className="text-gray-500 mb-6">Upload your medical documents to keep them organized and accessible</p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-qivr-blue text-white px-6 py-3 rounded-lg font-semibold hover:bg-qivr-blue-dark transition-colors inline-flex items-center space-x-2"
            >
              <Upload className="w-5 h-5" />
              <span>Upload Document</span>
            </button>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-qivr-blue to-qivr-blue-light rounded-2xl p-6 text-white">
              <h2 className="text-lg font-semibold mb-2">Your Medical Records</h2>
              <p className="text-sm opacity-90 mb-4">
                Keep all your important medical documents in one secure place
              </p>
              <div className="flex items-center space-x-6 text-sm">
                <div>
                  <div className="text-2xl font-bold">{records.length}</div>
                  <div className="opacity-90">Total Documents</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{Object.keys(groupedRecords).length}</div>
                  <div className="opacity-90">Categories</div>
                </div>
              </div>
            </div>

            {Object.entries(groupedRecords).map(([type, typeRecords]) => (
              <div key={type} className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center space-x-2">
                    {getDocumentTypeIcon(type)}
                    <h3 className="font-semibold text-[#1F2937]">
                      {getDocumentTypeLabel(type)} ({typeRecords.length})
                    </h3>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {typeRecords.map((record) => (
                    <div key={record.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 mb-1">{record.document_name}</h4>
                          <div className="flex items-center space-x-3 text-sm text-gray-600">
                            <span>{formatDate(record.uploaded_date)}</span>
                            <span>•</span>
                            <span>{formatFileSize(record.file_size)}</span>
                          </div>
                          {record.notes && (
                            <p className="text-sm text-gray-600 mt-2">{record.notes}</p>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => setSelectedRecord(record)}
                            className="p-2 text-gray-500 hover:text-qivr-blue hover:bg-qivr-blue/10 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => window.open(record.document_url, '_blank')}
                            className="p-2 text-gray-500 hover:text-qivr-blue hover:bg-qivr-blue/10 rounded-lg transition-colors"
                            title="Download"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteRecord(record.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              onClick={() => setShowUploadModal(true)}
              className="w-full bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-qivr-blue hover:bg-[#F8FAFB] transition-colors flex items-center justify-center space-x-2 text-gray-600 hover:text-qivr-blue"
            >
              <Plus className="w-5 h-5" />
              <span className="font-medium">Upload New Document</span>
            </button>
          </>
        )}
      </div>

      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUploadComplete={() => {
            setShowUploadModal(false);
            loadRecords();
          }}
        />
      )}

      {selectedRecord && (
        <RecordDetailsModal
          record={selectedRecord}
          onClose={() => setSelectedRecord(null)}
        />
      )}
    </div>
  );
}

function UploadModal({ onClose, onUploadComplete }: { onClose: () => void; onUploadComplete: () => void }) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    document_name: '',
    document_type: 'other',
    notes: '',
  });

  const documentTypes = [
    { value: 'lab_result', label: 'Lab Result' },
    { value: 'imaging', label: 'Imaging (X-ray, MRI, CT)' },
    { value: 'prescription', label: 'Prescription' },
    { value: 'report', label: 'Medical Report' },
    { value: 'discharge_summary', label: 'Discharge Summary' },
    { value: 'other', label: 'Other' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.document_name) return;

    try {
      setUploading(true);

      const { error } = await supabase
        .from('medical_records')
        .insert({
          patient_id: user.id,
          document_name: formData.document_name,
          document_type: formData.document_type,
          document_url: `https://example.com/records/${Date.now()}`,
          file_size: 0,
          mime_type: 'application/pdf',
          notes: formData.notes,
        });

      if (error) throw error;
      onUploadComplete();
    } catch (error) {
      console.error('Error uploading record:', error);
      alert('Failed to upload record');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#1F2937]">Upload Document</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Name
            </label>
            <input
              type="text"
              required
              value={formData.document_name}
              onChange={(e) => setFormData({ ...formData, document_name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qivr-blue focus:border-transparent"
              placeholder="e.g., X-ray Results - Left Knee"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Document Type
            </label>
            <select
              value={formData.document_type}
              onChange={(e) => setFormData({ ...formData, document_type: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qivr-blue focus:border-transparent"
            >
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-qivr-blue focus:border-transparent resize-none"
              placeholder="Add any relevant notes about this document..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-qivr-blue text-white py-3 px-6 rounded-lg font-semibold hover:bg-qivr-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function RecordDetailsModal({ record, onClose }: { record: MedicalRecord; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-[#1F2937]">Document Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="text-sm text-gray-600">Document Name</label>
            <p className="font-medium text-gray-900">{record.document_name}</p>
          </div>

          <div>
            <label className="text-sm text-gray-600">Type</label>
            <p className="font-medium text-gray-900">{record.document_type.replace('_', ' ')}</p>
          </div>

          <div>
            <label className="text-sm text-gray-600">Uploaded</label>
            <p className="font-medium text-gray-900">
              {new Date(record.uploaded_date).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>

          {record.notes && (
            <div>
              <label className="text-sm text-gray-600">Notes</label>
              <p className="font-medium text-gray-900">{record.notes}</p>
            </div>
          )}

          <button
            onClick={() => window.open(record.document_url, '_blank')}
            className="w-full bg-qivr-blue text-white py-3 px-6 rounded-lg font-semibold hover:bg-qivr-blue-dark transition-colors flex items-center justify-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Download Document</span>
          </button>
        </div>
      </div>
    </div>
  );
}
