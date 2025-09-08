import { NextRequest, NextResponse } from 'next/server';
import { PartnerService } from '../../../../application/services/partners/PartnerService';
import { PartnerRepositoryPrisma } from '../../../../infrastructure/persistence/prisma/PartnerRepositoryPrisma';

const partnerRepository = new PartnerRepositoryPrisma();
const partnerService = new PartnerService(partnerRepository);

/**
 * @api {get} /partners/:id Get Partner by ID
 * @apiName GetPartnerById
 * @apiGroup Partners
 * @apiVersion 0.1.0
 * @apiDescription Retrieve a specific partner by their ID
 *
 * @apiParam {Number} id Partner unique ID
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object} data Partner object
 * @apiSuccess {Number} data.id Partner ID
 * @apiSuccess {String} data.name Partner name
 * @apiSuccess {String} data.email Partner email
 * @apiSuccess {String} data.companyName Company name
 * @apiSuccess {String} data.partnerType Partner type (STRATEGIC, TECHNOLOGY, VENDOR, etc.)
 * @apiSuccess {String} data.industry Industry sector
 * @apiSuccess {String} data.description Partner description
 * @apiSuccess {String} data.website Website URL
 * @apiSuccess {String} data.contactPerson Contact person name
 * @apiSuccess {String} data.phone Contact phone number
 * @apiSuccess {String[]} data.services Services offered
 * @apiSuccess {String} data.createdAt Creation timestamp
 * @apiSuccess {String} data.updatedAt Last update timestamp
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 1,
 *         "name": "TechCorp Solutions",
 *         "email": "contact@techcorp.com",
 *         "companyName": "TechCorp Inc.",
 *         "partnerType": "STRATEGIC",
 *         "industry": "Technology",
 *         "description": "Leading technology solutions provider",
 *         "website": "https://techcorp.com",
 *         "contactPerson": "John Manager",
 *         "phone": "+1-555-0123",
 *         "services": ["Consulting", "Development", "Support"],
 *         "createdAt": "2024-01-01T00:00:00.000Z",
 *         "updatedAt": "2024-01-15T12:00:00.000Z"
 *       }
 *     }
 *
 * @apiError (Error 400) {Boolean} success False
 * @apiError (Error 400) {String} error Invalid partner ID
 * @apiError (Error 404) {Boolean} success False
 * @apiError (Error 404) {String} error Partner not found
 * @apiError (Error 500) {Boolean} success False
 * @apiError (Error 500) {String} error Internal server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "Partner not found"
 *     }
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
 * @api {put} /partners/:id Update Partner
 * @apiName UpdatePartner
 * @apiGroup Partners
 * @apiVersion 0.1.0
 * @apiDescription Update an existing partner's information
 *
 * @apiParam {Number} id Partner unique ID
 * @apiParam {String} [name] Partner name
 * @apiParam {String} [email] Partner email
 * @apiParam {String} [companyName] Company name
 * @apiParam {String} [partnerType] Partner type (STRATEGIC, TECHNOLOGY, VENDOR, etc.)
 * @apiParam {String} [industry] Industry sector
 * @apiParam {String} [description] Partner description
 * @apiParam {String} [website] Website URL
 * @apiParam {String} [contactPerson] Contact person name
 * @apiParam {String} [phone] Contact phone number
 * @apiParam {String[]} [services] Services offered
 *
 * @apiParamExample {json} Request-Example:
 *     {
 *       "name": "TechCorp Advanced Solutions",
 *       "description": "Leading advanced technology solutions provider",
 *       "partnerType": "TECHNOLOGY",
 *       "services": ["AI Consulting", "Cloud Development", "24/7 Support"]
 *     }
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object} data Updated partner object
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": {
 *         "id": 1,
 *         "name": "TechCorp Advanced Solutions",
 *         "email": "contact@techcorp.com",
 *         "description": "Leading advanced technology solutions provider",
 *         "partnerType": "TECHNOLOGY",
 *         "services": ["AI Consulting", "Cloud Development", "24/7 Support"],
 *         "updatedAt": "2024-01-15T14:00:00.000Z"
 *       },
 *       "message": "Partner updated successfully"
 *     }
 *
 * @apiError (Error 400) {Boolean} success False
 * @apiError (Error 400) {String} error Invalid partner ID or validation error
 * @apiError (Error 404) {Boolean} success False
 * @apiError (Error 404) {String} error Partner not found or update failed
 * @apiError (Error 500) {Boolean} success False
 * @apiError (Error 500) {String} error Internal server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "Partner not found or update failed"
 *     }
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
 * @api {delete} /partners/:id Delete Partner
 * @apiName DeletePartner
 * @apiGroup Partners
 * @apiVersion 0.1.0
 * @apiDescription Delete a partner permanently
 *
 * @apiParam {Number} id Partner unique ID
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {String} message Success message
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "message": "Partner deleted successfully"
 *     }
 *
 * @apiError (Error 400) {Boolean} success False
 * @apiError (Error 400) {String} error Invalid partner ID
 * @apiError (Error 404) {Boolean} success False
 * @apiError (Error 404) {String} error Partner not found or deletion failed
 * @apiError (Error 500) {Boolean} success False
 * @apiError (Error 500) {String} error Internal server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "Partner not found or deletion failed"
 *     }
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
