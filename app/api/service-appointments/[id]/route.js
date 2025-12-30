/**
 * @swagger
 * /api/service-appointments/{id}:
 *   put:
 *     summary: Update service appointment
 *     tags: [Service Appointments]
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';
import { sanitizeInput } from '@/lib/validation';

async function putHandler(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    const { status, appointment_date, notes } = body;

    const result = await query(
      `UPDATE service_appointments 
       SET status = COALESCE($1, status),
           appointment_date = COALESCE($2, appointment_date),
           notes = COALESCE($3, notes)
       WHERE id = $4
       RETURNING *`,
      [status, appointment_date, notes ? sanitizeInput(notes) : null, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Service appointment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: { appointment: result.rows[0] },
      message: 'Service appointment updated successfully'
    });
  } catch (error) {
    console.error('Update service appointment error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update service appointment' },
      { status: 500 }
    );
  }
}

export const PUT = requireAuth(putHandler);