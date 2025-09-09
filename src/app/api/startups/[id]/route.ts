import { NextRequest, NextResponse } from 'next/server';
import { StartupService } from '../../../../application/services/startups/StartupService';
import { StartupRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/StartupRepositoryPrisma';

const startupRepository = new StartupRepositoryPrisma();
const startupService = new StartupService(startupRepository);

/**
 * @openapi
 * /api/startups/{id}:
 *   get:
 *     tags:
 *       - Startups
 *     summary: Get startup by ID
 *     description: Retrieve a specific startup by its ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Startup unique ID
 *     responses:
 *       200:
 *         description: Startup retrieved successfully
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
 *                       example: "TechVenture AI"
 *                     description:
 *                       type: string
 *                       example: "Revolutionary AI solutions for businesses"
 *                     industry:
 *                       type: string
 *                       example: "Artificial Intelligence"
 *                     stage:
 *                       type: string
 *                       example: "SERIES_A"
 *                     fundingGoal:
 *                       type: number
 *                       example: 5000000
 *                     currentFunding:
 *                       type: number
 *                       example: 2500000
 *                     foundedDate:
 *                       type: string
 *                       format: date
 *                       example: "2023-01-15"
 *                     location:
 *                       type: string
 *                       example: "San Francisco, CA"
 *                     website:
 *                       type: string
 *                       format: uri
 *                       example: "https://techventure-ai.com"
 *                     email:
 *                       type: string
 *                       format: email
 *                       example: "contact@techventure-ai.com"
 *                     founders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           role:
 *                             type: string
 *                     pitchDecks:
 *                       type: array
 *                       items:
 *                         type: object
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 name: "TechVenture AI"
 *                 description: "Revolutionary AI solutions for businesses"
 *                 industry: "Artificial Intelligence"
 *                 stage: "SERIES_A"
 *                 fundingGoal: 5000000
 *                 currentFunding: 2500000
 *                 foundedDate: "2023-01-15"
 *                 location: "San Francisco, CA"
 *                 website: "https://techventure-ai.com"
 *                 email: "contact@techventure-ai.com"
 *                 founders:
 *                   - id: 1
 *                     name: "John Doe"
 *                     role: "CEO"
 *                 pitchDecks: []
 *                 createdAt: "2024-01-01T00:00:00.000Z"
 *                 updatedAt: "2024-01-15T12:00:00.000Z"
 *       400:
 *         description: Bad request - Invalid startup ID
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
 *                   example: "Invalid startup ID"
 *       404:
 *         description: Startup not found
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
 *                   example: "Startup not found"
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
 *                   example: "Internal server error"
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
        { success: false, error: 'Invalid startup ID' },
        { status: 400 }
      );
    }

    const startup = await startupService.getStartupById(id);

    if (!startup) {
      return NextResponse.json(
        { success: false, error: 'Startup not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: startup });

  } catch (error) {
    console.error('Error fetching startup:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch startup'
      },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /api/startups/{id}:
 *   put:
 *     tags:
 *       - Startups
 *     summary: Update startup
 *     description: Update an existing startup
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Startup unique ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "TechVenture AI Pro"
 *               description:
 *                 type: string
 *                 example: "Advanced AI solutions for enterprise businesses"
 *               industry:
 *                 type: string
 *                 example: "Artificial Intelligence"
 *               stage:
 *                 type: string
 *                 example: "SERIES_B"
 *               fundingGoal:
 *                 type: number
 *                 example: 5000000
 *               currentFunding:
 *                 type: number
 *                 example: 7500000
 *               location:
 *                 type: string
 *                 example: "San Francisco, CA"
 *               website:
 *                 type: string
 *                 format: uri
 *                 example: "https://techventure-ai.com"
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "contact@techventure-ai.com"
 *           example:
 *             name: "TechVenture AI Pro"
 *             description: "Advanced AI solutions for enterprise businesses"
 *             stage: "SERIES_B"
 *             currentFunding: 7500000
 *             location: "San Francisco, CA"
 *     responses:
 *       200:
 *         description: Startup updated successfully
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
 *                       example: "TechVenture AI Pro"
 *                     description:
 *                       type: string
 *                       example: "Advanced AI solutions for enterprise businesses"
 *                     industry:
 *                       type: string
 *                       example: "Artificial Intelligence"
 *                     stage:
 *                       type: string
 *                       example: "SERIES_B"
 *                     fundingGoal:
 *                       type: number
 *                       example: 5000000
 *                     currentFunding:
 *                       type: number
 *                       example: 7500000
 *                     location:
 *                       type: string
 *                       example: "San Francisco, CA"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T14:00:00.000Z"
 *                 message:
 *                   type: string
 *                   example: "Startup updated successfully"
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 name: "TechVenture AI Pro"
 *                 description: "Advanced AI solutions for enterprise businesses"
 *                 industry: "Artificial Intelligence"
 *                 stage: "SERIES_B"
 *                 fundingGoal: 5000000
 *                 currentFunding: 7500000
 *                 location: "San Francisco, CA"
 *                 updatedAt: "2024-01-15T14:00:00.000Z"
 *               message: "Startup updated successfully"
 *       400:
 *         description: Bad request - Invalid startup ID or validation error
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
 *                   example: "Invalid startup ID or validation error"
 *       404:
 *         description: Startup not found
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
 *                   example: "Startup not found"
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
 *                   example: "Internal server error"
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
        { success: false, error: 'Invalid startup ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const startup = await startupService.updateStartup(id, body);

    if (!startup) {
      return NextResponse.json(
        { success: false, error: 'Startup not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: startup,
      message: 'Startup updated successfully'
    });

  } catch (error) {
    console.error('Error updating startup:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update startup'
      },
      { status: 400 }
    );
  }
}

/**
 * @openapi
 * /api/startups/{id}:
 *   delete:
 *     tags:
 *       - Startups
 *     summary: Delete startup
 *     description: Delete a startup by ID
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Startup unique ID
 *     responses:
 *       200:
 *         description: Startup deleted successfully
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
 *                   example: "Startup deleted successfully"
 *             example:
 *               success: true
 *               message: "Startup deleted successfully"
 *       400:
 *         description: Bad request - Invalid startup ID
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
 *                   example: "Invalid startup ID"
 *       404:
 *         description: Startup not found or deletion failed
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
 *                   example: "Startup not found"
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
 *                   example: "Failed to delete startup"
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
        { success: false, error: 'Invalid startup ID' },
        { status: 400 }
      );
    }

    const deleted = await startupService.deleteStartup(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Startup not found or deletion failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Startup deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting startup:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete startup'
      },
      { status: 500 }
    );
  }
}
