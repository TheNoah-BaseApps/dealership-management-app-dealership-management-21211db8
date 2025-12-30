/**
 * @swagger
 * /api/communications:
 *   get:
 *     summary: Get all communications
 *     tags: [Communications]
 *   post:
 *     summary: Log a new communication
 *     tags: [Communications]
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sanitizeInput } from '@/lib/validation';

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id') || '';
    const channel = searchParams.get('channel') || '';

    let queryText = `
      SELECT co.*, c.name as customer_name, u.name as user_name 
      FROM communications co 
      LEFT JOIN customers c ON co.customer_id = c.id 
      LEFT JOIN users u ON co.user_id = u.id 
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 1;

    if (customerId) {
      queryText += ` AND co.customer_id = $${paramCount}`;
      queryParams.push(customerId);
      paramCount++;
    }

    if (channel) {
      queryText += ` AND co.channel = $${paramCount}`;
      queryParams.push(channel);
      paramCount++;
    }

    queryText += ' ORDER BY co.sent_at DESC';

    const result = await query(queryText, queryParams);

    return NextResponse.json({
      success: true,
      data: { communications: result.rows }
    });
  } catch (error) {
    console.error('Get communications error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch communications' },
      { status: 500 }
    );
  }
}

async function postHandler(request) {
  try {
    const body = await request.json();
    const { customer_id, user_id, type, channel, subject, content } = body;

    if (!customer_id || !user_id || !type || !channel || !content) {
      return NextResponse.json(
        { success: false, error: 'Customer ID, user ID, type, channel, and content are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO communications 
       (customer_id, user_id, type, channel, subject, content, sent_at, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
       RETURNING *`,
      [
        customer_id,
        user_id,
        sanitizeInput(type),
        sanitizeInput(channel),
        sanitizeInput(subject || ''),
        sanitizeInput(content)
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: { communication: result.rows[0] },
        message: 'Communication logged successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create communication error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to log communication' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);
export const POST = requireAuth(postHandler);