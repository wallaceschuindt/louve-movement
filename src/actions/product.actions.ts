'use server'

import { db } from '@/lib/db'
import type { Product, OtherProduct } from '@/types/louve'

export async function getProducts(): Promise<Product[]> {
  const products = await db.product.findMany({
    orderBy: { createdAt: 'desc' }
  })
  
  return products.map(p => ({
    id: p.id,
    code: p.code,
    name: p.name,
    category: p.category,
    print: p.print,
    color: p.color,
    cost: p.cost,
    price: p.price,
    minStock: p.minStock,
    sizes: { P: p.sizeP, M: p.sizeM, G: p.sizeG, GG: p.sizeGG },
    image: p.image
  }))
}

export async function createProduct(data: Omit<Product, 'id'>): Promise<Product> {
  const p = await db.product.create({
    data: {
      code: data.code,
      name: data.name,
      category: data.category,
      print: data.print,
      color: data.color,
      cost: data.cost,
      price: data.price,
      minStock: data.minStock,
      image: data.image,
      sizeP: data.sizes.P,
      sizeM: data.sizes.M,
      sizeG: data.sizes.G,
      sizeGG: data.sizes.GG,
    }
  })
  return {
    ...p,
    sizes: { P: p.sizeP, M: p.sizeM, G: p.sizeG, GG: p.sizeGG }
  }
}

export async function updateProduct(data: Product): Promise<Product> {
  const p = await db.product.update({
    where: { id: data.id },
    data: {
      code: data.code,
      name: data.name,
      category: data.category,
      print: data.print,
      color: data.color,
      cost: data.cost,
      price: data.price,
      minStock: data.minStock,
      image: data.image,
      sizeP: data.sizes.P,
      sizeM: data.sizes.M,
      sizeG: data.sizes.G,
      sizeGG: data.sizes.GG,
    }
  })
  return {
    ...p,
    sizes: { P: p.sizeP, M: p.sizeM, G: p.sizeG, GG: p.sizeGG }
  }
}

export async function deleteProduct(id: string) {
  await db.product.delete({ where: { id } })
}

export async function adjustProductStock(id: string, size: 'P' | 'M' | 'G' | 'GG', qty: number) {
  const sizeField = `size${size}`
  await db.product.update({
    where: { id },
    data: {
      [sizeField]: { increment: qty }
    }
  })
}

// Other Products
export async function getOtherProducts(): Promise<OtherProduct[]> {
  const products = await db.otherProduct.findMany({
    orderBy: { createdAt: 'desc' }
  })
  return products.map(p => ({
    id: p.id,
    code: p.code,
    name: p.name,
    description: p.description,
    category: p.category,
    cost: p.cost,
    price: p.price,
    minStock: p.minStock,
    stock: p.stock,
    unitType: p.unitType as 'unidade' | 'caixa' | 'kit',
    kitSize: p.kitSize,
    image: p.image
  }))
}

export async function createOtherProduct(data: Omit<OtherProduct, 'id'>): Promise<OtherProduct> {
  const p = await db.otherProduct.create({
    data: {
      code: data.code,
      name: data.name,
      description: data.description,
      category: data.category,
      cost: data.cost,
      price: data.price,
      minStock: data.minStock,
      stock: data.stock,
      unitType: data.unitType,
      kitSize: data.kitSize,
      image: data.image,
    }
  })
  return { ...p, unitType: p.unitType as 'unidade' | 'caixa' | 'kit' }
}

export async function updateOtherProduct(data: OtherProduct): Promise<OtherProduct> {
  const p = await db.otherProduct.update({
    where: { id: data.id },
    data: {
      code: data.code,
      name: data.name,
      description: data.description,
      category: data.category,
      cost: data.cost,
      price: data.price,
      minStock: data.minStock,
      stock: data.stock,
      unitType: data.unitType,
      kitSize: data.kitSize,
      image: data.image,
    }
  })
  return { ...p, unitType: p.unitType as 'unidade' | 'caixa' | 'kit' }
}

export async function deleteOtherProduct(id: string) {
  await db.otherProduct.delete({ where: { id } })
}

export async function adjustOtherProductStock(id: string, qty: number) {
  await db.otherProduct.update({
    where: { id },
    data: { stock: { increment: qty } }
  })
}
