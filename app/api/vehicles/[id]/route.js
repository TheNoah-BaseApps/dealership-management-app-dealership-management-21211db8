/**
 * @swagger
 * /api/vehicles/{id}:
 *   put:
 *     summary: Update vehicle
 *     tags: [Vehicles]
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

async function putHandler(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, price, sold_date } = body;

    const soldDateValue = status === 'Sold' && !sold_date ? 'NOW()' : sold_date ? `'${sold_date}'` : 'sold_date';

    const result = await query(
      `UPDATE vehicles 
       SET status = COALESCE($1, status),
           price = COALESCE($2, price),
           sold_date = ${soldDateValue}
       WHERE id = $3
       RETURNING *`,
      [status, price, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Vehicle not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { vehicle: result.rows[0] },
      message: 'Vehicle updated successfully'
    });
  } catch (error) {
    console.error('Update vehicle error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update vehicle' },
      { status: 500 }
    );
  }
}

export const PUT = requireAuth(putHandler);