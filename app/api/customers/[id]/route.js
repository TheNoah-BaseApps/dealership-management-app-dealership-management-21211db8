/**
 * @swagger
 * /api/customers/{id}:
 *   get:
 *     summary: Get customer by ID
 *     tags: [Customers]
 *   put:
 *     summary: Update customer
 *     tags: [Customers]
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { validateEmail, validatePhone, sanitizeInput } from '@/lib/validation';

async function getHandler(request, { params }) {
  try {
    const { id } = params;

    const result = await query(
      `SELECT c.*, u.name as sales_rep_name 
       FROM customers c 
       LEFT JOIN users u ON c.assigned_sales_rep = u.id 
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { customer: result.rows[0] }
    });
  } catch (error) {
    console.error('Get customer error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer' },
      { status: 500 }
    );
  }
}

async function putHandler(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { name, email, phone, address, customer_type, assigned_sales_rep } = body;

    if (email && !validateEmail(email)) {
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
      `UPDATE customers 
       SET name = COALESCE($1, name),
           email = COALESCE($2, email),
           phone = COALESCE($3, phone),
           address = COALESCE($4, address),
           customer_type = COALESCE($5, customer_type),
           assigned_sales_rep = COALESCE($6, assigned_sales_rep),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        name ? sanitizeInput(name) : null,
        email ? email.toLowerCase() : null,
        phone ? sanitizeInput(phone) : null,
        address ? sanitizeInput(address) : null,
        customer_type,
        assigned_sales_rep,
        id
      ]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { customer: result.rows[0] },
      message: 'Customer updated successfully'
    });
  } catch (error) {
    console.error('Update customer error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);
export const PUT = requireAuth(putHandler);