/**
 * @swagger
 * /api/invoices:
 *   get:
 *     summary: Get all invoices
 *     tags: [Invoices]
 *   post:
 *     summary: Generate a new invoice
 *     tags: [Invoices]
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const customerId = searchParams.get('customer_id') || '';

    let queryText = `
      SELECT i.*, c.name as customer_name, c.email as customer_email 
      FROM invoices i 
      LEFT JOIN customers c ON i.customer_id = c.id 
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND i.status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    if (customerId) {
      queryText += ` AND i.customer_id = $${paramCount}`;
      queryParams.push(customerId);
      paramCount++;
    }

    queryText += ' ORDER BY i.invoice_date DESC';

    const result = await query(queryText, queryParams);

    return NextResponse.json({
      success: true,
      data: { invoices: result.rows }
    });
  } catch (error) {
    console.error('Get invoices error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch invoices' },
      { status: 500 }
    );
  }
}

async function postHandler(request) {
  try {
    const body = await request.json();
    const { customer_id, related_order_id, order_type, total_amount, due_date } = body;

    if (!customer_id || !related_order_id || !order_type || !total_amount) {
      return NextResponse.json(
        { success: false, error: 'Customer ID, related order ID, order type, and total amount are required' },
        { status: 400 }
      );
    }

    const invoiceNumber = `INV-${Date.now()}`;

    const result = await query(
      `INSERT INTO invoices 
       (invoice_number, customer_id, related_order_id, order_type, invoice_date, due_date, total_amount, paid_amount, status, created_at) 
       VALUES ($1, $2, $3, $4, NOW(), $5, $6, 0, 'Pending', NOW()) 
       RETURNING *`,
      [invoiceNumber, customer_id, related_order_id, order_type, due_date || null, total_amount]
    );

    return NextResponse.json(
      {
        success: true,
        data: { invoice: result.rows[0] },
        message: 'Invoice generated successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create invoice error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate invoice' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);
export const POST = requireAuth(postHandler);