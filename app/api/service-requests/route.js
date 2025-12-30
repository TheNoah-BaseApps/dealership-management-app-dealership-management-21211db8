/**
 * @swagger
 * /api/service-requests:
 *   get:
 *     summary: Get all service requests
 *     tags: [Service Requests]
 *   post:
 *     summary: Create a new service request
 *     tags: [Service Requests]
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { validatePriorityLevel, validateResolutionStatus, sanitizeInput } from '@/lib/validation';

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const priority = searchParams.get('priority') || '';

    let queryText = `
      SELECT sr.*, c.name as customer_name, c.email as customer_email, u.name as agent_name 
      FROM service_requests sr 
      LEFT JOIN customers c ON sr.customer_id = c.id 
      LEFT JOIN users u ON sr.assigned_agent = u.id 
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND sr.resolution_status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    if (priority) {
      queryText += ` AND sr.priority_level = $${paramCount}`;
      queryParams.push(priority);
      paramCount++;
    }

    queryText += ' ORDER BY sr.request_date DESC';

    const result = await query(queryText, queryParams);

    return NextResponse.json({
      success: true,
      data: { serviceRequests: result.rows }
    });
  } catch (error) {
    console.error('Get service requests error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch service requests' },
      { status: 500 }
    );
  }
}

async function postHandler(request) {
  try {
    const body = await request.json();
    const { customer_id, issue_type, issue_description, assigned_agent, priority_level, communication_mode } = body;

    if (!customer_id || !issue_type || !issue_description) {
      return NextResponse.json(
        { success: false, error: 'Customer ID, issue type, and description are required' },
        { status: 400 }
      );
    }

    if (priority_level && !validatePriorityLevel(priority_level)) {
      return NextResponse.json(
        { success: false, error: 'Invalid priority level' },
        { status: 400 }
      );
    }

    const serviceRequestId = `SR-${Date.now()}`;

    const result = await query(
      `INSERT INTO service_requests 
       (service_request_id, customer_id, request_date, issue_type, issue_description, assigned_agent, priority_level, resolution_status, communication_mode, created_at) 
       VALUES ($1, $2, NOW(), $3, $4, $5, $6, $7, $8, NOW()) 
       RETURNING *`,
      [
        serviceRequestId,
        customer_id,
        sanitizeInput(issue_type),
        sanitizeInput(issue_description),
        assigned_agent || null,
        priority_level || 'Medium',
        'Open',
        sanitizeInput(communication_mode || 'Email')
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: { serviceRequest: result.rows[0] },
        message: 'Service request created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create service request error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create service request' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);
export const POST = requireAuth(postHandler);