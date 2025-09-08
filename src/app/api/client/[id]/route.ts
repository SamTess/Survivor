import { NextResponse } from "next/server";
import { userService } from "../../../../composition/container";

/**
 * @api {get} /client/:id Get User by ID
 * @apiName GetUserById
 * @apiGroup Client
 * @apiVersion 0.1.0
 * @apiDescription Get user information by user ID (public client endpoint)
 *
 * @apiParam {Number} id User ID
 *
 * @apiSuccess {Object} user User object
 * @apiSuccess {Number} user.id User ID
 * @apiSuccess {String} user.name User's name
 * @apiSuccess {String} user.email User's email
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "id": 1,
 *       "name": "John Doe",
 *       "email": "john@example.com"
 *     }
 *
 * @apiError (Error 404) {String} error User not found
 * @apiError (Error 400) {String} error Invalid request
 *
 * @apiErrorExample {json} Error-Response:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "Not found"
 *     }
 */
export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const user = await userService.getUserById(Number(id));
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}