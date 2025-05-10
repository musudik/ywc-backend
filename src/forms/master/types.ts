export type ApplicantType = 'A' | 'B';

export interface Applicant {
  type: ApplicantType;
  firstName: string;
  lastName: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  birthDate: Date;
  birthPlace: string;
  maritalStatus: string;
  nationality: string;
  housing: string;
  occupation: string;
  contractType: string;
  grossIncome: number;
  netIncome: number;
  taxClass: string;
  taxId: string;
  numberOfSalaries: number;
  childBenefit: number;
  otherIncome: number;
  salaryProofAttached: boolean;
  incomeTradeBusiness: number;
  incomeSelfEmployedWork: number;
  incomeSideJob: number;
  realEstate: number;
  securities: number;
  bankDeposits: number;
  buildingSavings: number;
  insuranceValues: number;
  otherAssets: number;
  realEstateLoans: number;
  otherLoans: number;
  leasingObligations: number;
  otherLiabilities: number;
  retirementPlanning: string;
  capitalFormation: string;
  realEstateGoals: string;
  financing: string;
  protection: string;
  healthcareProvision: string;
  otherGoals: string;
  riskAppetite: string;
  investmentHorizon: string;
  knowledgeExperience: string;
  healthInsurance: string;
  healthInsuranceNumber: string;
  healthInsuranceProof: string;
}

export interface Child {
  firstName: string;
  lastName: string;
  birthDate: Date;
  birthPlace: string;
  nationality: string;
}

export interface AnalysisForm {
  consultantName: string;
  officeLocation: string;
  analysisDate: Date;
  coldRent: number;
  gas: number;
  electricity: number;
  telecommunication: number;
  subscriptions: number;
  accountMaintenanceFee: number;
  livingExpenses: number;
  alimony: number;
  otherExpenses: number;
  addLoanOrLeasing: boolean;
  loanBank?: string;
  loanAmount?: number;
  loanMonthlyRate?: number;
  loanInterest?: number;
  analysisConsent: boolean;
  analysisConsentText: string;
  analysisConsentSignature: string;
  analysisLocation: string;
  analysisConsentDate: Date;
  applicants: Applicant[];
  children?: Child[];
}

export type FormStatus = 'No-Form' | 'Submitted' | 'Pending' | 'Approved'; 