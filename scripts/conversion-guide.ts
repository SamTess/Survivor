#!/usr/bin/env tsx

console.log(`
🔄 Converting from apidoc to OpenAPI/Swagger format

Here's how to update your existing comments:

BEFORE (apidoc format):
/**
 * @api {post} /auth/logout User Logout
 * @apiName LogoutUser
 * @apiGroup Authentication
 * @apiVersion 0.1.0
 * @apiDescription Log out a user by clearing the authentication cookie
 *
 * @apiSuccess {Boolean} ok Success status
 *
 * @apiSuccessExample {json} Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "ok": true
 *     }
 */

AFTER (OpenAPI/Swagger format):
/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: User Logout
 *     description: Log out a user by clearing the authentication cookie
 *     tags:
 *       - Authentication
 *     responses:
 *       200:
 *         description: Successful logout
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 */

KEY CHANGES:
1. Replace @api with @swagger
2. Use YAML-like structure for path and method
3. Replace @apiGroup with tags array
4. Replace @apiSuccess with responses object
5. Use schema definitions for data structures

For endpoints with parameters:
- @apiParam becomes parameters array
- @apiBody becomes requestBody

Example with parameters:
/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: User Registration
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: user@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: User created successfully
 */

🚀 To get started:
1. Run 'npm run docs:generate' to create initial documentation
2. Update your API comments using the format above
3. Run 'npm run docs:dev' to watch for changes and serve docs
4. Visit http://localhost:8080 to see your documentation

Happy documenting! 📚
`);
