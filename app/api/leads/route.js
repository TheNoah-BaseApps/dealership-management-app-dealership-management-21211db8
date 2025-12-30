/**
 * @swagger
 * /api/leads:
 *   get:
 *     summary: Get all leads
 *     tags: [Leads]
 *   post:
 *     summary: Create a new lead
 *     tags: [Leads]
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sanitizeInput } from '@/lib/validation';

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const assignedTo = searchParams.get('assigned_to') || '';

    let queryText = `
      SELECT l.*, c.name as customer_name, c.email as customer_email, u.name as assigned_to_name 
      FROM leads l 
      LEFT JOIN customers c ON l.customer_id = c.id 
      LEFT JOIN users u ON l.assigned_to = u.id 
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND l.status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    if (assignedTo) {
      queryText += ` AND l.assigned_to = $${paramCount}`;
      queryParams.push(assignedTo);
      paramCount++;
    }

    queryText += ' ORDER BY l.created_at DESC';

    const result = await query(queryText, queryParams);

    return NextResponse.json({
      success: true,
      data: { leads: result.rows }
    });
  } catch (error) {
    console.error('Get leads error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

async function postHandler(request) {
  try {
    const body = await request.json();
    const { customer_id, source, status, interest_type, assigned_to } = body;

    if (!customer_id || !source) {
      return NextResponse.json(
        { success: false, error: 'Customer ID and source are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO leads (customer_id, source, status, interest_type, assigned_to, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING *`,
      [
        customer_id,
        sanitizeInput(source),
        status || 'New',
        sanitizeInput(interest_type || ''),
        assigned_to || null
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: { lead: result.rows[0] },
        message: 'Lead created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create lead error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create lead' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);
export const POST = requireAuth(postHandler);