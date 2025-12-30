/**
 * @swagger
 * /api/parts/{id}:
 *   put:
 *     summary: Update part inventory
 *     tags: [Parts]
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

async function putHandler(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { quantity, unit_price, reorder_level } = body;

    const result = await query(
      `UPDATE parts 
       SET quantity = COALESCE($1, quantity),
           unit_price = COALESCE($2, unit_price),
           reorder_level = COALESCE($3, reorder_level)
       WHERE id = $4
       RETURNING *`,
      [quantity, unit_price, reorder_level, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Part not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { part: result.rows[0] },
      message: 'Part updated successfully'
    });
  } catch (error) {
    console.error('Update part error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update part' },
      { status: 500 }
    );
  }
}

export const PUT = requireAuth(putHandler);