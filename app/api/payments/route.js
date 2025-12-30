/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payments
 *     tags: [Payments]
 *   post:
 *     summary: Record a new payment
 *     tags: [Payments]
 */
import { NextResponse } from 'next/server';
import { query, getClient } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { validatePaymentMethod, sanitizeInput } from '@/lib/validation';

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const invoiceId = searchParams.get('invoice_id') || '';

    let queryText = `
      SELECT p.*, i.invoice_number, i.customer_id, c.name as customer_name 
      FROM payments p 
      LEFT JOIN invoices i ON p.invoice_id = i.id 
      LEFT JOIN customers c ON i.customer_id = c.id 
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 1;

    if (invoiceId) {
      queryText += ` AND p.invoice_id = $${paramCount}`;
      queryParams.push(invoiceId);
      paramCount++;
    }

    queryText += ' ORDER BY p.payment_date DESC';

    const result = await query(queryText, queryParams);

    return NextResponse.json({
      success: true,
      data: { payments: result.rows }
    });
  } catch (error) {
    console.error('Get payments error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch payments' },
      { status: 500 }
    );
  }
}

async function postHandler(request) {
  try {
    const body = await request.json();
    const { invoice_id, amount, payment_method, transaction_id } = body;

    if (!invoice_id || !amount || !payment_method) {
      return NextResponse.json(
        { success: false, error: 'Invoice ID, amount, and payment method are required' },
        { status: 400 }
      );
    }

    if (!validatePaymentMethod(payment_method)) {
      return NextResponse.json(
        { success: false, error: 'Invalid payment method. Must be Cash, Card, or Finance' },
        { status: 400 }
      );
    }

    const client = await getClient();
    try {
      await client.query('BEGIN');

      const paymentResult = await client.query(
        `INSERT INTO payments (invoice_id, payment_date, amount, payment_method, transaction_id, created_at) 
         VALUES ($1, NOW(), $2, $3, $4, NOW()) 
         RETURNING *`,
        [invoice_id, amount, payment_method, sanitizeInput(transaction_id || '')]
      );

      const invoiceResult = await client.query(
        `UPDATE invoices 
         SET paid_amount = paid_amount + $1,
             status = CASE 
               WHEN paid_amount + $1 >= total_amount THEN 'Paid'
               WHEN paid_amount + $1 > 0 THEN 'Partial'
               ELSE status
             END
         WHERE id = $2
         RETURNING *`,
        [amount, invoice_id]
      );

      await client.query('COMMIT');

      return NextResponse.json(
        {
          success: true,
          data: {
            payment: paymentResult.rows[0],
            invoice: invoiceResult.rows[0]
          },
          message: 'Payment recorded successfully'
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
    console.error('Create payment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record payment' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);
export const POST = requireAuth(postHandler);