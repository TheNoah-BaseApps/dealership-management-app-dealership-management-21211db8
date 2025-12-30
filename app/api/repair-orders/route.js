/**
 * @swagger
 * /api/repair-orders:
 *   get:
 *     summary: Get all repair orders
 *     tags: [Repair Orders]
 *   post:
 *     summary: Create a new repair order
 *     tags: [Repair Orders]
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sanitizeInput } from '@/lib/validation';

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    let queryText = `
      SELECT ro.*, c.name as customer_name, u.name as advisor_name 
      FROM repair_orders ro 
      LEFT JOIN customers c ON ro.customer_id = c.id 
      LEFT JOIN users u ON ro.service_advisor_id = u.id 
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND ro.status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    queryText += ' ORDER BY ro.scheduled_date DESC';

    const result = await query(queryText, queryParams);

    return NextResponse.json({
      success: true,
      data: { repairOrders: result.rows }
    });
  } catch (error) {
    console.error('Get repair orders error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch repair orders' },
      { status: 500 }
    );
  }
}

async function postHandler(request) {
  try {
    const body = await request.json();
    const { customer_id, vehicle_vin, service_advisor_id, scheduled_date, labor_cost, parts_cost, status, notes } = body;

    if (!customer_id || !vehicle_vin || !service_advisor_id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID, vehicle VIN, and service advisor ID are required' },
        { status: 400 }
      );
    }

    const roNumber = `RO-${Date.now()}`;
    const totalCost = (parseFloat(labor_cost) || 0) + (parseFloat(parts_cost) || 0);

    const result = await query(
      `INSERT INTO repair_orders 
       (ro_number, customer_id, vehicle_vin, service_advisor_id, scheduled_date, labor_cost, parts_cost, total_cost, status, notes, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW()) 
       RETURNING *`,
      [
        roNumber,
        customer_id,
        sanitizeInput(vehicle_vin),
        service_advisor_id,
        scheduled_date || null,
        labor_cost || 0,
        parts_cost || 0,
        totalCost,
        status || 'Pending',
        sanitizeInput(notes || '')
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: { repairOrder: result.rows[0] },
        message: 'Repair order created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create repair order error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create repair order' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);
export const POST = requireAuth(postHandler);