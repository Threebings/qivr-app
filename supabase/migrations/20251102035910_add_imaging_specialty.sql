/*
  # Add Imaging & Radiology Specialty

  1. Changes
    - Update healthcare_providers specialty constraint to include 'imaging_radiology'
    - This allows imaging centers, radiology clinics, and diagnostic imaging providers
  
  2. Sample Data
    - Add 4 imaging/radiology providers with various subspecialties
    - MRI centers, CT scan facilities, X-ray clinics, and full-service diagnostic imaging
*/

-- Drop existing constraint and add new one with imaging_radiology
ALTER TABLE healthcare_providers 
DROP CONSTRAINT IF EXISTS healthcare_providers_specialty_check;

ALTER TABLE healthcare_providers
ADD CONSTRAINT healthcare_providers_specialty_check 
CHECK (specialty IN (
  'orthopedic_surgeon',
  'physical_therapist',
  'pain_specialist',
  'sports_medicine',
  'neurosurgeon',
  'rheumatologist',
  'chiropractor',
  'acupuncturist',
  'massage_therapist',
  'occupational_therapist',
  'imaging_radiology'
));

-- Insert sample imaging providers
INSERT INTO healthcare_providers (
  provider_name,
  specialty,
  subspecialty,
  practice_name,
  phone_number,
  email,
  address,
  city,
  state,
  zip_code,
  website_url,
  accepts_new_patients,
  insurance_accepted,
  languages_spoken,
  notes
) VALUES
(
  'Advanced Imaging Center',
  'imaging_radiology',
  'MRI and CT Scans',
  'Advanced Imaging Center',
  '(555) 123-4567',
  'info@advancedimaging.com',
  '123 Medical Plaza',
  'Boston',
  'MA',
  '02101',
  'https://advancedimaging.com',
  true,
  ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Medicare', 'Cigna'],
  ARRAY['English', 'Spanish'],
  'State-of-the-art MRI and CT imaging services. Same-day appointments available.'
),
(
  'Spine & Joint Imaging',
  'imaging_radiology',
  'Orthopedic Imaging',
  'Spine & Joint Imaging Specialists',
  '(555) 234-5678',
  'appointments@spinejointimaging.com',
  '456 Healthcare Way',
  'Cambridge',
  'MA',
  '02139',
  'https://spinejointimaging.com',
  true,
  ARRAY['Blue Cross Blue Shield', 'Harvard Pilgrim', 'Tufts Health Plan', 'Medicare'],
  ARRAY['English'],
  'Specialized in spine and musculoskeletal imaging. Digital X-ray, MRI, and ultrasound.'
),
(
  'Open MRI Center of New England',
  'imaging_radiology',
  'Open MRI',
  'Open MRI Center',
  '(555) 345-6789',
  'schedule@openmri-ne.com',
  '789 Comfort Lane',
  'Brookline',
  'MA',
  '02445',
  'https://openmri-ne.com',
  true,
  ARRAY['Blue Cross Blue Shield', 'Aetna', 'UnitedHealthcare', 'Humana'],
  ARRAY['English', 'Portuguese'],
  'Open MRI machines for patients with claustrophobia. Weight limit 550 lbs.'
),
(
  'Metro Diagnostic Imaging',
  'imaging_radiology',
  'Full Service Radiology',
  'Metro Diagnostic Imaging',
  '(555) 456-7890',
  'info@metrodiagnostic.com',
  '321 Radiology Blvd',
  'Somerville',
  'MA',
  '02143',
  'https://metrodiagnostic.com',
  true,
  ARRAY['Blue Cross Blue Shield', 'Aetna', 'Cigna', 'Medicare', 'Medicaid'],
  ARRAY['English', 'Spanish', 'Chinese'],
  'Complete diagnostic imaging services including X-ray, MRI, CT, ultrasound, and bone density.'
)
ON CONFLICT DO NOTHING;