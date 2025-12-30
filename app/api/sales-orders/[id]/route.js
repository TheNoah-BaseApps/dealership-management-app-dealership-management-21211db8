/**
 * @swagger
 * /api/sales-orders/{id}:
 *   put:
 *     summary: Update sales order
 *     tags: [Sales Orders]
 */
import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

async function putHandler(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, payment_status } = body;

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const orderResult = await client.query(
        `UPDATE sales_orders 
         SET status = COALESCE($1, status),
             payment_status = COALESCE($2, payment_status)
         WHERE id = $3
         RETURNING *`,
        [status, payment_status, id]
      );

      if (orderResult.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { success: false, error: 'Sales order not found' },
          { status: 404 }
        );
      }

      const order = orderResult.rows[0];

      if (status === 'Completed' && order.vehicle_id) {
        await client.query(
          `UPDATE vehicles SET status = 'Sold', sold_date = NOW() WHERE id = $1`,
          [order.vehicle_id]
        );
      }

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        data: { salesOrder: order },
        message: 'Sales order updated successfully'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update sales order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update sales order' },
      { status: 500 }
    );
  }
}

export const PUT = requireAuth(putHandler);