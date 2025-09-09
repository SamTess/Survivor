import { NextRequest, NextResponse } from 'next/server';
import { FounderService } from '../../../application/services/founders/FounderService';
import { FounderRepositoryPrisma } from '../../../infrastructure/persistence/prisma/FounderRepositoryPrisma';

const founderRepository = new FounderRepositoryPrisma();
const founderService = new FounderService(founderRepository);

/**
 * @openapi
 * /founders:
 *   get:
 *     summary: Get Founders
 *     description: Retrieve a list of founders with optional filtering
 *     tags:
 *       - Founders
 *     parameters:
 *       - in: query
 *         name: startupId
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Filter by startup ID
 *         example: 5
 *       - in: query
 *         name: userId
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Filter by user ID
 *         example: 10
 *     responses:
 *       200:
 *         description: Founders retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: "John Doe"
 *                       role:
 *                         type: string
 *                         example: "CEO"
 *                       startupId:
 *                         type: integer
 *                         example: 5
 *                       userId:
 *                         type: integer
 *                         example: 10
 *                       bio:
 *                         type: string
 *                         example: "Experienced entrepreneur"
 *                       expertise:
 *                         type: string
 *                         example: "Product Development, Leadership"
 *                       experience:
 *                         type: string
 *                         example: "15+ years in tech industry"
 *                       linkedin:
 *                         type: string
 *                         format: uri
 *                         example: "https://linkedin.com/in/johndoe"
 *                       twitter:
 *                         type: string
 *                         format: uri
 *                         example: "https://twitter.com/johndoe"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T10:00:00.000Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2024-01-15T14:00:00.000Z"
 *       400:
 *         description: Invalid startup ID or user ID
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
 *                   enum: ["Invalid startup ID", "Invalid user ID"]
 *                   example: "Invalid startup ID"
 *       500:
 *         description: Failed to fetch founders
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
 *                   example: "Failed to fetch founders"
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startupId = searchParams.get('startupId');
    const userId = searchParams.get('userId');

    if (startupId) {
      const id = parseInt(startupId);
      if (isNaN(id)) {
        return NextResponse.json(
          { success: false, error: 'Invalid startup ID' },
          { status: 400 }
        );
      }
      const founders = await founderService.getFoundersByStartupId(id);
      return NextResponse.json({ success: true, data: founders });
    }

    if (userId) {
      const id = parseInt(userId);
      if (isNaN(id)) {
        return NextResponse.json(
          { success: false, error: 'Invalid user ID' },
          { status: 400 }
        );
      }
      const founders = await founderService.getFoundersByUserId(id);
      return NextResponse.json({ success: true, data: founders });
    }

    const founders = await founderService.getAllFounders();
    return NextResponse.json({ success: true, data: founders });

  } catch (error) {
    console.error('Error fetching founders:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch founders'
      },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /founders:
 *   post:
 *     summary: Create Founder
 *     description: Create a new founder record
 *     tags:
 *       - Founders
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - startupId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Founder's name
 *                 example: "Jane Smith"
 *               role:
 *                 type: string
 *                 description: Founder's role
 *                 example: "CTO"
 *               startupId:
 *                 type: integer
 *                 description: Associated startup ID
 *                 example: 5
 *               userId:
 *                 type: integer
 *                 description: Associated user ID
 *                 example: 15
 *               bio:
 *                 type: string
 *                 description: Founder's biography
 *                 example: "Experienced technology leader with 10+ years in software development"
 *               expertise:
 *                 type: string
 *                 description: Areas of expertise
 *                 example: "Full-stack development, DevOps, Team leadership"
 *               experience:
 *                 type: string
 *                 description: Previous experience
 *                 example: "Former Senior Engineer at Google, Tech Lead at Microsoft"
 *               linkedin:
 *                 type: string
 *                 format: uri
 *                 description: LinkedIn profile URL
 *                 example: "https://linkedin.com/in/janesmith"
 *               twitter:
 *                 type: string
 *                 format: uri
 *                 description: Twitter profile URL
 *                 example: "https://twitter.com/janesmith"
 *     responses:
 *       201:
 *         description: Founder created successfully
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
 *                       example: "Jane Smith"
 *                     role:
 *                       type: string
 *                       example: "CTO"
 *                     startupId:
 *                       type: integer
 *                       example: 5
 *                     userId:
 *                       type: integer
 *                       example: 15
 *                     bio:
 *                       type: string
 *                       example: "Experienced technology leader with 10+ years in software development"
 *                     expertise:
 *                       type: string
 *                       example: "Full-stack development, DevOps, Team leadership"
 *                     experience:
 *                       type: string
 *                       example: "Former Senior Engineer at Google, Tech Lead at Microsoft"
 *                     linkedin:
 *                       type: string
 *                       format: uri
 *                       example: "https://linkedin.com/in/janesmith"
 *                     twitter:
 *                       type: string
 *                       format: uri
 *                       example: "https://twitter.com/janesmith"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T10:00:00.000Z"
 *                 message:
 *                   type: string
 *                   example: "Founder created successfully"
 *       400:
 *         description: Failed to create founder
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
 *                   example: "Failed to create founder"
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const founder = await founderService.createFounder(body);

    return NextResponse.json({
      success: true,
      data: founder,
      message: 'Founder created successfully'
    }, { status: 201 });

  } catch (error) {
    console.error('Error creating founder:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create founder'
      },
      { status: 400 }
    );
  }
}
