
export interface CandidateReport {
  name: string;
  email: string;
  linkedin: string;
  github: string;
  summary: string;
  verdict: string;
  verdictDescription: string;
  overallScore: number;
  overallAssessment: string;
  strengths: string[];
  improvements: string[];
  technicalSkills: { name: string; score: number; max: number; note: string }[];
  softSkills: { name: string; score: number; max: number; note: string }[];
  notes: string[];
  finalEvaluation: string;
}

export interface JobDetails {
  title: string;
  location: string;
  postDate: string;
  university: string;
  startDate: string;
  duration: string;
  schedule: string;
  type: string;
  isPaid: string;
  stipend: string;
  applyBy: string;
}

export interface ResumeFile {
  id: string;
  name: string;
  timestamp: string;
  report?: CandidateReport;
}
