/**
 * @swagger
 * /api/service-requests/{id}:
 *   put:
 *     summary: Update service request
 *     tags: [Service Requests]
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { validateResolutionStatus, validatePriorityLevel } from '@/lib/validation';

async function putHandler(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { resolution_status, assigned_agent, priority_level, feedback_score } = body;

    if (resolution_status && !validateResolutionStatus(resolution_status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid resolution status' },
        { status: 400 }
      );
    }

    if (priority_level && !validatePriorityLevel(priority_level)) {
      return NextResponse.json(
        { success: false, error: 'Invalid priority level' },
        { status: 400 }
      );
    }

    const resolutionDate = ['Resolved', 'Closed'].includes(resolution_status) ? 'NOW()' : 'resolution_date';

    const result = await query(
      `UPDATE service_requests 
       SET resolution_status = COALESCE($1, resolution_status),
           assigned_agent = COALESCE($2, assigned_agent),
           priority_level = COALESCE($3, priority_level),
           feedback_score = COALESCE($4, feedback_score),
           resolution_date = ${resolutionDate}
       WHERE id = $5
       RETURNING *`,
      [resolution_status, assigned_agent, priority_level, feedback_score, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Service request not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { serviceRequest: result.rows[0] },
      message: 'Service request updated successfully'
    });
  } catch (error) {
    console.error('Update service request error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update service request' },
      { status: 500 }
    );
  }
}

export const PUT = requireAuth(putHandler);