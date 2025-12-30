/**
 * @swagger
 * /api/customer-engagements:
 *   get:
 *     summary: Get all customer engagements
 *     tags: [Customer Engagements]
 *   post:
 *     summary: Create a new customer engagement
 *     tags: [Customer Engagements]
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sanitizeInput } from '@/lib/validation';

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customer_id') || '';
    const campaignId = searchParams.get('campaign_id') || '';

    let queryText = `
      SELECT ce.*, c.name as customer_name, c.email as customer_email, ca.name as campaign_name 
      FROM customer_engagements ce 
      LEFT JOIN customers c ON ce.customer_id = c.id 
      LEFT JOIN campaigns ca ON ce.campaign_id = ca.id 
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 1;

    if (customerId) {
      queryText += ` AND ce.customer_id = $${paramCount}`;
      queryParams.push(customerId);
      paramCount++;
    }

    if (campaignId) {
      queryText += ` AND ce.campaign_id = $${paramCount}`;
      queryParams.push(campaignId);
      paramCount++;
    }

    queryText += ' ORDER BY ce.engagement_date DESC';

    const result = await query(queryText, queryParams);

    return NextResponse.json({
      success: true,
      data: { engagements: result.rows }
    });
  } catch (error) {
    console.error('Get customer engagements error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch customer engagements' },
      { status: 500 }
    );
  }
}

async function postHandler(request) {
  try {
    const body = await request.json();
    const { customer_id, engagement_type, campaign_id, response_received, reward_points, communication_method, engagement_outcome, follow_up_needed, next_engagement_date } = body;

    if (!customer_id || !engagement_type) {
      return NextResponse.json(
        { success: false, error: 'Customer ID and engagement type are required' },
        { status: 400 }
      );
    }

    const engagementId = `ENG-${Date.now()}`;

    const result = await query(
      `INSERT INTO customer_engagements 
       (engagement_id, customer_id, engagement_type, engagement_date, campaign_id, response_received, reward_points, communication_method, engagement_outcome, follow_up_needed, next_engagement_date, created_at) 
       VALUES ($1, $2, $3, NOW(), $4, $5, $6, $7, $8, $9, $10, NOW()) 
       RETURNING *`,
      [
        engagementId,
        customer_id,
        sanitizeInput(engagement_type),
        campaign_id || null,
        response_received || false,
        reward_points || 0,
        sanitizeInput(communication_method || 'Email'),
        sanitizeInput(engagement_outcome || ''),
        follow_up_needed || false,
        next_engagement_date || null
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: { engagement: result.rows[0] },
        message: 'Customer engagement created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create customer engagement error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create customer engagement' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);
export const POST = requireAuth(postHandler);