import { NextRequest, NextResponse } from 'next/server';
import { InvestorService } from '../../../../application/services/investors/InvestorService';
import { InvestorRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/InvestorRepositoryPrisma';

const investorRepository = new InvestorRepositoryPrisma();
const investorService = new InvestorService(investorRepository);

/**
 * @openapi
 * /investors/{id}:
 *   get:
 *     summary: Get Investor by ID
 *     description: Retrieve a specific investor by their ID
 *     tags:
 *       - Investors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Investor's unique ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Investor retrieved successfully
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
 *                     name:
 *                       type: string
 *                       example: "John Investor"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "john@venture.com"
 *                     company:
 *                       type: string
 *                       example: "Venture Capital Inc"
 *                     bio:
 *                       type: string
 *                       example: "Experienced investor in tech startups"
 *                     expertise:
 *                       type: string
 *                       example: "fintech, AI, blockchain"
 *                     website:
 *                       type: string
 *                       format: uri
 *                       example: "https://venture.com"
 *                     phone:
 *                       type: string
 *                       example: "+1-555-0123"
 *                     location:
 *                       type: string
 *                       example: "San Francisco, CA"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T00:00:00Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T00:00:00Z"
 *       400:
 *         description: Invalid investor ID
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
 *                   example: "Invalid investor ID"
 *       404:
 *         description: Investor not found
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
 *                   example: "Investor not found"
 *       500:
 *         description: Failed to fetch investor
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
    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid investor ID' },
        { status: 400 }
      );
    }

    const investor = await investorService.getInvestorById(id);

    if (!investor) {
      return NextResponse.json(
        { success: false, error: 'Investor not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: investor });

  } catch (error) {
    console.error('Error fetching investor:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch investor'
      },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /investors/{id}:
 *   put:
 *     summary: Update Investor
 *     description: Update an existing investor's information
 *     tags:
 *       - Investors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Investor's unique ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Investor name
 *                 example: "John Updated Investor"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Investor email
 *                 example: "john.updated@venture.com"
 *               company:
 *                 type: string
 *                 description: Investment company name
 *                 example: "New Venture Capital"
 *               bio:
 *                 type: string
 *                 description: Investor biography
 *                 example: "Updated investor biography"
 *               expertise:
 *                 type: string
 *                 description: Investment expertise areas
 *                 example: "fintech, AI, blockchain, web3"
 *               website:
 *                 type: string
 *                 format: uri
 *                 description: Company website
 *                 example: "https://newventure.com"
 *               phone:
 *                 type: string
 *                 description: Contact phone number
 *                 example: "+1-555-0124"
 *               location:
 *                 type: string
 *                 description: Investor location
 *                 example: "New York, NY"
 *     responses:
 *       200:
 *         description: Investor updated successfully
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
 *                     name:
 *                       type: string
 *                       example: "John Updated Investor"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "john.updated@venture.com"
 *                     company:
 *                       type: string
 *                       example: "New Venture Capital"
 *                     bio:
 *                       type: string
 *                       example: "Updated investor biography"
 *                     expertise:
 *                       type: string
 *                       example: "fintech, AI, blockchain, web3"
 *                     website:
 *                       type: string
 *                       format: uri
 *                       example: "https://newventure.com"
 *                     phone:
 *                       type: string
 *                       example: "+1-555-0124"
 *                     location:
 *                       type: string
 *                       example: "New York, NY"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-02T00:00:00Z"
 *                 message:
 *                   type: string
 *                   example: "Investor updated successfully"
 *       400:
 *         description: Invalid investor ID or validation error
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
 *                   example: "Invalid investor ID"
 *       404:
 *         description: Investor not found or update failed
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
 *                   example: "Investor not found or update failed"
 *       500:
 *         description: Failed to update investor
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
 *                   example: "Failed to update investor"
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid investor ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const investor = await investorService.updateInvestor(id, body);

    if (!investor) {
      return NextResponse.json(
        { success: false, error: 'Investor not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: investor,
      message: 'Investor updated successfully'
    });

  } catch (error) {
    console.error('Error updating investor:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update investor'
      },
      { status: 400 }
    );
  }
}

/**
 * @openapi
 * /investors/{id}:
 *   delete:
 *     summary: Delete Investor
 *     description: Delete an investor from the system
 *     tags:
 *       - Investors
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Investor's unique ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Investor deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Investor deleted successfully"
 *       400:
 *         description: Invalid investor ID
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
 *                   example: "Invalid investor ID"
 *       404:
 *         description: Investor not found or deletion failed
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
 *                   example: "Investor not found or deletion failed"
 *       500:
 *         description: Failed to delete investor
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
 *                   example: "Failed to delete investor"
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paramId } = await params;
    const id = parseInt(paramId);

    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'Invalid investor ID' },
        { status: 400 }
      );
    }

    const deleted = await investorService.deleteInvestor(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Investor not found or deletion failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Investor deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting investor:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete investor'
      },
      { status: 500 }
    );
  }
}
