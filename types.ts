export interface SelectOption {
  id: string;
  name: string;
}

export interface Merchant extends SelectOption {
  phone: string;
  phone2?: string;
  gstin: string;
  address: string;
}

export interface Product extends SelectOption {
    // cost property is removed as it's now variable
}

// FIX: Define and export InvoiceItem type for clarity and stronger typing.
export interface InvoiceItem {
  quantity: string;
  // rate property is removed
}

export interface InvoiceRow {
  id: number;
  customerId: string;
  items: {
    [productId: string]: InvoiceItem;
  };
}
