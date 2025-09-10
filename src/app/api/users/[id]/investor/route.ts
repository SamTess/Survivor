import { NextRequest, NextResponse } from 'next/server';
import { InvestorService } from '../../../../../application/services/investors/InvestorService';
import { InvestorRepositoryPrisma } from '../../../../../infrastructure/persistence/prisma/InvestorRepositoryPrisma';

const investorRepository = new InvestorRepositoryPrisma();
const investorService = new InvestorService(investorRepository);

/**
 * @openapi
 * /api/users/{id}/investor:
 *   get:
 *     tags:
 *       - Users
 *     summary: Get user's investor profile
 *     description: Retrieve the investor profile associated with a specific user
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User unique ID
 *     responses:
 *       200:
 *         description: Investor profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     userId:
 *                       type: integer
 *                       example: 5
 *                     name:
 *                       type: string
 *                       example: "Jane Smith"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "jane@techventures.com"
 *                     companyName:
 *                       type: string
 *                       example: "Tech Ventures Fund"
 *                     role:
 *                       type: string
 *                       enum: [ANGEL_INVESTOR, VENTURE_CAPITALIST, CORPORATE_INVESTOR, FUND_MANAGER]
 *                       example: "VENTURE_CAPITALIST"
 *                     investmentCapacity:
 *                       type: number
 *                       example: 500000
 *                     areasOfInterest:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["Technology", "Healthcare", "Fintech"]
 *                     bio:
 *                       type: string
 *                       example: "Experienced VC with 10+ years in tech investments"
 *                     linkedin:
 *                       type: string
 *                       format: uri
 *                       example: "https://linkedin.com/in/janesmith"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T00:00:00.000Z"
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 userId: 5
 *                 name: "Jane Smith"
 *                 email: "jane@techventures.com"
 *                 companyName: "Tech Ventures Fund"
 *                 role: "VENTURE_CAPITALIST"
 *                 investmentCapacity: 500000
 *                 areasOfInterest: ["Technology", "Healthcare", "Fintech"]
 *                 bio: "Experienced VC with 10+ years in tech investments"
 *                 linkedin: "https://linkedin.com/in/janesmith"
 *                 createdAt: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: Bad request - Invalid user ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Invalid user ID"
 *       404:
 *         description: Investor not found for this user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Investor not found for this user"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Failed to fetch investor"
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const userId = parseInt(paramId);

    if (isNaN(userId)) {
      return NextResponse.json(
        { success: false, error: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const investor = await investorService.getInvestorByUserId(userId);

    if (!investor) {
      return NextResponse.json(
        { success: false, error: 'Investor not found for this user' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: investor });

  } catch (error) {
    console.error('Error fetching investor by user ID:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch investor'
      },
      { status: 500 }
    );
  }
}
