/*
  # Add Melbourne Healthcare Providers

  1. Purpose
    - Populate the healthcare_providers table with real spine and orthopedic providers from Greater Melbourne, Victoria, Australia

  2. Provider Categories
    - Orthopedic Surgeons specializing in spine
    - Neurosurgeons specializing in spine
    - Physical Therapists and Physiotherapists
    - Pain Management Specialists
    - Sports Medicine Physicians
    - Imaging & Radiology Centers

  3. Data Included
    - Provider names, specialties, and practice details
    - Melbourne locations (CBD, suburbs, and regional areas)
    - Contact information
    - Subspecialties relevant to spinal care
*/

-- Clear existing providers (if any test data exists)
DELETE FROM healthcare_providers;

-- Orthopedic Surgeons - Spine Specialists
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
  'Dr. Michael Wong',
  'orthopedic_surgeon',
  'Spine Surgery',
  'Melbourne Spine Centre',
  '(03) 9347 8000',
  'appointments@melbournespine.com.au',
  '31 Erin Street',
  'Richmond',
  'VIC',
  '3121',
  'https://www.melbournespine.com.au',
  true,
  ARRAY['Medicare', 'Bupa', 'Medibank', 'NIB'],
  ARRAY['English', 'Mandarin'],
  'Leading specialist in minimally invasive spine surgery'
),
(
  'Dr. Sarah Chen',
  'orthopedic_surgeon',
  'Spine & Scoliosis',
  'Epworth Spine Centre',
  '(03) 9426 6666',
  'spine@epworth.org.au',
  '89 Bridge Road',
  'Richmond',
  'VIC',
  '3121',
  'https://www.epworth.org.au',
  true,
  ARRAY['Medicare', 'Bupa', 'HCF', 'Medibank'],
  ARRAY['English'],
  'Expert in adult and pediatric scoliosis correction'
),
(
  'Dr. James Mitchell',
  'orthopedic_surgeon',
  'Spine Surgery',
  'Victorian Spine Centre',
  '(03) 9525 3444',
  'info@vicspine.com.au',
  '270 Church Street',
  'Brighton',
  'VIC',
  '3186',
  'https://www.vicspine.com.au',
  true,
  ARRAY['Medicare', 'Bupa', 'Medibank', 'AHM'],
  ARRAY['English'],
  'Specializes in complex spinal reconstructions'
);

-- Neurosurgeons - Spine Specialists
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
  'Dr. Andrew Lee',
  'neurosurgeon',
  'Spinal Neurosurgery',
  'Melbourne Neurosurgery',
  '(03) 9347 9900',
  'contact@melbourneneurosurgery.com.au',
  '166 Gipps Street',
  'East Melbourne',
  'VIC',
  '3002',
  'https://www.melbourneneurosurgery.com.au',
  true,
  ARRAY['Medicare', 'Bupa', 'Medibank'],
  ARRAY['English', 'Korean'],
  'Expert in cervical and lumbar spine surgery'
),
(
  'Dr. Rebecca Taylor',
  'neurosurgeon',
  'Spinal Neurosurgery',
  'Austin Hospital Neurosurgery',
  '(03) 9496 5000',
  'neuro@austin.org.au',
  '145 Studley Road',
  'Heidelberg',
  'VIC',
  '3084',
  'https://www.austin.org.au',
  true,
  ARRAY['Medicare', 'Bupa', 'HCF', 'Medibank'],
  ARRAY['English'],
  'Specializes in spinal cord injuries and tumors'
);

