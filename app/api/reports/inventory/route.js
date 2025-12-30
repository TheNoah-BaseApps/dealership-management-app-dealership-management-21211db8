/**
 * @swagger
 * /api/reports/inventory:
 *   get:
 *     summary: Generate inventory report
 *     tags: [Reports]
 */
import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from '@/lib/auth';

async function getHandler(request) {
  try {
    const vehicleInventory = await query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(price) as total_value,
        AVG(price) as avg_price
      FROM vehicles
      GROUP BY status
    `);

    const vehiclesByMake = await query(`
      SELECT 
        make,
        COUNT(*) as count,
        AVG(price) as avg_price
      FROM vehicles
      GROUP BY make
      ORDER BY count DESC
      LIMIT 10
    `);

    const partsInventory = await query(`
      SELECT 
        category,
        COUNT(*) as total_parts,
        SUM(quantity) as total_quantity,
        SUM(quantity * unit_price) as total_value,
        COUNT(CASE WHEN quantity <= reorder_level THEN 1 END) as low_stock_count
      FROM parts
      GROUP BY category
    `);

    const lowStockParts = await query(`
      SELECT *
      FROM parts
      WHERE quantity <= reorder_level
      ORDER BY quantity ASC
      LIMIT 20
    `);

    return NextResponse.json({
      success: true,
      data: {
        vehicleInventory: vehicleInventory.rows,
        vehiclesByMake: vehiclesByMake.rows,
        partsInventory: partsInventory.rows,
        lowStockParts: lowStockParts.rows
      }
    });
  } catch (error) {
    console.error('Generate inventory report error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate inventory report' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(getHandler);