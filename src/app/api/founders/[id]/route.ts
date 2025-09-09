import { NextRequest, NextResponse } from 'next/server';
import { FounderService } from '../../../../application/services/founders/FounderService';
import { FounderRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/FounderRepositoryPrisma';

const founderRepository = new FounderRepositoryPrisma();
const founderService = new FounderService(founderRepository);

/**
 * @openapi
 * /founders/{id}:
 *   get:
 *     summary: Get Founder by ID
 *     description: Retrieve a specific founder by their ID
 *     tags:
 *       - Founders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Founder ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Founder retrieved successfully
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
 *                       example: "John Doe"
 *                     role:
 *                       type: string
 *                       example: "CEO"
 *                     startupId:
 *                       type: integer
 *                       example: 5
 *                     userId:
 *                       type: integer
 *                       example: 10
 *                     bio:
 *                       type: string
 *                       example: "Experienced entrepreneur"
 *                     expertise:
 *                       type: string
 *                       example: "Product Development, Team Leadership"
 *                     experience:
 *                       type: string
 *                       example: "15+ years in tech industry"
 *                     linkedin:
 *                       type: string
 *                       format: uri
 *                       example: "https://linkedin.com/in/johndoe"
 *                     twitter:
 *                       type: string
 *                       format: uri
 *                       example: "https://twitter.com/johndoe"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T14:00:00.000Z"
 *       400:
 *         description: Invalid founder ID
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
 *                   example: "Invalid founder ID"
 *       404:
 *         description: Founder not found
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
 *                   example: "Founder not found"
 *       500:
 *         description: Failed to fetch founder
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
 *                   example: "Failed to fetch founder"
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
        { success: false, error: 'Invalid founder ID' },
        { status: 400 }
      );
    }

    const founder = await founderService.getFounderById(id);

    if (!founder) {
      return NextResponse.json(
        { success: false, error: 'Founder not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: founder });

  } catch (error) {
    console.error('Error fetching founder:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch founder'
      },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /founders/{id}:
 *   put:
 *     summary: Update Founder
 *     description: Update an existing founder's information
 *     tags:
 *       - Founders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Founder unique ID
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
 *                 description: Founder name
 *                 example: "John Smith"
 *               role:
 *                 type: string
 *                 description: Founder role/position
 *                 example: "CTO & Co-Founder"
 *               bio:
 *                 type: string
 *                 description: Founder biography
 *                 example: "Senior entrepreneur with 15+ years experience in tech"
 *               expertise:
 *                 type: string
 *                 description: Areas of expertise
 *                 example: "Product Development, Team Leadership, AI/ML"
 *               experience:
 *                 type: string
 *                 description: Previous experience
 *                 example: "Former CTO at TechCorp, 10+ years in software development"
 *               linkedin:
 *                 type: string
 *                 format: uri
 *                 description: LinkedIn profile URL
 *                 example: "https://linkedin.com/in/johnsmith"
 *               twitter:
 *                 type: string
 *                 format: uri
 *                 description: Twitter profile URL
 *                 example: "https://twitter.com/johnsmith"
 *               startupId:
 *                 type: integer
 *                 description: Associated startup ID
 *                 example: 5
 *               userId:
 *                 type: integer
 *                 description: Associated user ID
 *                 example: 10
 *     responses:
 *       200:
 *         description: Founder updated successfully
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
 *                       example: "John Smith"
 *                     role:
 *                       type: string
 *                       example: "CTO & Co-Founder"
 *                     bio:
 *                       type: string
 *                       example: "Senior entrepreneur with 15+ years experience in tech"
 *                     expertise:
 *                       type: string
 *                       example: "Product Development, Team Leadership, AI/ML"
 *                     experience:
 *                       type: string
 *                       example: "Former CTO at TechCorp, 10+ years in software development"
 *                     linkedin:
 *                       type: string
 *                       format: uri
 *                       example: "https://linkedin.com/in/johnsmith"
 *                     twitter:
 *                       type: string
 *                       format: uri
 *                       example: "https://twitter.com/johnsmith"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T14:00:00.000Z"
 *                 message:
 *                   type: string
 *                   example: "Founder updated successfully"
 *       400:
 *         description: Invalid founder ID or validation error
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
 *                   example: "Invalid founder ID"
 *       404:
 *         description: Founder not found or update failed
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
 *                   example: "Founder not found or update failed"
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
 *                   example: "Failed to update founder"
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
        { success: false, error: 'Invalid founder ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const founder = await founderService.updateFounder(id, body);

    if (!founder) {
      return NextResponse.json(
        { success: false, error: 'Founder not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: founder,
      message: 'Founder updated successfully'
    });

  } catch (error) {
    console.error('Error updating founder:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update founder'
      },
      { status: 400 }
    );
  }
}

/**
 * @openapi
 * /founders/{id}:
 *   delete:
 *     summary: Delete Founder
 *     description: Delete a founder profile permanently
 *     tags:
 *       - Founders
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Founder unique ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Founder deleted successfully
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
 *                   example: "Founder deleted successfully"
 *       400:
 *         description: Invalid founder ID
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
 *                   example: "Invalid founder ID"
 *       404:
 *         description: Founder not found or deletion failed
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
 *                   example: "Founder not found or deletion failed"
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
 *                   example: "Failed to delete founder"
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
        { success: false, error: 'Invalid founder ID' },
        { status: 400 }
      );
    }

    const deleted = await founderService.deleteFounder(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Founder not found or deletion failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Founder deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting founder:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete founder'
      },
      { status: 500 }
    );
  }
}
