import { NextResponse } from "next/server";
import { userService } from "../../../../composition/container";

/**
 * @openapi
 * /client/{id}:
 *   get:
 *     summary: Get User by ID
 *     description: Get user information by user ID (public client endpoint)
 *     tags:
 *       - Client
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: User ID
 *         example: 1
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   description: User ID
 *                   example: 1
 *                 name:
 *                   type: string
 *                   description: User's name
 *                   example: "John Doe"
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: User's email
 *                   example: "john@example.com"
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Invalid request"
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Not found"
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