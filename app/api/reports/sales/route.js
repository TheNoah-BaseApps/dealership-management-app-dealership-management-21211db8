/**
 * @swagger
 * /api/reports/sales:
 *   get:
 *     summary: Generate sales report
 *     tags: [Reports]
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('start_date') || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const endDate = searchParams.get('end_date') || new Date().toISOString();

    const salesData = await query(
      `SELECT 
         so.*,
         c.name as customer_name,
         v.make,
         v.model,
         v.year,
         u.name as sales_rep_name
       FROM sales_orders so
       LEFT JOIN customers c ON so.customer_id = c.id
       LEFT JOIN vehicles v ON so.vehicle_id = v.id
       LEFT JOIN users u ON so.sales_rep_id = u.id
       WHERE so.order_date BETWEEN $1 AND $2
       ORDER BY so.order_date DESC`,
      [startDate, endDate]
    );

    const summary = await query(
      `SELECT 
         COUNT(*) as total_orders,
         SUM(total_amount) as total_revenue,
         AVG(total_amount) as avg_order_value,
         COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_orders,
         COUNT(CASE WHEN payment_status = 'Paid' THEN 1 END) as paid_orders
       FROM sales_orders
       WHERE order_date BETWEEN $1 AND $2`,
      [startDate, endDate]
    );

    return NextResponse.json({
      success: true,
      data: {
        sales: salesData.rows,
        summary: summary.rows[0],
        period: { startDate, endDate }
      }
    });
  } catch (error) {
    console.error('Generate sales report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate sales report' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);