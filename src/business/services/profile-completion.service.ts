import { PrismaClient } from '../../../generated/prisma';
import { ProfileCompletionResponse } from '../types';

export class ProfileCompletionService {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Check if a user's profile is complete
   * @param userId The ID of the user (client)
   * @returns Profile completion status information
   */
  async getProfileCompletionStatus(userId: string): Promise<ProfileCompletionResponse> {
    console.log(`Checking profile completion for user ID: ${userId}`);
    
    try {
      // Find the user to get their role and personal details
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        include: {
          role: true,
          personalDetails: {
            include: {
              employmentDetails: true,
              incomeDetails: true,
              expensesDetails: true,
              assets: true,
              liabilities: true,
              goalsAndWishes: true,
              riskAppetite: true
            }
          }
        }
      });

      if (!user) {
        console.log('User not found');
        return this.getEmptyCompletionStatus();
      }

      console.log(`User role: ${user.role?.name}, Email: ${user.email}`);
      
      // Get personal details directly from user
      const personalDetails = user.personalDetails;

      if (!personalDetails) {
        console.log('No personal details found for user');
        return this.getEmptyCompletionStatus();
      }

      console.log(`Found personal details for user ID: ${userId}`);
      
      // Check each section
      const hasPersonalDetails = true; // If we got here, we have personal details
      const hasEmployment = personalDetails.employmentDetails && personalDetails.employmentDetails.length > 0;
      const hasIncome = personalDetails.incomeDetails && personalDetails.incomeDetails.length > 0;
      const hasExpenses = personalDetails.expensesDetails && personalDetails.expensesDetails.length > 0;
      const hasAssets = personalDetails.assets && personalDetails.assets.length > 0;
      const hasLiabilities = personalDetails.liabilities && personalDetails.liabilities.length > 0;
      const hasGoalsAndWishes = !!personalDetails.goalsAndWishes;
      const hasRiskAppetite = !!personalDetails.riskAppetite;

      console.log(`Section status:
        Personal Details: ${hasPersonalDetails}
        Employment: ${hasEmployment} (${personalDetails.employmentDetails?.length || 0} records)
        Income: ${hasIncome} (${personalDetails.incomeDetails?.length || 0} records)
        Expenses: ${hasExpenses} (${personalDetails.expensesDetails?.length || 0} records)
        Assets: ${hasAssets} (${personalDetails.assets?.length || 0} records)
        Liabilities: ${hasLiabilities} (${personalDetails.liabilities?.length || 0} records)
        Goals and Wishes: ${hasGoalsAndWishes}
        Risk Appetite: ${hasRiskAppetite}
      `);
      
      // Calculate completion percentage
      const sections = [
        hasPersonalDetails,
        hasEmployment,
        hasIncome,
        hasExpenses,
        hasAssets,
        hasLiabilities,
        hasGoalsAndWishes,
        hasRiskAppetite
      ];
      
      const completedSections = sections.filter(Boolean).length;
      const totalSections = sections.length;
      const completionPercentage = Math.round((completedSections / totalSections) * 100);

      console.log(`Completed sections: ${completedSections}/${totalSections} (${completionPercentage}%)`);
      
      // Determine if profile is complete (all required sections are filled)
      const isComplete = hasPersonalDetails && hasEmployment && hasIncome && 
                        hasExpenses && hasGoalsAndWishes && hasRiskAppetite;

      return {
        isComplete,
        sections: {
          personalDetails: hasPersonalDetails,
          employment: hasEmployment,
          income: hasIncome,
          expenses: hasExpenses,
          assets: hasAssets,
          liabilities: hasLiabilities,
          goalsAndWishes: hasGoalsAndWishes,
          riskAppetite: hasRiskAppetite
        },
        completionPercentage
      };
    } catch (error) {
      console.error('Error getting profile completion status:', error);
      return this.getEmptyCompletionStatus();
    }
  }

  /**
   * Returns an empty completion status object
   */
  private getEmptyCompletionStatus(): ProfileCompletionResponse {
    return {
      isComplete: false,
      sections: {
        personalDetails: false,
        employment: false,
        income: false,
        expenses: false,
        assets: false,
        liabilities: false,
        goalsAndWishes: false,
        riskAppetite: false
      },
      completionPercentage: 0
    };
  }
} 