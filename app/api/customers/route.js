/**
 * @swagger
 * /api/customers:
 *   get:
 *     summary: Get all customers
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *   post:
 *     summary: Create a new customer
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { validateEmail, validatePhone, sanitizeInput } from '@/lib/validation';

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const customerType = searchParams.get('customer_type') || '';
    const limit = parseInt(searchParams.get('limit')) || 50;
    const offset = parseInt(searchParams.get('offset')) || 0;

    let queryText = `
      SELECT c.*, u.name as sales_rep_name 
      FROM customers c 
      LEFT JOIN users u ON c.assigned_sales_rep = u.id 
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 1;

    if (search) {
      queryText += ` AND (c.name ILIKE $${paramCount} OR c.email ILIKE $${paramCount} OR c.phone ILIKE $${paramCount})`;
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    if (customerType) {
      queryText += ` AND c.customer_type = $${paramCount}`;
      queryParams.push(customerType);
      paramCount++;
    }

    queryText += ` ORDER BY c.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    queryParams.push(limit, offset);

    const result = await query(queryText, queryParams);

    const countResult = await query('SELECT COUNT(*) FROM customers');
    const total = parseInt(countResult.rows[0].count);

    return NextResponse.json({
      success: true,
      data: {
        customers: result.rows,
        total,
        limit,
        offset
      }
    });
  } catch (error) {
    console.error('Get customers error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customers' },
      { status: 500 }
    );
  }
}

async function postHandler(request) {
  try {
    const body = await request.json();
    const { name, email, phone, address, customer_type, assigned_sales_rep } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, error: 'Name and email are required' },
        { status: 400 }
      );
    }

    if (!validateEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email format' },
        { status: 400 }
      );
    }

    if (phone && !validatePhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone format' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO customers (name, email, phone, address, customer_type, assigned_sales_rep, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW()) 
       RETURNING *`,
      [
        sanitizeInput(name),
        email.toLowerCase(),
        sanitizeInput(phone || ''),
        sanitizeInput(address || ''),
        customer_type || 'Individual',
        assigned_sales_rep || null
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: { customer: result.rows[0] },
        message: 'Customer created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create customer error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);
export const POST = requireAuth(postHandler);