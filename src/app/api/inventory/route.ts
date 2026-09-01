import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { getSessionUser } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!hasPermission(session.role, 'inventory.manage') && session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');
    const query = searchParams.get('q');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (category && category !== 'ALL') where.category = category;
    if (query) {
      where.OR = [
        { name: { contains: query, mode: 'insensitive' } },
        { itemCode: { contains: query, mode: 'insensitive' } },
      ];
    }

    const [total, items] = await Promise.all([
      prisma.inventoryItem.count({ where }),
      prisma.inventoryItem.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          transactions: {
            orderBy: { date: 'desc' },
            take: 5,
          },
        },
      }),
    ]);

    // Low stock alerts
    const lowStockItems = await prisma.inventoryItem.findMany({
      where: { quantity: { lte: prisma.inventoryItem.fields.minimumThreshold } },
    }).catch(() => []);

    return NextResponse.json({
      success: true,
      items,
      stats: {
        totalItems: total,
        lowStockCount: items.filter(i => i.quantity <= i.minimumThreshold).length,
      },
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Inventory fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch inventory items' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSessionUser(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!hasPermission(session.role, 'inventory.manage')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === 'ADD_ITEM') {
      const { name, category, quantity, unit, location, minimumThreshold, unitPrice } = body;
      if (!name || !category) {
        return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
      }

      const count = await prisma.inventoryItem.count();
      const categoryPrefix = category.substring(0, 3).toUpperCase();
      const itemCode = `INV-${categoryPrefix}-${(count + 1).toString().padStart(3, '0')}`;

      const item = await prisma.inventoryItem.create({
        data: {
          itemCode,
          name,
          category,
          quantity: quantity || 0,
          unit: unit || 'Units',
          location: location || null,
          minimumThreshold: minimumThreshold || 5,
          unitPrice: unitPrice || 0,
        },
      });

      await logAuditEvent({
        userId: session.userId, userName: session.fullName || session.username, role: session.role,
        action: 'INVENTORY_ITEM_ADDED', entity: 'InventoryItem', entityId: item.id,
        details: `Item added: ${name} (${itemCode}), qty: ${quantity || 0}`,
      });

      return NextResponse.json({ success: true, item });
    }

    if (action === 'RECORD_TRANSACTION') {
      const { itemId, type, quantity, reference, remarks } = body;
      if (!itemId || !type || !quantity) {
        return NextResponse.json({ error: 'Item ID, type, and quantity are required' }, { status: 400 });
      }

      const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } });
      if (!item) {
        return NextResponse.json({ error: 'Item not found' }, { status: 404 });
      }

      const quantityChange = type === 'PURCHASE' || type === 'RETURN' ? quantity : -quantity;
      const newQuantity = item.quantity + quantityChange;
      if (newQuantity < 0) {
        return NextResponse.json({ error: 'Insufficient stock for this transaction' }, { status: 400 });
      }

      const [transaction] = await prisma.$transaction([
        prisma.inventoryTransaction.create({
          data: {
            itemId,
            type,
            quantity,
            reference: reference || null,
            remarks: remarks || null,
            doneById: session.userId,
          },
        }),
        prisma.inventoryItem.update({
          where: { id: itemId },
          data: { quantity: newQuantity },
        }),
      ]);

      await logAuditEvent({
        userId: session.userId, userName: session.fullName || session.username, role: session.role,
        action: 'INVENTORY_TRANSACTION', entity: 'InventoryTransaction', entityId: transaction.id,
        details: `${type}: ${quantity}x ${item.name}`,
      });

      return NextResponse.json({ success: true, transaction });
    }

    return NextResponse.json({ error: 'Invalid action. Use ADD_ITEM or RECORD_TRANSACTION' }, { status: 400 });
  } catch (error) {
    console.error('Inventory action error:', error);
    return NextResponse.json({ error: 'Inventory operation failed' }, { status: 500 });
  }
}
