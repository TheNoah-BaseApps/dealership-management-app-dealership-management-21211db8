/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

async function handler(request) {
  try {
    return NextResponse.json({
      success: true,
      data: {
        user: request.user
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get profile' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(handler);