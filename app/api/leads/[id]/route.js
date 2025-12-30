/**
 * @swagger
 * /api/leads/{id}:
 *   put:
 *     summary: Update lead
 *     tags: [Leads]
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sanitizeInput } from '@/lib/validation';

async function putHandler(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, interest_type, assigned_to } = body;

    const convertedAt = status === 'Converted' ? 'NOW()' : 'converted_at';

    const result = await query(
      `UPDATE leads 
       SET status = COALESCE($1, status),
           interest_type = COALESCE($2, interest_type),
           assigned_to = COALESCE($3, assigned_to),
           converted_at = ${convertedAt}
       WHERE id = $4
       RETURNING *`,
      [status, interest_type ? sanitizeInput(interest_type) : null, assigned_to, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { lead: result.rows[0] },
      message: 'Lead updated successfully'
    });
  } catch (error) {
    console.error('Update lead error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update lead' },
      { status: 500 }
    );
  }
}

export const PUT = requireAuth(putHandler);