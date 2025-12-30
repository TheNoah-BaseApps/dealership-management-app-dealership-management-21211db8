/**
 * @swagger
 * /api/customer-engagements/{id}:
 *   put:
 *     summary: Update customer engagement
 *     tags: [Customer Engagements]
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sanitizeInput } from '@/lib/validation';

async function putHandler(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { response_received, reward_points, engagement_outcome, follow_up_needed, next_engagement_date } = body;

    const result = await query(
      `UPDATE customer_engagements 
       SET response_received = COALESCE($1, response_received),
           reward_points = COALESCE($2, reward_points),
           engagement_outcome = COALESCE($3, engagement_outcome),
           follow_up_needed = COALESCE($4, follow_up_needed),
           next_engagement_date = COALESCE($5, next_engagement_date)
       WHERE id = $6
       RETURNING *`,
      [
        response_received,
        reward_points,
        engagement_outcome ? sanitizeInput(engagement_outcome) : null,
        follow_up_needed,
        next_engagement_date,
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer engagement not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { engagement: result.rows[0] },
      message: 'Customer engagement updated successfully'
    });
  } catch (error) {
    console.error('Update customer engagement error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update customer engagement' },
      { status: 500 }
    );
  }
}

export const PUT = requireAuth(putHandler);