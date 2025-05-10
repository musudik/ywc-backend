import { Request, Response } from 'express';
import { AnalysisFormController } from '../analysis-form.controller';
import { PrismaClient } from '../../../../generated/prisma';
import { z } from 'zod';

// Mock PrismaClient
jest.mock('../../../../generated/prisma', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    analysisForm: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  })),
}));

describe('AnalysisFormController', () => {
  let controller: AnalysisFormController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockPrisma: jest.Mocked<PrismaClient>;

  beforeEach(() => {
    controller = new AnalysisFormController();
    mockPrisma = new PrismaClient() as jest.Mocked<PrismaClient>;
    mockRequest = {
      currentUser: { id: 'test-user-id', email: 'test@example.com', role: 'user' },
      body: {},
      params: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };
  });

  describe('create', () => {
    it('should create a new analysis form', async () => {
      const mockFormData = {
        consultantName: 'Test Consultant',
        officeLocation: 'Test Location',
        analysisDate: '2024-03-07',
        coldRent: 1000,
        gas: 100,
        electricity: 100,
        telecommunication: 50,
        subscriptions: 30,
        accountMaintenanceFee: 10,
        livingExpenses: 500,
        alimony: 0,
        otherExpenses: 0,
        addLoanOrLeasing: false,
        analysisConsent: true,
        analysisConsentText: 'Test consent text',
        analysisConsentSignature: 'Test signature',
        analysisLocation: 'Test location',
        analysisConsentDate: '2024-03-07',
        applicants: [
          {
            type: 'A',
            firstName: 'John',
            lastName: 'Doe',
            streetAddress: '123 Test St',
            postalCode: '12345',
            city: 'Test City',
            phone: '1234567890',
            email: 'john@example.com',
            birthDate: '1990-01-01',
            birthPlace: 'Test Place',
            maritalStatus: 'Single',
            nationality: 'Test',
            housing: 'Own',
            occupation: 'Test',
            contractType: 'Full-time',
            grossIncome: 5000,
            netIncome: 4000,
            taxClass: '1',
            taxId: '12345',
            numberOfSalaries: 12,
            childBenefit: 0,
            otherIncome: 0,
            salaryProofAttached: true,
            incomeTradeBusiness: 0,
            incomeSelfEmployedWork: 0,
            incomeSideJob: 0,
            realEstate: 0,
            securities: 0,
            bankDeposits: 0,
            buildingSavings: 0,
            insuranceValues: 0,
            otherAssets: 0,
            realEstateLoans: 0,
            otherLoans: 0,
            leasingObligations: 0,
            otherLiabilities: 0,
            retirementPlanning: 'Test',
            capitalFormation: 'Test',
            realEstateGoals: 'Test',
            financing: 'Test',
            protection: 'Test',
            healthcareProvision: 'Test',
            otherGoals: 'Test',
            riskAppetite: 'Test',
            investmentHorizon: 'Test',
            knowledgeExperience: 'Test',
            healthInsurance: 'Test',
            healthInsuranceNumber: '12345',
            healthInsuranceProof: 'Test',
          },
        ],
      };

      mockRequest.body = mockFormData;
      const mockCreatedForm = { ...mockFormData, id: 'test-form-id', userId: 'test-user-id' };
      mockPrisma.analysisForm.create.mockResolvedValue(mockCreatedForm);

      await controller.create(mockRequest as Request, mockResponse as Response);

      expect(mockPrisma.analysisForm.create).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCreatedForm);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.currentUser = undefined;

      await controller.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authenticated' });
    });

    it('should return 400 if validation fails', async () => {
      mockRequest.body = { invalid: 'data' };

      await controller.create(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Validation error',
        })
      );
    });
  });

  describe('getAll', () => {
    it('should return all analysis forms for the user', async () => {
      const mockForms = [
        { id: 'form1', userId: 'test-user-id' },
        { id: 'form2', userId: 'test-user-id' },
      ];
      mockPrisma.analysisForm.findMany.mockResolvedValue(mockForms);

      await controller.getAll(mockRequest as Request, mockResponse as Response);

      expect(mockPrisma.analysisForm.findMany).toHaveBeenCalledWith({
        where: { userId: 'test-user-id' },
        include: {
          applicants: true,
          children: true,
        },
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockForms);
    });

    it('should return 401 if user is not authenticated', async () => {
      mockRequest.currentUser = undefined;

      await controller.getAll(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Not authenticated' });
    });
  });

  describe('getOne', () => {
    it('should return a specific analysis form', async () => {
      const mockForm = { id: 'test-form-id', userId: 'test-user-id' };
      mockRequest.params = { id: 'test-form-id' };
      mockPrisma.analysisForm.findFirst.mockResolvedValue(mockForm);

      await controller.getOne(mockRequest as Request, mockResponse as Response);

      expect(mockPrisma.analysisForm.findFirst).toHaveBeenCalledWith({
        where: {
          id: 'test-form-id',
          userId: 'test-user-id',
        },
        include: {
          applicants: true,
          children: true,
        },
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockForm);
    });

    it('should return 404 if form is not found', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      mockPrisma.analysisForm.findFirst.mockResolvedValue(null);

      await controller.getOne(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Analysis form not found' });
    });
  });

  describe('update', () => {
    it('should update an analysis form', async () => {
      const mockFormData = {
        consultantName: 'Updated Consultant',
        // ... other form fields
      };
      mockRequest.params = { id: 'test-form-id' };
      mockRequest.body = mockFormData;
      const mockUpdatedForm = { ...mockFormData, id: 'test-form-id', userId: 'test-user-id' };
      mockPrisma.analysisForm.findFirst.mockResolvedValue({ id: 'test-form-id', userId: 'test-user-id' });
      mockPrisma.analysisForm.update.mockResolvedValue(mockUpdatedForm);

      await controller.update(mockRequest as Request, mockResponse as Response);

      expect(mockPrisma.analysisForm.update).toHaveBeenCalled();
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedForm);
    });

    it('should return 404 if form is not found', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      mockPrisma.analysisForm.findFirst.mockResolvedValue(null);

      await controller.update(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Analysis form not found' });
    });
  });

  describe('delete', () => {
    it('should delete an analysis form', async () => {
      mockRequest.params = { id: 'test-form-id' };
      mockPrisma.analysisForm.findFirst.mockResolvedValue({ id: 'test-form-id', userId: 'test-user-id' });

      await controller.delete(mockRequest as Request, mockResponse as Response);

      expect(mockPrisma.analysisForm.delete).toHaveBeenCalledWith({
        where: { id: 'test-form-id' },
      });
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should return 404 if form is not found', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      mockPrisma.analysisForm.findFirst.mockResolvedValue(null);

      await controller.delete(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Analysis form not found' });
    });
  });

  describe('updateStatus', () => {
    it('should update form status', async () => {
      mockRequest.params = { id: 'test-form-id' };
      mockRequest.body = { status: 'Submitted' };
      const mockUpdatedForm = { id: 'test-form-id', userId: 'test-user-id', status: 'Submitted' };
      mockPrisma.analysisForm.findFirst.mockResolvedValue({ id: 'test-form-id', userId: 'test-user-id' });
      mockPrisma.analysisForm.update.mockResolvedValue(mockUpdatedForm);

      await controller.updateStatus(mockRequest as Request, mockResponse as Response);

      expect(mockPrisma.analysisForm.update).toHaveBeenCalledWith({
        where: { id: 'test-form-id' },
        data: { status: 'Submitted' },
        include: {
          applicants: true,
          children: true,
        },
      });
      expect(mockResponse.json).toHaveBeenCalledWith(mockUpdatedForm);
    });

    it('should return 400 for invalid status', async () => {
      mockRequest.params = { id: 'test-form-id' };
      mockRequest.body = { status: 'InvalidStatus' };

      await controller.updateStatus(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid status' });
    });

    it('should return 404 if form is not found', async () => {
      mockRequest.params = { id: 'non-existent-id' };
      mockRequest.body = { status: 'Submitted' };
      mockPrisma.analysisForm.findFirst.mockResolvedValue(null);

      await controller.updateStatus(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Analysis form not found' });
    });
  });
}); 