/**
 * @swagger
 * /api/reports/service:
 *   get:
 *     summary: Generate service report
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

    const serviceData = await query(
      `SELECT 
         sr.*,
         c.name as customer_name,
         u.name as agent_name
       FROM service_requests sr
       LEFT JOIN customers c ON sr.customer_id = c.id
       LEFT JOIN users u ON sr.assigned_agent = u.id
       WHERE sr.request_date BETWEEN $1 AND $2
       ORDER BY sr.request_date DESC`,
      [startDate, endDate]
    );

    const summary = await query(
      `SELECT 
         COUNT(*) as total_requests,
         COUNT(CASE WHEN resolution_status = 'Resolved' THEN 1 END) as resolved_requests,
         COUNT(CASE WHEN resolution_status = 'Closed' THEN 1 END) as closed_requests,
         COUNT(CASE WHEN priority_level = 'High' THEN 1 END) as high_priority,
         AVG(feedback_score) as avg_feedback_score,
         AVG(EXTRACT(EPOCH FROM (resolution_date - request_date))/3600) as avg_resolution_hours
       FROM service_requests
       WHERE request_date BETWEEN $1 AND $2`,
      [startDate, endDate]
    );

    return NextResponse.json({
      success: true,
      data: {
        serviceRequests: serviceData.rows,
        summary: summary.rows[0],
        period: { startDate, endDate }
      }
    });
  } catch (error) {
    console.error('Generate service report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate service report' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);