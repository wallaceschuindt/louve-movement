'use server'

import { db } from '@/lib/db'
import type { SaleRecord, OtherSaleRecord } from '@/types/louve'

export async function getSales(): Promise<SaleRecord[]> {
  const sales = await db.saleRecord.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  })
  
  return sales.map(s => ({
    id: s.id,
    date: s.date,
    client: {
      name: s.clientName,
      phone: s.clientPhone,
      email: s.clientEmail
    },
    paymentMethod: s.paymentMethod,
    total: s.total,
    totalCost: s.totalCost,
    items: s.items.map(i => ({
      productId: i.productId,
      name: i.name,
      code: i.code,
      print: i.print,
      color: i.color,
      size: i.size as 'P' | 'M' | 'G' | 'GG',
      qty: i.qty,
      price: i.price,
      cost: i.cost,
      image: i.image
    }))
  }))
}

export async function createSale(data: Omit<SaleRecord, 'id'>): Promise<SaleRecord> {
  // Use a transaction to ensure both sale creation and stock adjustment happen together
  const sale = await db.$transaction(async (tx) => {
    const s = await tx.saleRecord.create({
      data: {
        date: data.date,
        clientName: data.client.name,
        clientPhone: data.client.phone,
        clientEmail: data.client.email,
        paymentMethod: data.paymentMethod,
        total: data.total,
        totalCost: data.totalCost,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            name: item.name,
            code: item.code,
            print: item.print,
            color: item.color,
            size: item.size,
            qty: item.qty,
            price: item.price,
            cost: item.cost,
            image: item.image
          }))
        }
      },
      include: { items: true }
    })

    // Adjust stock
    for (const item of data.items) {
      const sizeField = `size${item.size}`
      await tx.product.update({
        where: { id: item.productId },
        data: {
          [sizeField]: { decrement: item.qty }
        }
      })
    }
    
    return s
  })

  return {
    id: sale.id,
    date: sale.date,
    client: {
      name: sale.clientName,
      phone: sale.clientPhone,
      email: sale.clientEmail
    },
    paymentMethod: sale.paymentMethod,
    total: sale.total,
    totalCost: sale.totalCost,
    items: sale.items.map(i => ({
      productId: i.productId,
      name: i.name,
      code: i.code,
      print: i.print,
      color: i.color,
      size: i.size as 'P' | 'M' | 'G' | 'GG',
      qty: i.qty,
      price: i.price,
      cost: i.cost,
      image: i.image
    }))
  }
}

export async function deleteSale(id: string) {
  // Transaction: restore stock then delete sale
  await db.$transaction(async (tx) => {
    const sale = await tx.saleRecord.findUnique({
      where: { id },
      include: { items: true }
    })
    
    if (sale) {
      for (const item of sale.items) {
        const sizeField = `size${item.size}`
        await tx.product.update({
          where: { id: item.productId },
          data: { [sizeField]: { increment: item.qty } }
        })
      }
    }
    
    await tx.saleRecord.delete({ where: { id } })
  })
}

// Other Sales
export async function getOtherSales(): Promise<OtherSaleRecord[]> {
  const sales = await db.otherSaleRecord.findMany({
    include: { items: true },
    orderBy: { createdAt: 'desc' }
  })
  
  return sales.map(s => ({
    id: s.id,
    date: s.date,
    client: {
      name: s.clientName,
      phone: s.clientPhone,
      email: s.clientEmail
    },
    paymentMethod: s.paymentMethod,
    total: s.total,
    totalCost: s.totalCost,
    items: s.items.map(i => ({
      productId: i.productId,
      name: i.name,
      code: i.code,
      category: i.category,
      unitType: i.unitType as 'unidade' | 'caixa' | 'kit',
      qty: i.qty,
      price: i.price,
      cost: i.cost,
      image: i.image
    }))
  }))
}

export async function createOtherSale(data: Omit<OtherSaleRecord, 'id'>): Promise<OtherSaleRecord> {
  const sale = await db.$transaction(async (tx) => {
    const s = await tx.otherSaleRecord.create({
      data: {
        date: data.date,
        clientName: data.client.name,
        clientPhone: data.client.phone,
        clientEmail: data.client.email,
        paymentMethod: data.paymentMethod,
        total: data.total,
        totalCost: data.totalCost,
        items: {
          create: data.items.map(item => ({
            productId: item.productId,
            name: item.name,
            code: item.code,
            category: item.category,
            unitType: item.unitType,
            qty: item.qty,
            price: item.price,
            cost: item.cost,
            image: item.image
          }))
        }
      },
      include: { items: true }
    })

    // Adjust stock
    for (const item of data.items) {
      await tx.otherProduct.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.qty } }
      })
    }
    
    return s
  })

  return {
    id: sale.id,
    date: sale.date,
    client: {
      name: sale.clientName,
      phone: sale.clientPhone,
      email: sale.clientEmail
    },
    paymentMethod: sale.paymentMethod,
    total: sale.total,
    totalCost: sale.totalCost,
    items: sale.items.map(i => ({
      productId: i.productId,
      name: i.name,
      code: i.code,
      category: i.category,
      unitType: i.unitType as 'unidade' | 'caixa' | 'kit',
      qty: i.qty,
      price: i.price,
      cost: i.cost,
      image: i.image
    }))
  }
}

export async function deleteOtherSale(id: string) {
  // Restore stock and delete
  await db.$transaction(async (tx) => {
    const sale = await tx.otherSaleRecord.findUnique({
      where: { id },
      include: { items: true }
    })
    
    if (sale) {
      for (const item of sale.items) {
        await tx.otherProduct.update({
          where: { id: item.productId },
          data: { stock: { increment: item.qty } }
        })
      }
    }
    
    await tx.otherSaleRecord.delete({ where: { id } })
  })
}
