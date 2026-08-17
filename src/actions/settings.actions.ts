'use server'

import { db } from '@/lib/db'
import type { AppSettings } from '@/types/louve'

export async function getSettings(): Promise<AppSettings> {
  let settings = await db.settings.findUnique({
    where: { id: 'default' }
  })
  
  if (!settings) {
    settings = await db.settings.create({
      data: {
        id: 'default',
        brandName: 'Louve Movement',
        brandSubtitle: 'Controle Financeiro e de Estoque',
        pixKey: 'financeiro@louvemovement.com'
      }
    })
  }
  
  return {
    brandName: settings.brandName,
    brandSubtitle: settings.brandSubtitle,
    brandLogo: settings.brandLogo,
    pixKey: settings.pixKey,
  }
}

export async function updateSettings(data: Partial<AppSettings>) {
  await db.settings.update({
    where: { id: 'default' },
    data
  })
}
