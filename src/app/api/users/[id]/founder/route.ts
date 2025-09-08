import { NextRequest, NextResponse } from 'next/server';
import { FounderService } from '../../../../../application/services/founders/FounderService';
import { FounderRepositoryPrisma } from '../../../../../infrastructure/persistence/prisma/FounderRepositoryPrisma';

const founderRepository = new FounderRepositoryPrisma();
const founderService = new FounderService(founderRepository);

/**
 * @api {get} /users/:id/founder Get User's Founder Profiles
 * @apiName GetUserFounders
 * @apiGroup Users
 * @apiVersion 0.1.0
 * @apiDescription Retrieve all founder profiles associated with a specific user
 *
 * @apiParam {Number} id User unique ID
 *
 * @apiSuccess {Boolean} success Operation success status
 * @apiSuccess {Object[]} data Array of founder profile objects
 * @apiSuccess {Number} data.id Founder profile ID
 * @apiSuccess {Number} data.userId Associated user ID
 * @apiSuccess {String} data.name Founder name
 * @apiSuccess {String} data.role Founder role/position
 * @apiSuccess {String} data.bio Founder biography
 * @apiSuccess {String} data.expertise Areas of expertise
 * @apiSuccess {String} data.experience Previous experience
 * @apiSuccess {String} data.linkedin LinkedIn profile URL
 * @apiSuccess {String} data.twitter Twitter profile URL
 * @apiSuccess {String} data.createdAt Creation timestamp
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "success": true,
 *       "data": [
 *         {
 *           "id": 1,
 *           "userId": 5,
 *           "name": "John Doe",
 *           "role": "CEO & Founder",
 *           "bio": "Experienced entrepreneur with 10+ years in tech",
 *           "expertise": "Product Development, Team Leadership",
 *           "experience": "Former CTO at TechCorp, Founded 2 previous startups",
 *           "linkedin": "https://linkedin.com/in/johndoe",
 *           "twitter": "https://twitter.com/johndoe",
 *           "createdAt": "2024-01-01T00:00:00.000Z"
 *         }
 *       ]
 *     }
 *
 * @apiError (Error 400) {Boolean} success False
 * @apiError (Error 400) {String} error Invalid user ID
 * @apiError (Error 404) {Boolean} success False
 * @apiError (Error 404) {String} error No founders found for this user
 * @apiError (Error 500) {Boolean} success False
 * @apiError (Error 500) {String} error Internal server error
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "success": false,
 *       "error": "No founders found for this user"
 *     }
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

    const founders = await founderService.getFoundersByUserId(userId);

    if (!founders || founders.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No founders found for this user' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: founders });

  } catch (error) {
    console.error('Error fetching founders by user ID:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch founders'
      },
      { status: 500 }
    );
  }
}
