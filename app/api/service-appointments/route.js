/**
 * @swagger
 * /api/service-appointments:
 *   get:
 *     summary: Get all service appointments
 *     tags: [Service Appointments]
 *   post:
 *     summary: Schedule a new service appointment
 *     tags: [Service Appointments]
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sanitizeInput } from '@/lib/validation';

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const advisorId = searchParams.get('advisor_id') || '';
    const startDate = searchParams.get('start_date') || '';
    const endDate = searchParams.get('end_date') || '';

    let queryText = `
      SELECT sa.*, c.name as customer_name, u.name as advisor_name 
      FROM service_appointments sa 
      LEFT JOIN customers c ON sa.customer_id = c.id 
      LEFT JOIN users u ON sa.advisor_id = u.id 
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND sa.status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    if (advisorId) {
      queryText += ` AND sa.advisor_id = $${paramCount}`;
      queryParams.push(advisorId);
      paramCount++;
    }

    if (startDate && endDate) {
      queryText += ` AND sa.appointment_date BETWEEN $${paramCount} AND $${paramCount + 1}`;
      queryParams.push(startDate, endDate);
      paramCount += 2;
    }

    queryText += ' ORDER BY sa.appointment_date ASC';

    const result = await query(queryText, queryParams);

    return NextResponse.json({
      success: true,
      data: { appointments: result.rows }
    });
  } catch (error) {
    console.error('Get service appointments error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service appointments' },
      { status: 500 }
    );
  }
}

async function postHandler(request) {
  try {
    const body = await request.json();
    const { customer_id, vehicle_vin, appointment_date, service_type, advisor_id, status, notes } = body;

    if (!customer_id || !vehicle_vin || !appointment_date || !service_type || !advisor_id) {
      return NextResponse.json(
        { success: false, error: 'Customer ID, vehicle VIN, appointment date, service type, and advisor ID are required' },
        { status: 400 }
      );
    }

    const conflictCheck = await query(
      `SELECT id FROM service_appointments 
       WHERE advisor_id = $1 
       AND appointment_date = $2 
       AND status NOT IN ('Cancelled', 'Completed')`,
      [advisor_id, appointment_date]
    );

    if (conflictCheck.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Advisor is already booked for this time slot' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO service_appointments 
       (customer_id, vehicle_vin, appointment_date, service_type, advisor_id, status, notes, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
       RETURNING *`,
      [
        customer_id,
        sanitizeInput(vehicle_vin),
        appointment_date,
        sanitizeInput(service_type),
        advisor_id,
        status || 'Scheduled',
        sanitizeInput(notes || '')
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: { appointment: result.rows[0] },
        message: 'Service appointment scheduled successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create service appointment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to schedule service appointment' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);
export const POST = requireAuth(postHandler);