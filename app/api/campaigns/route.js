/**
 * @swagger
 * /api/campaigns:
 *   get:
 *     summary: Get all campaigns
 *     tags: [Campaigns]
 *   post:
 *     summary: Create a new campaign
 *     tags: [Campaigns]
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { validateDateRange, sanitizeInput } from '@/lib/validation';

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';

    let queryText = 'SELECT * FROM campaigns WHERE 1=1';
    const queryParams = [];
    let paramCount = 1;

    if (status) {
      queryText += ` AND status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    queryText += ' ORDER BY start_date DESC';

    const result = await query(queryText, queryParams);

    return NextResponse.json({
      success: true,
      data: { campaigns: result.rows }
    });
  } catch (error) {
    console.error('Get campaigns error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch campaigns' },
      { status: 500 }
    );
  }
}

async function postHandler(request) {
  try {
    const body = await request.json();
    const { name, type, start_date, end_date, target_segment, status } = body;

    if (!name || !type || !start_date || !end_date) {
      return NextResponse.json(
        { success: false, error: 'Name, type, start date, and end date are required' },
        { status: 400 }
      );
    }

    if (!validateDateRange(start_date, end_date)) {
      return NextResponse.json(
        { success: false, error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO campaigns (name, type, start_date, end_date, target_segment, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING *`,
      [
        sanitizeInput(name),
        sanitizeInput(type),
        start_date,
        end_date,
        sanitizeInput(target_segment || ''),
        status || 'Draft'
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: { campaign: result.rows[0] },
        message: 'Campaign created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create campaign error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create campaign' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);
export const POST = requireAuth(postHandler);