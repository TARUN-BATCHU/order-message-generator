import React from 'react';
import type { InvoiceRow, Merchant, Product } from '../types';
import { TrashIcon } from './icons';
import { SearchableSelect } from './SearchableSelect';

interface InvoiceTableRowProps {
  row: InvoiceRow;
  serialNumber: number;
  products: Product[];
  customers: Merchant[];
  onRowChange: (row: InvoiceRow) => void;
  onRemoveRow: (id: number) => void;
  isOnlyRow: boolean;
}

export const InvoiceTableRow: React.FC<InvoiceTableRowProps> = ({ row, serialNumber, products, customers, onRowChange, onRemoveRow, isOnlyRow }) => {
  const handleCustomerChange = (customerId: string) => {
    onRowChange({ ...row, customerId });
  };

  const handleItemChange = (productId: string, value: string) => {
    const newItems = {
      ...row.items,
      [productId]: {
        ...(row.items[productId] || { quantity: '' }),
        quantity: value,
      },
    };
    onRowChange({ ...row, items: newItems });
  };

  return (
    <tr className="bg-white border-b dark:bg-slate-800 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50">
      <td className="p-3 align-top">
        <div className="flex items-start space-x-3">
          <span className="pt-2 font-medium text-slate-900 dark:text-white">{serialNumber}.</span>
          <div className="flex-1">
            <SearchableSelect
              options={customers}
              value={row.customerId}
              onChange={handleCustomerChange}
              placeholder="Search for a buyer..."
              wide={true}
            />
          </div>
        </div>
      </td>
      {products.map(p => (
        <td key={p.id} className="p-3 align-top">
            <input 
                type="number" 
                placeholder="0"
                value={row.items[p.id]?.quantity || ''}
                onChange={(e) => handleItemChange(p.id, e.target.value)}
                className="w-full text-center bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2"
            />
        </td>
      ))}
      <td className="p-3 text-center align-top">
        {!isOnlyRow && (
          <button
            onClick={() => onRemoveRow(row.id)}
            className="mt-1 p-1.5 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-slate-800 transition-colors"
            aria-label="Remove row"
          >
            <TrashIcon />
          </button>
        )}
      </td>
    </tr>
  );
};