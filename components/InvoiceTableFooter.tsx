import React from 'react';
import type { Product } from '../types';

interface InvoiceTableFooterProps {
  products: Product[];
  productTotals: { [productId: string]: number };
  grandTotal: number;
}

export const InvoiceTableFooter: React.FC<InvoiceTableFooterProps> = ({ products, productTotals, grandTotal }) => {
  // Only show footer if there are items with quantities
  if (grandTotal === 0) {
    return null;
  }

  return (
    <tfoot className="bg-slate-100 dark:bg-slate-700/50 font-semibold text-slate-800 dark:text-slate-100">
      <tr className="border-t-2 border-slate-300 dark:border-slate-600">
        <td className="p-3 text-right"><strong>Total Bags</strong></td>
        {products.map(p => (
          <td key={p.id} className="p-3 text-center">
            <strong>{productTotals[p.id]?.toLocaleString('en-IN') || 0}</strong>
          </td>
        ))}
        <td className="p-3 text-center text-indigo-600 dark:text-indigo-400">
          <strong>{grandTotal.toLocaleString('en-IN')}</strong>
        </td>
      </tr>
    </tfoot>
  );
};
