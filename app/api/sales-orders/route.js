/**
 * @swagger
 * /api/sales-orders:
 *   get:
 *     summary: Get all sales orders
 *     tags: [Sales Orders]
 *   post:
 *     summary: Create a new sales order
 *     tags: [Sales Orders]
 */
import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    let queryText = `
      SELECT so.*, c.name as customer_name, v.make, v.model, v.year, u.name as sales_rep_name 
      FROM sales_orders so 
      LEFT JOIN customers c ON so.customer_id = c.id 
      LEFT JOIN vehicles v ON so.vehicle_id = v.id 
      LEFT JOIN users u ON so.sales_rep_id = u.id 
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND so.status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    queryText += ' ORDER BY so.order_date DESC';

    const result = await query(queryText, queryParams);

    return NextResponse.json({
      success: true,
      data: { salesOrders: result.rows }
    });
  } catch (error) {
    console.error('Get sales orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sales orders' },
      { status: 500 }
    );
  }
}

async function postHandler(request) {
  try {
    const body = await request.json();
    const { customer_id, vehicle_id, sales_rep_id, total_amount, status, payment_status } = body;

    if (!customer_id || !vehicle_id || !sales_rep_id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID, vehicle ID, and sales rep ID are required' },
        { status: 400 }
      );
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const orderNumber = `SO-${Date.now()}`;

      const orderResult = await client.query(
        `INSERT INTO sales_orders (order_number, customer_id, vehicle_id, sales_rep_id, order_date, total_amount, status, payment_status, created_at) 
         VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, NOW()) 
         RETURNING *`,
        [orderNumber, customer_id, vehicle_id, sales_rep_id, total_amount || 0, status || 'Pending', payment_status || 'Pending']
      );

      await client.query(
        `UPDATE vehicles SET status = 'Reserved' WHERE id = $1`,
        [vehicle_id]
      );

      await client.query('COMMIT');

      return NextResponse.json(
        {
          success: true,
          data: { salesOrder: orderResult.rows[0] },
          message: 'Sales order created successfully'
        },
        { status: 201 }
      );
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create sales order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create sales order' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);
export const POST = requireAuth(postHandler);