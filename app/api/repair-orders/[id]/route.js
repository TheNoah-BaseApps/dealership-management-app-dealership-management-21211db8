/**
 * @swagger
 * /api/repair-orders/{id}:
 *   put:
 *     summary: Update repair order
 *     tags: [Repair Orders]
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sanitizeInput } from '@/lib/validation';

async function putHandler(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, labor_cost, parts_cost, notes } = body;

    let totalCost = null;
    if (labor_cost !== undefined || parts_cost !== undefined) {
      const currentOrder = await query('SELECT labor_cost, parts_cost FROM repair_orders WHERE id = $1', [id]);
      if (currentOrder.rows.length > 0) {
        const currentLabor = parseFloat(currentOrder.rows[0].labor_cost) || 0;
        const currentParts = parseFloat(currentOrder.rows[0].parts_cost) || 0;
        totalCost = (parseFloat(labor_cost) || currentLabor) + (parseFloat(parts_cost) || currentParts);
      }
    }

    const completionDate = status === 'Completed' ? 'NOW()' : 'completion_date';

    const result = await query(
      `UPDATE repair_orders 
       SET status = COALESCE($1, status),
           labor_cost = COALESCE($2, labor_cost),
           parts_cost = COALESCE($3, parts_cost),
           total_cost = COALESCE($4, total_cost),
           notes = COALESCE($5, notes),
           completion_date = ${completionDate}
       WHERE id = $6
       RETURNING *`,
      [status, labor_cost, parts_cost, totalCost, notes ? sanitizeInput(notes) : null, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Repair order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { repairOrder: result.rows[0] },
      message: 'Repair order updated successfully'
    });
  } catch (error) {
    console.error('Update repair order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update repair order' },
      { status: 500 }
    );
  }
}

export const PUT = requireAuth(putHandler);