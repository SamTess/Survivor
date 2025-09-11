import { NextRequest, NextResponse } from 'next/server';
import { PartnerService } from '../../../../application/services/partners/PartnerService';
import { PartnerRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/PartnerRepositoryPrisma';

const partnerRepository = new PartnerRepositoryPrisma();
const partnerService = new PartnerService(partnerRepository);

/**
 * @openapi
 * /partners/{id}:
 *   get:
 *     summary: Get Partner by ID
 *     description: Retrieve a specific partner by their ID
 *     tags:
 *       - Partners
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Partner unique ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Partner retrieved successfully
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
 *                       description: Partner unique ID
 *                       example: 1
 *                     name:
 *                       type: string
 *                       description: Partner name
 *                       example: "TechCorp Solutions"
 *                     email:
 *                       type: string
 *                       description: Partner email
 *                       example: "contact@techcorp.com"
 *                     companyName:
 *                       type: string
 *                       description: Company name
 *                       example: "TechCorp Inc."
 *                     partnerType:
 *                       type: string
 *                       description: Partner type
 *                       example: "STRATEGIC"
 *                     industry:
 *                       type: string
 *                       description: Industry sector
 *                       example: "Technology"
 *                     description:
 *                       type: string
 *                       description: Partner description
 *                       example: "Leading technology solutions provider"
 *                     website:
 *                       type: string
 *                       description: Website URL
 *                       example: "https://techcorp.com"
 *                     contactPerson:
 *                       type: string
 *                       description: Contact person name
 *                       example: "John Manager"
 *                     phone:
 *                       type: string
 *                       description: Contact phone number
 *                       example: "+1-555-0123"
 *                     services:
 *                       type: array
 *                       items:
 *                         type: string
 *                       description: Services offered
 *                       example: ["Consulting", "Development", "Support"]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       description: Creation timestamp
 *                       example: "2024-01-01T00:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       description: Last update timestamp
 *                       example: "2024-01-15T12:00:00.000Z"
 *       400:
 *         description: Invalid partner ID
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
 *                   example: "Invalid partner ID"
 *       404:
 *         description: Partner not found
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
 *                   example: "Partner not found"
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
 *                   example: "Failed to fetch partner"
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
        { success: false, error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    const partner = await partnerService.getPartnerById(id);

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: partner });

  } catch (error) {
    console.error('Error fetching partner:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch partner'
      },
      { status: 500 }
    );
  }
}

/**
 * @openapi
 * /partners/{id}:
 *   put:
 *     summary: Update Partner
 *     description: Update an existing partner's information
 *     tags:
 *       - Partners
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Partner unique ID
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
 *                 description: Partner name
 *                 example: "TechCorp Advanced Solutions"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Partner email
 *                 example: "contact@techcorp.com"
 *               companyName:
 *                 type: string
 *                 description: Company name
 *                 example: "TechCorp Inc."
 *               partnerType:
 *                 type: string
 *                 enum: [STRATEGIC, TECHNOLOGY, VENDOR, DISTRIBUTION, FINANCIAL]
 *                 description: Partner type
 *                 example: "TECHNOLOGY"
 *               industry:
 *                 type: string
 *                 description: Industry sector
 *                 example: "Technology"
 *               description:
 *                 type: string
 *                 description: Partner description
 *                 example: "Leading advanced technology solutions provider"
 *               website:
 *                 type: string
 *                 format: uri
 *                 description: Website URL
 *                 example: "https://techcorp.com"
 *               contactPerson:
 *                 type: string
 *                 description: Contact person name
 *                 example: "John Manager"
 *               phone:
 *                 type: string
 *                 description: Contact phone number
 *                 example: "+1-555-0123"
 *               services:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Services offered
 *                 example: ["AI Consulting", "Cloud Development", "24/7 Support"]
 *           example:
 *             name: "TechCorp Advanced Solutions"
 *             description: "Leading advanced technology solutions provider"
 *             partnerType: "TECHNOLOGY"
 *             services: ["AI Consulting", "Cloud Development", "24/7 Support"]
 *     responses:
 *       200:
 *         description: Partner updated successfully
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
 *                       example: "TechCorp Advanced Solutions"
 *                     email:
 *                       type: string
 *                       example: "contact@techcorp.com"
 *                     description:
 *                       type: string
 *                       example: "Leading advanced technology solutions provider"
 *                     partnerType:
 *                       type: string
 *                       example: "TECHNOLOGY"
 *                     services:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["AI Consulting", "Cloud Development", "24/7 Support"]
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-15T14:00:00.000Z"
 *                 message:
 *                   type: string
 *                   description: Success message
 *                   example: "Partner updated successfully"
 *       400:
 *         description: Invalid partner ID or validation error
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
 *                   example: "Invalid partner ID"
 *       404:
 *         description: Partner not found or update failed
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
 *                   example: "Partner not found or update failed"
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
 *                   example: "Failed to update partner"
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
        { success: false, error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    const body = await request.json();

    const partner = await partnerService.updatePartner(id, body);

    if (!partner) {
      return NextResponse.json(
        { success: false, error: 'Partner not found or update failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: partner,
      message: 'Partner updated successfully'
    });

  } catch (error) {
    console.error('Error updating partner:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update partner'
      },
      { status: 400 }
    );
  }
}

/**
 * @openapi
 * /partners/{id}:
 *   delete:
 *     summary: Delete Partner
 *     description: Delete a partner permanently
 *     tags:
 *       - Partners
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Partner unique ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Partner deleted successfully
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
 *                   description: Success message
 *                   example: "Partner deleted successfully"
 *       400:
 *         description: Invalid partner ID
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
 *                   example: "Invalid partner ID"
 *       404:
 *         description: Partner not found or deletion failed
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
 *                   example: "Partner not found or deletion failed"
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
 *                   example: "Failed to delete partner"
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
        { success: false, error: 'Invalid partner ID' },
        { status: 400 }
      );
    }

    const deleted = await partnerService.deletePartner(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Partner not found or deletion failed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Partner deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting partner:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete partner'
      },
      { status: 500 }
    );
  }
}
