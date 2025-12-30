/**
 * @swagger
 * /api/parts:
 *   get:
 *     summary: Get all parts
 *     tags: [Parts]
 *   post:
 *     summary: Add a new part
 *     tags: [Parts]
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sanitizeInput } from '@/lib/validation';

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || '';
    const lowStock = searchParams.get('low_stock') === 'true';

    let queryText = 'SELECT * FROM parts WHERE 1=1';
    const queryParams = [];
    let paramCount = 1;

    if (category) {
      queryText += ` AND category = $${paramCount}`;
      queryParams.push(category);
      paramCount++;
    }

    if (lowStock) {
      queryText += ' AND quantity <= reorder_level';
    }

    queryText += ' ORDER BY name ASC';

    const result = await query(queryText, queryParams);

    return NextResponse.json({
      success: true,
      data: { parts: result.rows }
    });
  } catch (error) {
    console.error('Get parts error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch parts' },
      { status: 500 }
    );
  }
}

async function postHandler(request) {
  try {
    const body = await request.json();
    const { part_number, name, category, quantity, unit_price, reorder_level, supplier_id } = body;

    if (!part_number || !name || !category) {
      return NextResponse.json(
        { success: false, error: 'Part number, name, and category are required' },
        { status: 400 }
      );
    }

    const existingPart = await query('SELECT id FROM parts WHERE part_number = $1', [part_number]);
    if (existingPart.rows.length > 0) {
      return NextResponse.json(
        { success: false, error: 'Part with this part number already exists' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO parts (part_number, name, category, quantity, unit_price, reorder_level, supplier_id, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW()) 
       RETURNING *`,
      [
        sanitizeInput(part_number),
        sanitizeInput(name),
        sanitizeInput(category),
        quantity || 0,
        unit_price || 0,
        reorder_level || 10,
        supplier_id || null
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: { part: result.rows[0] },
        message: 'Part added successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create part error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add part' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);
export const POST = requireAuth(postHandler);