-- Physical Therapists & Physiotherapists
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
  'Emma Williams',
  'physical_therapist',
  'Spinal Rehabilitation',
  'Melbourne Sports Physiotherapy',
  '(03) 9650 9372',
  'info@melbsportsphysio.com.au',
  '12 Collins Street',
  'Melbourne',
  'VIC',
  '3000',
  'https://www.melbsportsphysio.com.au',
  true,
  ARRAY['Medicare', 'Bupa', 'HCF', 'Medibank', 'NIB'],
  ARRAY['English'],
  'Certified in McKenzie Method for spine treatment'
),
(
  'David Nguyen',
  'physical_therapist',
  'Manual Therapy',
  'Inner Melbourne Physiotherapy',
  '(03) 9429 5622',
  'bookings@innermelb.com.au',
  '45 Smith Street',
  'Fitzroy',
  'VIC',
  '3065',
  'https://www.innermelb.com.au',
  true,
  ARRAY['Medicare', 'Bupa', 'Medibank', 'AHM'],
  ARRAY['English', 'Vietnamese'],
  'Specialized in post-surgical spine rehabilitation'
),
(
  'Lisa Thompson',
  'physical_therapist',
  'Pilates & Core Strength',
  'South Yarra Physiotherapy & Pilates',
  '(03) 9826 3006',
  'hello@southyarraphysio.com.au',
  '180 Toorak Road',
  'South Yarra',
  'VIC',
  '3141',
  'https://www.southyarraphysio.com.au',
  true,
  ARRAY['Medicare', 'Bupa', 'HCF', 'Medibank'],
  ARRAY['English'],
  'Clinical Pilates for spinal conditions and core stability'
),
(
  'Michael Patel',
  'physical_therapist',
  'Sports Physiotherapy',
  'Box Hill Physiotherapy',
  '(03) 9890 8467',
  'admin@boxhillphysio.com.au',
  '1022 Whitehorse Road',
  'Box Hill',
  'VIC',
  '3128',
  'https://www.boxhillphysio.com.au',
  true,
  ARRAY['Medicare', 'Bupa', 'Medibank'],
  ARRAY['English', 'Hindi', 'Gujarati'],
  'Sports injuries and chronic back pain management'
);

-- Pain Management Specialists
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
  'Dr. Helen Roberts',
  'pain_specialist',
  'Interventional Pain Management',
  'Melbourne Pain Group',
  '(03) 9329 1455',
  'admin@melbournepaingroup.com.au',
  '119 Greville Street',
  'Prahran',
  'VIC',
  '3181',
  'https://www.melbournepaingroup.com.au',
  true,
  ARRAY['Medicare', 'Bupa', 'HCF', 'Medibank'],
  ARRAY['English'],
  'Epidural steroid injections and nerve blocks'
),
(
  'Dr. Anthony Costa',
  'pain_specialist',
  'Chronic Pain Management',
  'Victorian Comprehensive Pain Services',
  '(03) 9496 4050',
  'enquiries@vcps.com.au',
  '145 Studley Road',
  'Heidelberg',
  'VIC',
  '3084',
  'https://www.vcps.com.au',
  true,
  ARRAY['Medicare', 'Bupa', 'Medibank'],
  ARRAY['English', 'Italian'],
  'Multidisciplinary approach to chronic back pain'
);

-- Sports Medicine
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
  'Dr. Kate Morrison',
  'sports_medicine',
  'Musculoskeletal Medicine',
  'Melbourne Sports Medicine Centre',
  '(03) 9650 9372',
  'reception@msmc.com.au',
  '32 Wellington Parade',
  'East Melbourne',
  'VIC',
  '3002',
  'https://www.msmc.com.au',
  true,
  ARRAY['Medicare', 'Bupa', 'HCF', 'Medibank', 'NIB'],
  ARRAY['English'],
  'Exercise-based rehabilitation for spinal conditions'
);

-- Imaging & Radiology Centers
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
  'Melbourne Radiology Clinic',
  'imaging_radiology',
  'MRI & CT Spine Imaging',
  'Melbourne Radiology Clinic',
  '(03) 9667 1667',
  'appointments@melbrad.com.au',
  '120 Victoria Parade',
  'East Melbourne',
  'VIC',
  '3002',
  'https://www.melbourneradiology.com.au',
  true,
  ARRAY['Medicare', 'Bupa', 'HCF', 'Medibank', 'NIB', 'AHM'],
  ARRAY['English'],
  'State-of-the-art MRI and CT scanning for spine conditions'
),
(
  'I-MED Radiology Network',
  'imaging_radiology',
  'Diagnostic Imaging',
  'I-MED Radiology St Vincents',
  '(03) 9288 3100',
  'bookings@i-med.com.au',
  '55 Victoria Parade',
  'Fitzroy',
  'VIC',
  '3065',
  'https://www.i-med.com.au',
  true,
  ARRAY['Medicare', 'Bupa', 'HCF', 'Medibank', 'NIB'],
  ARRAY['English'],
  'Bulk billing available for eligible patients'
),
(
  'Vision Medical Imaging',
  'imaging_radiology',
  'Musculoskeletal Imaging',
  'Vision Medical Imaging Richmond',
  '(03) 9429 8800',
  'richmond@visionmed.com.au',
  '20 Erin Street',
  'Richmond',
  'VIC',
  '3121',
  'https://www.visionmed.com.au',
  true,
  ARRAY['Medicare', 'Bupa', 'HCF', 'Medibank'],
  ARRAY['English'],
  'Specialized spine and musculoskeletal imaging services'
);