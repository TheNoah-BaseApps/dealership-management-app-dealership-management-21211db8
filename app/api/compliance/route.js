/**
 * @swagger
 * /api/compliance:
 *   get:
 *     summary: Get all compliance records
 *     tags: [Compliance]
 *   post:
 *     summary: Create a new compliance record
 *     tags: [Compliance]
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sanitizeInput } from '@/lib/validation';

async function getHandler(request) {
  try {
    const { searchParams } = new URL(request.url);
    const recordType = searchParams.get('record_type') || '';
    const status = searchParams.get('status') || '';

    let queryText = `
      SELECT cr.*, u.name as auditor_name 
      FROM compliance_records cr 
      LEFT JOIN users u ON cr.audited_by = u.id 
      WHERE 1=1
    `;
    const queryParams = [];
    let paramCount = 1;

    if (recordType) {
      queryText += ` AND cr.record_type = $${paramCount}`;
      queryParams.push(recordType);
      paramCount++;
    }

    if (status) {
      queryText += ` AND cr.status = $${paramCount}`;
      queryParams.push(status);
      paramCount++;
    }

    queryText += ' ORDER BY cr.compliance_date DESC';

    const result = await query(queryText, queryParams);

    return NextResponse.json({
      success: true,
      data: { complianceRecords: result.rows }
    });
  } catch (error) {
    console.error('Get compliance records error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch compliance records' },
      { status: 500 }
    );
  }
}

async function postHandler(request) {
  try {
    const body = await request.json();
    const { record_type, reference_id, description, compliance_date, status, audited_by } = body;

    if (!record_type || !description || !audited_by) {
      return NextResponse.json(
        { success: false, error: 'Record type, description, and auditor are required' },
        { status: 400 }
      );
    }

    const result = await query(
      `INSERT INTO compliance_records 
       (record_type, reference_id, description, compliance_date, status, audited_by, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING *`,
      [
        sanitizeInput(record_type),
        reference_id || null,
        sanitizeInput(description),
        compliance_date || null,
        status || 'Pending',
        audited_by
      ]
    );

    return NextResponse.json(
      {
        success: true,
        data: { complianceRecord: result.rows[0] },
        message: 'Compliance record created successfully'
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Create compliance record error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create compliance record' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);
export const POST = requireAuth(postHandler);