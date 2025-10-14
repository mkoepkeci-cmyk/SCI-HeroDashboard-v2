import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fiyaolxiarzkihlbhtmz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZpeWFvbHhpYXJ6a2lobGJodG16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk5NjQ5MzQsImV4cCI6MjA3NTU0MDkzNH0.u11vd2-k-8XeGJtehIYedN7KV9YO8oal3NKo7UhVu_w';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface Initiative {
  name: string;
  initiative_name: string;
  type: string;
  status: string;
  role?: string;
  ehrs_impacted?: string;
  service_line?: string;
  start_date?: string | null;
  end_date?: string | null;
  timeframe_display?: string;
  clinical_sponsor_name?: string;
  clinical_sponsor_title?: string | null;
  key_collaborators?: string[];
  governance_bodies?: string[];
  challenge?: string | null;
  approach?: string | null;
  outcome?: string | null;
  collaboration_detail?: string | null;
}

const initiativesData: Initiative[] = [
  // JOSH (47 assignments → 7 initiatives)
  {
    name: 'Josh',
    initiative_name: 'C5 Titrations of Medications Workgroup (Titrations in Critical Care - Adult)',
    type: 'System Initiative',
    status: 'Active',
    role: 'Co-owner',
    ehrs_impacted: 'All',
    service_line: 'Acute Institute & Cardiology',
    end_date: '2025-06-03',
    timeframe_display: 'Go-live 6/3/25',
    clinical_sponsor_name: 'John Morelli',
    challenge: 'Standardizing medication titrations for critical care adult patients across CommonSpirit Health'
  },
  {
    name: 'Josh',
    initiative_name: 'Alaris Pumps Standardization Project - Pharmacy Discussion',
    type: 'Project',
    status: 'Active',
    role: 'Co-owner',
    ehrs_impacted: 'All',
    service_line: 'Pharmacy & Oncology',
    timeframe_display: 'In Progress',
    clinical_sponsor_name: 'Karen McConnell',
    key_collaborators: ['Pharmacy Operations', 'IT'],
    challenge: 'Need for system standardization as pumps are being replaced with BD Alaris across all facilities',
    approach: 'Weekly meetings with pharmacy CIs, pharmacy operations, and IT to discuss what is needed from the system for the Alaris pump one library and how this matches up with the Epic Gold Project',
    collaboration_detail: 'Pharmacy CIs, Pharmacy Operations, IT Build Team'
  },
  {
    name: 'Josh',
    initiative_name: 'Standardizing Charging for All Hospitals for Medications',
    type: 'Epic Gold',
    status: 'Active',
    role: 'Co-owner',
    ehrs_impacted: 'Epic',
    service_line: 'Pharmacy & Oncology',
    timeframe_display: 'Design Phase',
    clinical_sponsor_name: 'Karen McConnell',
    key_collaborators: ['Mathew Linderman', 'Van', 'Yvette', 'IT Build Team', 'Finance Team'],
    challenge: 'Inconsistent medication charging practices across all CommonSpirit Health hospitals',
    approach: 'Working with IT build team, Finance Team, Van and Yvette to develop a standardized plan for medication charges across all facilities',
    collaboration_detail: 'IT Build Team, Finance Team, Van, Yvette'
  },
  {
    name: 'Josh',
    initiative_name: 'Heparin Drip - Calculator Standardization',
    type: 'Epic Gold',
    status: 'Active',
    role: 'Co-owner',
    ehrs_impacted: 'Epic',
    service_line: 'Pharmacy & Oncology, Nursing, Lab, Acute Institute & Cardiology',
    timeframe_display: 'Design Phase',
    clinical_sponsor_name: 'Karen McConnell',
    challenge: 'Need for standardized Heparin Drip calculators across all CommonSpirit Health facilities',
    approach: 'Leading the conversation and discovery of possible standardized Heparin Drips for calculators system-wide'
  },
  {
    name: 'Josh',
    initiative_name: 'VTE Prophylaxis Standardization',
    type: 'System Initiative',
    status: 'Active',
    role: 'Co-owner',
    ehrs_impacted: 'All',
    service_line: 'Acute Institute & Cardiology',
    timeframe_display: 'Design Phase',
    clinical_sponsor_name: 'John Morelli',
    challenge: 'Standardizing VTE prophylaxis protocols across the health system',
    approach: 'Focusing on the medication build for Epic'
  },
  {
    name: 'Josh',
    initiative_name: 'Neonatal Titration Parameters, Concentrations',
    type: 'System Initiative',
    status: 'Active',
    role: 'Co-owner',
    ehrs_impacted: 'Epic',
    service_line: 'Pharmacy & Oncology',
    timeframe_display: 'Discovery/Define',
    clinical_sponsor_name: 'Eric Wymore',
    challenge: 'Standardization of concentrations, mixtures, and parameters for neonatal medications',
    approach: 'To be implemented in Cerner and Epic Gold'
  },
  {
    name: 'Josh',
    initiative_name: 'Pediatric Titration Parameters & Concentrations for Epic Gold',
    type: 'System Initiative',
    status: 'Active',
    role: 'Co-owner',
    ehrs_impacted: 'Epic',
    service_line: 'Pharmacy & Oncology',
    timeframe_display: 'Discovery/Define',
    clinical_sponsor_name: 'Eric Wymore',
    challenge: 'Standardization of concentrations, mixtures, and parameters for pediatric medications',
    approach: 'To be implemented in Epic Gold (parameters previously implemented in Cerner)'
  },

  // VAN (31 assignments → 6 initiatives)
  {
    name: 'Van',
    initiative_name: 'Epic Gold: Charges - Populate GOLD erx with Billing Info',
    type: 'Epic Gold',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'Epic',
    service_line: 'Pharmacy & Oncology',
    end_date: '2026-05-02',
    timeframe_display: 'Design Phase - Wave 3',
    clinical_sponsor_name: 'System IT and Rx',
    challenge: 'Populate GOLD erx with billing info (hcpcs, waste ind, EAP) in collaboration with IT',
    approach: 'Working with the IT build team to standardize charging across Epic Gold'
  },
  {
    name: 'Van',
    initiative_name: 'TPN Standardization',
    type: 'Epic Gold',
    status: 'Completed',
    role: 'Co-owner',
    ehrs_impacted: 'Epic',
    service_line: 'Pharmacy & Oncology',
    timeframe_display: 'Completed',
    clinical_sponsor_name: 'System IT and Rx',
    challenge: 'Standardization of guiding principles for TPN build',
    outcome: 'Standards delivered to IT build, awaiting testing for gold'
  },
  {
    name: 'Van',
    initiative_name: 'Frequency Standardization',
    type: 'Epic Gold',
    status: 'Completed',
    role: 'Primary',
    ehrs_impacted: 'Epic',
    service_line: 'Pharmacy & Oncology',
    timeframe_display: 'Completed',
    clinical_sponsor_name: 'System IT and Rx',
    challenge: 'Standardizing gold freq list to that used in SOUTH',
    approach: 'Working with nursing to standardize admin times of scheduled times',
    outcome: 'Spreadsheet analysis for standardization recs. Vet with nursing and RT leaders to determine system standard times'
  },
  {
    name: 'Van',
    initiative_name: 'MAR Flowsheet Row Standardization',
    type: 'Epic Gold',
    status: 'Completed',
    role: 'Primary',
    ehrs_impacted: 'Epic',
    service_line: 'Pharmacy & Oncology',
    timeframe_display: 'Completed',
    clinical_sponsor_name: 'System IT and Rx',
    challenge: 'Standardization of which flowsheet rows belong to which meds or med classes',
    outcome: 'Worked with Karen on compiling design on meds with flowsheet rows for standardization'
  },
  {
    name: 'Van',
    initiative_name: 'ERX Analysis, Standard Design, Validation - Order Instructions',
    type: 'Epic Gold',
    status: 'Completed',
    role: 'Co-owner',
    ehrs_impacted: 'Epic',
    service_line: 'Pharmacy & Oncology',
    timeframe_display: 'Design Complete',
    clinical_sponsor_name: 'System IT and Rx',
    challenge: 'Identify Epic gold ERX for all meds that require order instructions',
    outcome: 'Spreadsheet review and design'
  },
  {
    name: 'Van',
    initiative_name: 'MTN 340B Extension Build',
    type: 'General Support',
    status: 'Completed',
    role: 'Co-owner',
    ehrs_impacted: 'Epic',
    service_line: 'Pharmacy & Oncology',
    timeframe_display: 'Completed',
    challenge: 'UD modifiers build to drop appropriately on 340B sites',
    outcome: 'Completed work. Maintenance handed to O&M teams'
  },

  // DAWN (30 assignments → 5 initiatives)
  {
    name: 'Dawn',
    initiative_name: 'BCMA Dashboard',
    type: 'System Initiative',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'All',
    service_line: 'Other',
    timeframe_display: 'Did We Deliver',
    challenge: 'Currently performing manual update of BCMA dashboard data while BI team works on automation',
    approach: 'Assisting with optimization of dashboards and reporting updates',
    outcome: 'Transitioning to BI team next couple of months - sunsetting Tableau by end of Oct 2024'
  },
  {
    name: 'Dawn',
    initiative_name: 'Stroke Collaborative SCI Support',
    type: 'System Initiative',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'All',
    service_line: 'Nursing',
    timeframe_display: 'Discovery/Define',
    challenge: 'Supporting system-wide stroke collaborative initiatives with EHR expertise'
  },
  {
    name: 'Dawn',
    initiative_name: 'Epic Gold Reporting - CAT (Including Epic Gold Quality Reporting)',
    type: 'Epic Gold',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'Epic',
    service_line: 'Other',
    timeframe_display: 'Design Phase',
    challenge: 'Primary SCI for Epic Gold Reporting CAT group',
    approach: 'Leading reporting building block design for Epic Gold'
  },
  {
    name: 'Dawn',
    initiative_name: 'Epic Gold Interoperability - CAT',
    type: 'Epic Gold',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'Epic',
    service_line: 'Other',
    timeframe_display: 'Design Phase',
    challenge: 'Meetings regarding ECLink build variations between waves related to non-provider orders',
    collaboration_detail: 'HIM BB collaboration'
  },
  {
    name: 'Dawn',
    initiative_name: 'Age Friendly Documentation',
    type: 'Project',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'Epic',
    service_line: 'Care Coordination',
    timeframe_display: 'Discovery/Define',
    challenge: 'Epic packages delayed - estimated Dec 2025 Go Live in CEN',
    approach: 'Continue weekly meetings/demo from Epic; workflow analysis'
  },

  // LISA (27 assignments → 5 initiatives)
  {
    name: 'Lisa',
    initiative_name: 'CSH SDOH Content and Protocols',
    type: 'System Initiative',
    status: 'Active',
    role: 'Secondary',
    ehrs_impacted: 'All',
    service_line: 'Nursing',
    timeframe_display: 'Discovery/Define',
    clinical_sponsor_name: 'Tracy Sklar',
    challenge: 'Marty is primary on SDOH content; will work together on safety interventions for a positive response',
    collaboration_detail: 'SDOH Taskforce'
  },
  {
    name: 'Lisa',
    initiative_name: 'Candida Auris Screening (CHI) Optimization',
    type: 'System Initiative',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'Cerner',
    service_line: 'Nursing',
    end_date: '2025-10-29',
    timeframe_display: 'Deploy - CHI: Oct 29',
    clinical_sponsor_name: 'Rebecca Leach IP',
    challenge: 'Ready for deployment of Candida Auris screening optimization'
  },
  {
    name: 'Lisa',
    initiative_name: 'System Policy: Moderate and Conscious Sedation Cerner',
    type: 'Policy/ Guideline',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'All',
    service_line: 'Nursing',
    timeframe_display: 'Discovery/Define',
    clinical_sponsor_name: 'Allison Mason/Tammie Kear',
    challenge: 'Primary for CSH IT supported Cerner domains for moderate and conscious sedation policy'
  },
  {
    name: 'Lisa',
    initiative_name: 'Readmission Project',
    type: 'Project',
    status: 'Completed',
    role: 'Support',
    ehrs_impacted: 'Cerner',
    service_line: 'Care Coordination',
    end_date: '2025-04-22',
    timeframe_display: 'Completed',
    clinical_sponsor_name: 'John Morelli, Erine Erickson, Boomie Harvey, Kyla Caffarel',
    challenge: 'Oracle readmission prevention project being implemented in CAREB & ECISA',
    approach: 'Supporting Ashley while she is out on PTO after Go live - participated in soft go live testing and project meetings for awareness'
  },
  {
    name: 'Lisa',
    initiative_name: 'CAT Infection Prevention',
    type: 'Epic Gold',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'Epic',
    timeframe_display: 'In Progress',
    challenge: 'AdHoc meetings as necessary for infection prevention CAT'
  },

  // TRUDY (25 assignments → 5 initiatives)
  {
    name: 'Trudy',
    initiative_name: 'UPDATE MDRO Tracking Rules for Pseudomonas - DH Cerner',
    type: 'System Initiative',
    status: 'Completed',
    role: 'Primary',
    ehrs_impacted: 'Cerner',
    service_line: 'Other',
    end_date: '2025-06-10',
    timeframe_display: 'Completed',
    clinical_sponsor_name: 'IP Council',
    challenge: 'Updating MDRO tracking rules for Pseudomonas in DH Cerner'
  },
  {
    name: 'Trudy',
    initiative_name: 'Wound Care Orders Optimization',
    type: 'Policy/ Guideline',
    status: 'Completed',
    role: 'Primary',
    ehrs_impacted: 'Cerner',
    service_line: 'Nursing',
    end_date: '2025-05-13',
    timeframe_display: 'Completed',
    clinical_sponsor_name: 'Lauren Bulin',
    challenge: 'Bring orders in line with the HAPI Policy',
    outcome: 'Completed'
  },
  {
    name: 'Trudy',
    initiative_name: 'WICI - OB Hemorrhage Risk Screening Tool Implementation',
    type: 'System Initiative',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'Cerner',
    service_line: 'OB/NICU',
    timeframe_display: 'Develop',
    clinical_sponsor_name: 'WICI',
    challenge: 'Implement Cerner Standard Content OB Hemorrhage Risk Screening tool',
    approach: 'Complex project with over 40 components. Defining design and writing a testing check-list. Still needs WICI Leadership approval to move forward.'
  },
  {
    name: 'Trudy',
    initiative_name: 'WICI - Updates to BFHI Breastfeeding Report',
    type: 'System Initiative',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'Epic',
    service_line: 'OB/NICU',
    timeframe_display: 'Did We Deliver',
    clinical_sponsor_name: 'WICI',
    challenge: 'Updates to BFHI Breastfeeding report to reflect current CSH breastfeeding/baby centric best practice',
    approach: 'Design session to begin May, 2025'
  },
  {
    name: 'Trudy',
    initiative_name: 'WICI - Oxytocin Pre Use and In Use Checklist Optimization',
    type: 'System Initiative',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'Cerner',
    service_line: 'OB/NICU',
    timeframe_display: 'Did We Deliver',
    clinical_sponsor_name: 'WICI',
    challenge: 'Optimization to support WICI oxytocin administration guideline updates',
    approach: 'Need Change Communication to get a Target Release date assigned'
  },

  // SHERRY (23 assignments → 4 initiatives)
  {
    name: 'Sherry',
    initiative_name: 'System Policy: Moderate and Conscious Sedation Policy',
    type: 'Policy/ Guideline',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'All',
    service_line: 'Surgery, Anesthesia, Transplant',
    timeframe_display: 'Discovery/Define',
    clinical_sponsor_name: 'System Sedation Team',
    challenge: 'EHR updates based on EHR Policy update'
  },
  {
    name: 'Sherry',
    initiative_name: 'Suicide Policy Updates',
    type: 'Policy/ Guideline',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'All',
    service_line: 'Nursing',
    end_date: '2025-09-06',
    timeframe_display: 'Develop - Go-Live 9/6/25',
    challenge: 'EHR Updates related to new Policy update for suicide screening and response'
  },
  {
    name: 'Sherry',
    initiative_name: 'EHR to SPM Service Now Project',
    type: 'Project',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'All',
    service_line: 'Other',
    timeframe_display: 'Did We Deliver - Live, ongoing fixes',
    challenge: 'Project to transition from ALM to SM (Phase 1), Single front door (Phase 2)',
    outcome: 'Live, ongoing fixes'
  },
  {
    name: 'Sherry',
    initiative_name: 'CAT Emergency Department (ASAP)',
    type: 'General Support',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'All',
    service_line: 'Acute Institute & Cardiology',
    timeframe_display: 'In Progress',
    challenge: 'Provider, Nursing, and Ancillary Emergency Care CAT group leadership'
  },

  // ASHLEY (fewer assignments → 6 initiatives)
  {
    name: 'Ashley',
    initiative_name: 'Critical Care Titration & Block Charting Initiative',
    type: 'Policy/ Guideline',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'All',
    service_line: 'Acute Institute & Cardiology',
    timeframe_display: 'Design - Phased Go-Live',
    clinical_sponsor_name: 'Brenda Downs',
    challenge: 'System-wide policy to standardize IV titrations block charting',
    approach: 'A System Titrations Policy Toolkit has been released by the C5 Clinical Institute. South region (TX/TN/KY) Epic sites went live September 6, aligned with the Epic upgrade. Other Epic markets are scheduled to go live November 2025 due to upgrade priorities.'
  },
  {
    name: 'Ashley',
    initiative_name: 'Readmission Project 4343',
    type: 'Project',
    status: 'Completed',
    role: 'Primary',
    ehrs_impacted: 'Cerner',
    service_line: 'Care Coordination',
    end_date: '2025-04-22',
    timeframe_display: 'Completed',
    clinical_sponsor_name: 'Boomie, Dr. Erickson, Dr. Morelli',
    challenge: 'Oracle readmission prevention project being implemented in CAREB & ECISA',
    outcome: 'Validation completed, soft activation week of Mar 17, Go-Live week of April 22'
  },
  {
    name: 'Ashley',
    initiative_name: 'Epic/Elsevier Care Plan',
    type: 'System Initiative',
    status: 'Active',
    role: 'Secondary',
    ehrs_impacted: 'Epic',
    service_line: 'Nursing',
    end_date: '2026-05-01',
    timeframe_display: 'Discovery/Define - Go-Live May 2026',
    clinical_sponsor_name: 'Connie Clemmons-Brown',
    challenge: 'Establishing Interprofessional Plan of Care Council (IPCC) for system-wide clinical and operational decision-making',
    approach: 'Work with IPCC team and Elsevier to manage practice decisions and support clinical adoption'
  },
  {
    name: 'Ashley',
    initiative_name: 'UKM/UGM/Kronos Enterprise Roll out',
    type: 'System Initiative',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'All',
    service_line: 'Other',
    end_date: '2026-05-01',
    timeframe_display: 'Discovery/Define - May 2026',
    challenge: 'IT Enterprise Transition to Kronos Suite (Replacing Clairvia and Teams Scheduling Tools)',
    approach: 'Prioritize the Care Value System Team for Wave 1. Engage Regional/Market Clinical Informatics Leaders to identify local Change Champions to support the transition.',
    collaboration_detail: 'Michelle Gunsher, Regional/Market CI Leaders'
  },
  {
    name: 'Ashley',
    initiative_name: 'CAT Orthopedics, Bones - Gold',
    type: 'Epic Gold',
    status: 'Completed',
    role: 'Primary',
    ehrs_impacted: 'Epic',
    timeframe_display: 'Completed',
    challenge: 'SCI leading CAT Orthopedic building block to support alignment, standardization, and optimization across the system'
  },
  {
    name: 'Ashley',
    initiative_name: 'CAT Nutrition - Gold',
    type: 'Epic Gold',
    status: 'Completed',
    role: 'Primary',
    ehrs_impacted: 'Epic',
    timeframe_display: 'Completed',
    challenge: 'SCI leading CAT nutrition building block to support alignment, standardization, and optimization across the system'
  },

  // BROOKE (fewer assignments → 4 initiatives)
  {
    name: 'Brooke',
    initiative_name: 'PRM0011081 Centralized CMU Telemetry',
    type: 'Project',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'Epic',
    service_line: 'Acute Institute & Cardiology',
    timeframe_display: 'Did We Deliver',
    clinical_sponsor_name: 'Holly Kelly',
    challenge: 'Central monitoring unit telemetry rollout',
    outcome: 'Live: 8 facilities from 4 states being monitored from CareBase. Next roll-out: St. Luke\'s Baylor - McNair Campus scheduled for Sept/Oct 2025. After McNair roll out, will move to 8 facilities in PNW'
  },
  {
    name: 'Brooke',
    initiative_name: 'FETR0075981 Candida Auris Screening Optimization',
    type: 'System Initiative',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'Epic',
    service_line: 'Other',
    timeframe_display: 'Develop',
    clinical_sponsor_name: 'Roy Boukidijan/Becky Leach',
    challenge: 'System optimization request from the Infection Prevention Council',
    approach: 'Final design approved 6.25.25, waiting for IT resources to start the build'
  },
  {
    name: 'Brooke',
    initiative_name: 'FETR0067305 System Telemetry Policy',
    type: 'Policy/ Guideline',
    status: 'Active',
    role: 'Secondary',
    ehrs_impacted: 'Epic',
    service_line: 'Acute Institute & Cardiology',
    timeframe_display: 'Design',
    clinical_sponsor_name: 'John Morelli/Connie Clemmons Brown',
    challenge: 'System policy for Cardiac Monitoring to move toward AHA indications and a new OPA',
    approach: 'Supporting Nicole Johnson from MI with historical decisions, info etc. Approved by Dr. Morelli and Connie Clemmons Brown.'
  },
  {
    name: 'Brooke',
    initiative_name: 'CAT Inpatient Nursing - Gold',
    type: 'Epic Gold',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'Epic',
    service_line: 'Nursing',
    timeframe_display: 'Design',
    challenge: 'Review Gold Decisions for Inpatient Nursing building block'
  },

  // JASON (fewer assignments → 5 initiatives)
  {
    name: 'Jason',
    initiative_name: 'Epic Gold: Behavioral Health',
    type: 'Epic Gold',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'Epic',
    timeframe_display: 'Develop',
    challenge: 'Facilitate BH CAT group meetings and activities (prep and full group meetings, agenda/minutes, group emails and materials, Orion updates, etc.)'
  },
  {
    name: 'Jason',
    initiative_name: 'Harm to Others System Policy EHR Alignment',
    type: 'Policy/ Guideline',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'All',
    service_line: 'Acute Institute & Cardiology',
    timeframe_display: 'Discovery/Define',
    clinical_sponsor_name: 'System VP BH Paul Rains',
    challenge: 'Working with BH leadership to answer outstanding EHR-related questions prior to placing EHR change request ticket'
  },
  {
    name: 'Jason',
    initiative_name: 'BH: Migration from Depart Process to Discharge Workflow Mpage',
    type: 'System Initiative',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'Cerner',
    timeframe_display: 'Develop',
    challenge: 'Begun in 2021; now in final non-prod validation',
    approach: 'Concerns about provider build elements; awaiting return of primary builder to address/fix discrepancies before finalizing test script'
  },
  {
    name: 'Jason',
    initiative_name: 'ED Design Approval Group (ED DAG) Facilitation',
    type: 'System Initiative',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'Cerner',
    timeframe_display: 'Discovery/Define',
    challenge: 'Regular planning and co-facilitation of monthly meeting, including agenda and minutes prep, meeting issue followups, and other meeting activities'
  },
  {
    name: 'Jason',
    initiative_name: 'Abridge ED Implementation',
    type: 'System Initiative',
    status: 'Active',
    role: 'Secondary',
    ehrs_impacted: 'All',
    timeframe_display: 'Discovery/Define',
    challenge: 'Ambient listening - Preparing for ED expansion'
  },

  // KIM (fewer assignments → 3 initiatives)
  {
    name: 'Kim',
    initiative_name: 'Periops: Procedure/Case Level Bi-weekly',
    type: 'System Initiative',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'Cerner',
    service_line: 'Surgery, Anesthesia, Transplant',
    timeframe_display: 'Ongoing',
    challenge: 'Specific to 3rd party IMO and procedure/case level requests and discussion',
    approach: 'Working on a new process that will include IMO'
  },
  {
    name: 'Kim',
    initiative_name: 'Bedside Procedures (Multiple ALMs)',
    type: 'General Support',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'Cerner',
    service_line: 'Revenue Cycle',
    timeframe_display: 'Ongoing',
    challenge: 'Long term effort for bedside procedures',
    approach: 'Have now gone live in the two pilot sites for A-lines, will be starting on "Bladder Scans" next month with the two pilot sites. Each new bedside procedure will need a separate ticket.'
  },
  {
    name: 'Kim',
    initiative_name: 'Endoscopy and Lithotripsy Procedural Documentation Update',
    type: 'General Support',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'Cerner',
    service_line: 'Surgery, Anesthesia, Transplant',
    timeframe_display: 'In progress',
    challenge: 'Might need project consideration'
  },

  // MARISA (fewer assignments → 4 initiatives)
  {
    name: 'Marisa',
    initiative_name: 'Critical Care Titrations',
    type: 'Policy/ Guideline',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'All',
    service_line: 'Acute Institute & Cardiology',
    timeframe_display: 'Develop - Staggered go-live',
    clinical_sponsor_name: 'Brenda Downs',
    challenge: 'System wide changes to block charting for titration medications that will touch all EHRs',
    approach: 'Nursing piece is minimal, pharmacy build is substantial'
  },
  {
    name: 'Marisa',
    initiative_name: 'Readmission Project',
    type: 'Project',
    status: 'Completed',
    role: 'Primary',
    ehrs_impacted: 'Cerner',
    service_line: 'Care Coordination',
    timeframe_display: 'Completed',
    clinical_sponsor_name: 'Dr. Boomie Harvey, Dr. Erin Erickson, Dr. Morelli',
    challenge: 'Oracle readmission prevention project being implemented in CAREB & ECISA in March 2025',
    approach: 'Time consuming - 3-5 meetings a week'
  },
  {
    name: 'Marisa',
    initiative_name: 'CAT Inpatient Nursing - Gold',
    type: 'Epic Gold',
    status: 'Active',
    role: 'Secondary',
    ehrs_impacted: 'Epic',
    timeframe_display: 'In Progress',
    challenge: 'Secondary SCI leading the CAT Inpatient Nursing building block reviews'
  },
  {
    name: 'Marisa',
    initiative_name: 'CAT Care Coordination - Gold',
    type: 'Epic Gold',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'Epic',
    timeframe_display: 'In Progress',
    challenge: 'SCI leading the CAT Care Coordination building block reviews'
  },

  // MATT (fewer assignments → 3 initiatives)
  {
    name: 'Matt',
    initiative_name: 'Epic Gold Therapies',
    type: 'Epic Gold',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'Epic',
    service_line: 'Other',
    end_date: '2025-11-02',
    timeframe_display: 'Design - 11/2/2025',
    clinical_sponsor_name: 'National Respiratory Care Collaborative',
    challenge: 'Final data gathering, will entail multiple future CAT meetings'
  },
  {
    name: 'Matt',
    initiative_name: 'Epic Gold Respiratory Care',
    type: 'Epic Gold',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'Epic',
    service_line: 'Other',
    end_date: '2025-11-02',
    timeframe_display: 'Design - 11/2/2025',
    clinical_sponsor_name: 'National Rehab Council',
    challenge: 'Final data gathering, potential future CAT meetings'
  },
  {
    name: 'Matt',
    initiative_name: 'Tracheostomy Weaning Protocol and RT Charge Standardization',
    type: 'Policy/ Guideline',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'All',
    service_line: 'Other',
    timeframe_display: 'Discovery/Define',
    clinical_sponsor_name: 'National Respiratory Care Collaborative',
    challenge: '2 separate requests from RT for large scale projects: 1) System wide trach weaning protocol and 2) System wide standardization of RT CDMs and Charges',
    approach: 'Facility paper protocol to system EHR development'
  },

  // MELISSA (fewer assignments → 4 initiatives)
  {
    name: 'Melissa',
    initiative_name: 'Epic/Elsevier Care Plan',
    type: 'System Initiative',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'Epic',
    service_line: 'Nursing',
    timeframe_display: 'Discovery/Define',
    clinical_sponsor_name: 'Allison Mason',
    challenge: 'The Patient\'s Plan of Care (POC) requires interprofessional collaboration to align assessments, interventions, and evaluations with patient-centered goals and outcomes',
    approach: 'Establishing Interprofessional Plan of Care Council (IPCC) for system-wide clinical and operational decision-making. Work with IPCC team and Elsevier to manage practice decisions and support clinical adoption.'
  },
  {
    name: 'Melissa',
    initiative_name: 'Violence and Human Trafficking Response EHR Support',
    type: 'System Initiative',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'All',
    service_line: 'Other',
    timeframe_display: 'Discovery/Define',
    clinical_sponsor_name: 'Holly Gibbs',
    challenge: 'SDOH screening and our policy surrounding abuse screening. This effects Epic, Epic Gold, and Cerner'
  },
  {
    name: 'Melissa',
    initiative_name: 'Patient Belongings & Valuables System Policy Task Force',
    type: 'Policy/ Guideline',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'All',
    service_line: 'Nursing',
    timeframe_display: 'Develop',
    clinical_sponsor_name: 'Allison Mason',
    challenge: 'In order to comply with changes in CommonSpirit Policy related to documentation of Valuables and Belongings, changes are required for all EHRs'
  },
  {
    name: 'Melissa',
    initiative_name: 'Wellsky/CarePort/Transitions',
    type: 'System Initiative',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'All',
    service_line: 'Care Coordination',
    timeframe_display: 'Discovery/Define',
    challenge: 'Care Coordination solution to assist with patient transfers to outside facilities'
  },

  // ROBIN (fewer assignments → 3 initiatives)
  {
    name: 'Robin',
    initiative_name: 'Vascular Access Policy',
    type: 'Policy/ Guideline',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'All',
    service_line: 'Nursing',
    timeframe_display: 'Discovery/Define',
    challenge: 'SCI leading the work to include MTN in the CSH Vascular Access Policy and build'
  },
  {
    name: 'Robin',
    initiative_name: 'Mobile Apps',
    type: 'System Initiative',
    status: 'Active',
    role: 'Primary',
    ehrs_impacted: 'All',
    service_line: 'Nursing',
    timeframe_display: 'Discovery/Define',
    challenge: 'SCI Lead to support updates across the organization for use of mobile devices with standardized applications'
  },
  {
    name: 'Robin',
    initiative_name: 'CAT Care Coordination',
    type: 'Project',
    status: 'Completed',
    role: 'Primary',
    ehrs_impacted: 'Epic',
    service_line: 'Care Coordination',
    end_date: '2025-09-01',
    timeframe_display: 'Completed - Sept 2025',
    challenge: 'Review Nova Notes for Feb 25 Upgrade'
  },

  // YVETTE (fewer assignments → 5 initiatives)
  {
    name: 'Yvette',
    initiative_name: 'Titrations in Critical Care (Adult)',
    type: 'Policy/ Guideline',
    status: 'Active',
    role: 'Co-owner',
    ehrs_impacted: 'Cerner, Epic',
    service_line: 'Acute Institute & Cardiology',
    timeframe_display: 'Design',
    clinical_sponsor_name: 'Brenda Downs',
    challenge: 'Implementation of new titration parameters and concentrations in Cerner and where possible in Epic'
  },
  {
    name: 'Yvette',
    initiative_name: 'Neonatal Titration Parameters, Concentrations',
    type: 'System Initiative',
    status: 'Active',
    role: 'Co-owner',
    ehrs_impacted: 'Cerner, Epic',
    service_line: 'Pharmacy & Oncology',
    timeframe_display: 'Discovery/Define',
    clinical_sponsor_name: 'Karen McConnell',
    challenge: 'Standardization of concentrations, mixtures, and parameters. To be implemented in Cerner and Epic Gold'
  },
  {
    name: 'Yvette',
    initiative_name: 'Pediatric Titration Parameters & Concentrations for Epic Gold',
    type: 'System Initiative',
    status: 'Active',
    role: 'Co-owner',
    ehrs_impacted: 'Epic',
    service_line: 'Pharmacy & Oncology',
    timeframe_display: 'Discovery/Define',
    clinical_sponsor_name: 'Karen McConnell',
    challenge: 'Standardization of concentrations, mixtures, and parameters. To be implemented in Epic Gold (parameters previously implemented in Cerner)'
  },
  {
    name: 'Yvette',
    initiative_name: 'Cytokine Release Syndrome Order Set and Scoring Tool Flowsheet',
    type: 'Policy/ Guideline',
    status: 'Completed',
    role: 'Primary',
    ehrs_impacted: 'Cerner, Epic',
    service_line: 'Pharmacy & Oncology',
    timeframe_display: 'Completed',
    clinical_sponsor_name: 'OCI',
    challenge: 'Epic flowsheet scoring tool and order set for Cytokine Release Syndrome',
    outcome: 'Epic flowsheet scoring tool is complete. Epic order set is ready for release. Cerner tickets for both are in design'
  },
  {
    name: 'Yvette',
    initiative_name: 'Leapfrog/ISMP EHR Updates',
    type: 'General Support',
    status: 'Active',
    role: 'Co-owner',
    ehrs_impacted: 'Cerner',
    service_line: 'Pharmacy & Oncology',
    timeframe_display: 'In Progress',
    clinical_sponsor_name: 'Tamra O\'Bryan',
    challenge: 'Ongoing review of ISMP updates and yearly review of Leapfrog changes and/or test results that require EHR updates'
  }
];

