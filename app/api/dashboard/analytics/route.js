/**
 * @swagger
 * /api/dashboard/analytics:
 *   get:
 *     summary: Get dashboard analytics
 *     tags: [Dashboard]
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

async function getHandler(request) {
  try {
    const salesStats = await query(`
      SELECT 
        COUNT(*) as total_orders,
        SUM(total_amount) as total_revenue,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) as completed_orders
      FROM sales_orders
      WHERE order_date >= NOW() - INTERVAL '30 days'
    `);

    const serviceStats = await query(`
      SELECT 
        COUNT(*) as total_requests,
        COUNT(CASE WHEN resolution_status = 'Resolved' THEN 1 END) as resolved_requests,
        COUNT(CASE WHEN priority_level = 'High' THEN 1 END) as high_priority_requests,
        AVG(feedback_score) as avg_feedback_score
      FROM service_requests
      WHERE request_date >= NOW() - INTERVAL '30 days'
    `);

    const inventoryStats = await query(`
      SELECT 
        COUNT(*) as total_vehicles,
        COUNT(CASE WHEN status = 'Available' THEN 1 END) as available_vehicles,
        COUNT(CASE WHEN status = 'Sold' THEN 1 END) as sold_vehicles
      FROM vehicles
    `);

    const partsStats = await query(`
      SELECT 
        COUNT(*) as total_parts,
        COUNT(CASE WHEN quantity <= reorder_level THEN 1 END) as low_stock_parts,
        SUM(quantity * unit_price) as total_inventory_value
      FROM parts
    `);

    const customerStats = await query(`
      SELECT 
        COUNT(*) as total_customers,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as new_customers
      FROM customers
    `);

    const recentActivity = await query(`
      SELECT 
        'sales_order' as type,
        order_number as reference,
        order_date as date,
        total_amount as amount
      FROM sales_orders
      ORDER BY order_date DESC
      LIMIT 10
    `);

    return NextResponse.json({
      success: true,
      data: {
        sales: salesStats.rows[0],
        service: serviceStats.rows[0],
        inventory: inventoryStats.rows[0],
        parts: partsStats.rows[0],
        customers: customerStats.rows[0],
        recentActivity: recentActivity.rows
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);