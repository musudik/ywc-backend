import { ApplicantType, EmploymentType, LoanType, ConsentType, FormType } from '../../../generated/prisma';

export {
  ApplicantType,
  EmploymentType,
  LoanType,
  ConsentType,
  FormType
};

// Base interface for common fields
export interface BaseEntity {
  createdAt?: Date;
  updatedAt?: Date;
}

// Personal Details
export interface PersonalDetailsInput extends BaseEntity {
  personalId?: string;
  coachId: string;
  applicantType: ApplicantType;
  firstName: string;
  lastName: string;
  streetAddress: string;
  postalCode: string;
  city: string;
  phone: string;
  email: string;
  birthDate: Date | string;
  birthPlace: string;
  maritalStatus: string;
  nationality: string;
  housing: string;
}

// Employment Details
export interface EmploymentDetailsInput extends BaseEntity {
  employmentId?: string;
  personalId: string;
  employmentType: EmploymentType;
  occupation: string;
  contractType: string;
  contractDuration: string;
  employerName: string;
  employedSince: Date | string;
}

// Income Details
export interface IncomeDetailsInput extends BaseEntity {
  incomeId?: string;
  personalId: string;
  grossIncome: number;
  netIncome: number;
  taxClass: string;
  taxId: string;
  numberOfSalaries: number;
  childBenefit: number;
  otherIncome: number;
  incomeTradeBusiness: number;
  incomeSelfEmployedWork: number;
  incomeSideJob: number;
}

// Expenses Details
export interface ExpensesDetailsInput extends BaseEntity {
  expensesId?: string;
  personalId: string;
  coldRent: number;
  electricity: number;
  livingExpenses: number;
  gas: number;
  telecommunication: number;
  accountMaintenanceFee: number;
  alimony: number;
  subscriptions: number;
  otherExpenses: number;
}

// Asset
export interface AssetInput extends BaseEntity {
  assetId?: string;
  personalId: string;
  realEstate: number;
  securities: number;
  bankDeposits: number;
  buildingSavings: number;
  insuranceValues: number;
  otherAssets: number;
}

// Liability
export interface LiabilityInput extends BaseEntity {
  liabilityId?: string;
  personalId: string;
  loanType: LoanType;
  loanBank?: string;
  loanAmount?: number;
  loanMonthlyRate?: number;
  loanInterest?: number;
}

// Goals and Wishes
export interface GoalsAndWishesInput extends BaseEntity {
  goalsAndWishesId?: string;
  personalId: string;
  retirementPlanning: string;
  capitalFormation: string;
  realEstateGoals: string;
  financing: string;
  protection: string;
  healthcareProvision: string;
  otherGoals: string;
}

// Risk Appetite
export interface RiskAppetiteInput extends BaseEntity {
  riskAppetiteId?: string;
  personalId: string;
  riskAppetite: string;
  investmentHorizon: string;
  knowledgeExperience: string;
  healthInsurance: string;
  healthInsuranceNumber: string;
  healthInsuranceProof: string;
}

// Consent
export interface ConsentInput extends BaseEntity {
  consentId?: string;
  personalId: string;
  consentType: ConsentType;
  consent: boolean;
  consentText: string;
  consentSignature: string;
  consentDate: Date | string;
  location: string;
}

// Document
export interface DocumentInput extends BaseEntity {
  documentId?: string;
  personalId: string;
  documentName: string;
  documentLocation: string;
  documentDate: Date | string;
}

// Form
export interface FormInput extends BaseEntity {
  formId?: string;
  personalId: string;
  formType: FormType;
  formName: string;
  formLink: string;
  createdDate: Date | string;
  updatedDate: Date | string;
}

// Custom Form
export interface CustomFormInput extends BaseEntity {
  customFormId?: string;
  personalId: string;
  formTemplate: string;
  formName: string;
  createdDate: Date | string;
  updatedDate: Date | string;
} 