async function populateAllSCIs() {
  console.log('🚀 Starting population of initiatives for all 15 SCIs...\n');

  let totalCreated = 0;
  let totalErrors = 0;

  for (const initiativeData of initiativesData) {
    try {
      // Get team member ID
      const { data: memberData, error: memberError } = await supabase
        .from('team_members')
        .select('id')
        .eq('name', initiativeData.name)
        .single();

      if (memberError) {
        console.error(`❌ Error finding ${initiativeData.name}:`, memberError.message);
        totalErrors++;
        continue;
      }

      const memberId = memberData.id;

      // Create initiative
      const { data: initiative, error: initiativeError } = await supabase
        .from('initiatives')
        .insert({
          team_member_id: memberId,
          owner_name: initiativeData.name,
          initiative_name: initiativeData.initiative_name,
          type: initiativeData.type,
          status: initiativeData.status,
          role: initiativeData.role || null,
          ehrs_impacted: initiativeData.ehrs_impacted || null,
          service_line: initiativeData.service_line || null,
          start_date: initiativeData.start_date || null,
          end_date: initiativeData.end_date || null,
          timeframe_display: initiativeData.timeframe_display || null,
          clinical_sponsor_name: initiativeData.clinical_sponsor_name || null,
          clinical_sponsor_title: initiativeData.clinical_sponsor_title || null,
          key_collaborators: initiativeData.key_collaborators || [],
          governance_bodies: initiativeData.governance_bodies || [],
          is_draft: false,
          last_updated_by: initiativeData.name
        })
        .select()
        .single();

      if (initiativeError) {
        console.error(`❌ Error creating initiative for ${initiativeData.name}:`, initiativeError.message);
        totalErrors++;
        continue;
      }

      // Create initiative story if data exists
      if (initiativeData.challenge || initiativeData.approach || initiativeData.outcome) {
        await supabase.from('initiative_stories').insert({
          initiative_id: initiative.id,
          challenge: initiativeData.challenge || null,
          approach: initiativeData.approach || null,
          outcome: initiativeData.outcome || null,
          collaboration_detail: initiativeData.collaboration_detail || null
        });
      }

      console.log(`✓ Created: ${initiativeData.name} - ${initiativeData.initiative_name}`);
      totalCreated++;

    } catch (error) {
      console.error(`❌ Unexpected error for ${initiativeData.name}:`, error);
      totalErrors++;
    }
  }

  console.log(`\n✅ Population complete!`);
  console.log(`   Total initiatives created: ${totalCreated}`);
  console.log(`   Total errors: ${totalErrors}`);
  console.log(`\n📊 Breakdown by SCI:`);

  const sciCounts = initiativesData.reduce((acc, init) => {
    acc[init.name] = (acc[init.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  Object.entries(sciCounts).forEach(([name, count]) => {
    console.log(`   ${name}: ${count} initiatives`);
  });
}

populateAllSCIs();
