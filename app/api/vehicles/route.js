/**
 * @swagger
 * /api/vehicles:
 *   get:
 *     summary: Get all vehicles
 *     tags: [Vehicles]
 *   post:
 *     summary: Add a new vehicle
 *     tags: [Vehicles]
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { validateVIN, sanitizeInput } from '@/lib/validation';

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const make = searchParams.get('make') || '';
    const model = searchParams.get('model') || '';

    let queryText = 'SELECT * FROM vehicles WHERE 1=1';
    const queryParams = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    if (make) {
      queryText += ` AND make ILIKE $${paramCount}`;
      queryParams.push(`%${make}%`);
      paramCount++;
    }

    if (model) {
      queryText += ` AND model ILIKE $${paramCount}`;
      queryParams.push(`%${model}%`);
      paramCount++;
    }

    queryText += ' ORDER BY created_at DESC';

    const result = await query(queryText, queryParams);

    return NextResponse.json({
      success: true,
      data: { vehicles: result.rows }
    });
  } catch (error) {
    console.error('Get vehicles error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch vehicles' },
      { status: 500 }
    );
  }
}

async function postHandler(request) {
  try {
    const body = await request.json();
    const { vin, make, model, year, color, status, price, cost, purchase_date } = body;

    if (!vin || !make || !model || !year) {
      return NextResponse.json(
        { success: false, error: 'VIN, make, model, and year are required' },
        { status: 400 }
      );
    }

    if (!validateVIN(vin)) {
      return NextResponse.json(
        { success: false, error: 'Invalid VIN format' },
        { status: 400 }
      );
    }

    const existingVehicle = await query('SELECT id FROM vehicles WHERE vin = $1', [vin]);
    if (existingVehicle.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Vehicle with this VIN already exists' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO vehicles (vin, make, model, year, color, status, price, cost, purchase_date, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW()) 
       RETURNING *`,
      [
        vin.toUpperCase(),
        sanitizeInput(make),
        sanitizeInput(model),
        year,
        sanitizeInput(color || ''),
        status || 'Available',
        price || 0,
        cost || 0,
        purchase_date || null
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: { vehicle: result.rows[0] },
        message: 'Vehicle added successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create vehicle error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add vehicle' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);
export const POST = requireAuth(postHandler);