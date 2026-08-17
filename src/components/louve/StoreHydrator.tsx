'use client';

import { useEffect, useRef } from 'react';
import { useLouveStore } from '@/store/louve-store';
import type { Product, SaleRecord, OtherProduct, OtherSaleRecord, AppSettings } from '@/types/louve';

export function StoreHydrator({
  data
}: {
  data: {
    products: Product[];
    sales: SaleRecord[];
    otherProducts: OtherProduct[];
    otherSales: OtherSaleRecord[];
    settings: AppSettings;
  }
}) {
  const isHydrated = useRef(false);
  
  // We hydrate immediately during rendering to avoid hydration mismatch
  if (!isHydrated.current) {
    useLouveStore.getState().hydrate(data);
    isHydrated.current = true;
  }
  
  return null;
}
