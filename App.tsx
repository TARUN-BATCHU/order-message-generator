import React, { useState, useCallback, useMemo } from 'react';
import { loadMerchants, loadProducts } from './constants';
import type { InvoiceRow, SelectOption, InvoiceItem, Merchant, Product } from './types';
import { InvoiceTableRow } from './components/BuyerForm';
import { Toast } from './components/Toast';
import { ClipboardIcon, PlusIcon, RefreshIcon, WhatsAppIcon, XIcon } from './components/icons';
import { SearchableSelect } from './components/SearchableSelect';
import { MultiSelect } from './components/MultiSelect';
import { ConfirmModal } from './components/ConfirmModal';
import { InvoiceTableFooter } from './components/InvoiceTableFooter';

const App: React.FC = () => {
  const [merchants] = useState<Merchant[]>(() => loadMerchants());
  const [products] = useState<Product[]>(() => loadProducts());
  
  const initialInvoiceRows = useMemo(() => [{ id: Date.now(), customerId: '', items: {} }], []);
  
  const [selectedMerchantId, setSelectedMerchantId] = useState<string>(merchants.length > 0 ? merchants[0].id : '');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productRates, setProductRates] = useState<{[productId: string]: string}>({});
  const [invoiceRows, setInvoiceRows] = useState<InvoiceRow[]>(initialInvoiceRows);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [excludedCities, setExcludedCities] = useState<Set<string>>(new Set());
  const [showCities, setShowCities] = useState(false);

  const selectedProducts = useMemo(
    () => products.filter(p => selectedProductIds.includes(p.id)),
    [selectedProductIds, products]
  );
  
  const validRows = useMemo(() => invoiceRows.filter(row => 
    row.customerId && 
    (Object.entries(row.items) as [string, InvoiceItem][]).some(([productId, item]) => 
        Number(item.quantity) > 0 && Number(productRates[productId]) > 0
    )
  ), [invoiceRows, productRates]);

  const allDeliveryLocations = useMemo(() => {
    const locations = new Set<string>();
    validRows.forEach(row => {
      const customer = merchants.find(c => c.id === row.customerId);
      if (customer?.address) {
        locations.add(customer.address.toUpperCase());
      }
    });
    return Array.from(locations);
  }, [validRows, merchants]);
  
  const includedCitiesList = useMemo(() => 
    allDeliveryLocations.filter(city => !excludedCities.has(city)),
    [allDeliveryLocations, excludedCities]
  );
  
  const totals = useMemo(() => {
    const productTotals: { [productId: string]: number } = {};
    let grandTotal = 0;

    selectedProductIds.forEach(id => {
        productTotals[id] = 0;
    });

    invoiceRows.forEach(row => {
        if (!row.customerId) return;
        Object.entries(row.items).forEach(([productId, item]) => {
            const quantity = Number(item.quantity) || 0;
            if (quantity > 0 && selectedProductIds.includes(productId)) {
                productTotals[productId] += quantity;
                grandTotal += quantity;
            }
        });
    });

    return { productTotals, grandTotal };
  }, [invoiceRows, selectedProductIds]);


  const isFormValid = useMemo(() => validRows.length > 0, [validRows]);
  
  const handleRateChange = (productId: string, rate: string) => {
    setProductRates(prev => ({...prev, [productId]: rate}));
  }

  const handleAddRow = () => {
    setInvoiceRows([...invoiceRows, { id: Date.now(), customerId: '', items: {} }]);
  };

  const handleRemoveRow = (id: number) => {
    setInvoiceRows(invoiceRows.filter((row) => row.id !== id));
  };
  
  const handleRemoveCity = (city: string) => {
    setExcludedCities(prev => new Set(prev).add(city));
  };

  const handleRowChange = (updatedRow: InvoiceRow) => {
    setInvoiceRows(invoiceRows.map((row) => (row.id === updatedRow.id ? updatedRow : row)));
  };

  const handleClearAll = () => {
    if (merchants.length > 0) {
      setSelectedMerchantId(merchants[0].id);
    }
    setSelectedProductIds([]);
    setProductRates({});
    setInvoiceRows(initialInvoiceRows);
    setExcludedCities(new Set());
    setShowCities(false);
    setIsClearModalOpen(false);
  };
  
  const generateInvoiceText = useCallback(() => {
    const selectedMerchant = merchants.find(m => m.id === selectedMerchantId);
    if (!selectedMerchant) return "Error: Merchant not found.";
    
    const today = new Date();
    const dateString = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

    let text = `🔹 *NEW ORDER* 🔹\n\n`;
    text += `📅 *DATE* : ${dateString}\n`;
    text += `🏬 *SELLER NAME* : ${selectedMerchant.name.toUpperCase()}\n\n`;
    
    if (validRows.length > 0) {
        text += `🧑‍💼 *BUYER DETAILS*\n\n`;

        let totalBags = 0;
        let totalWeightKg = 0;

        validRows.forEach((row) => {
          const customer = merchants.find(c => c.id === row.customerId);
          if (!customer) return;

          text += `${customer.name.toUpperCase()}\n`;
          text += `📍 *CITY* : ${customer.address.toUpperCase()}\n`;
          text += `🧾 *GST* : ${customer.gstin.toUpperCase()}\n`;
          text += `📞 *PHNO* : ${customer.phone}\n`;

          (Object.entries(row.items) as [string, InvoiceItem][]).forEach(([productId, item]) => {
              const product = products.find(p => p.id === productId);
              const quantity = Number(item.quantity);
              const rate = Number(productRates[productId]);

              if(product && quantity > 0 && rate > 0) {
                  text += `● ${product.name} ⇨ : ${quantity}P ➡️ *RATE* : ₹${rate.toLocaleString('en-IN')}\n`;
                  totalBags += quantity;
                  const weightPerBag = product.name.toLowerCase().includes('30') ? 30 : 50;
                  totalWeightKg += quantity * weightPerBag;
              }
          });
          text += `\n`;
        });

        if (includedCitiesList.length > 0) {
          const deliveryString = includedCitiesList.join(', ');
          text += `${deliveryString} *DELIVERY* 🚛\n\n`;
        }

        const totalWeightTons = totalWeightKg / 1000;
        text += `📦 *TOTAL BAGS* : ${totalBags.toLocaleString('en-IN')} Packets\n`;
        text += `⚖️ *TOTAL WEIGHT* : ${totalWeightTons.toFixed(2)} Tons (${totalWeightKg.toLocaleString('en-IN')} Kgs)\n\n`;
    }

    text += `✨ *SIRI BROKERS* ✨`;

    return text;
  }, [selectedMerchantId, validRows, productRates, merchants, products, includedCitiesList]);


  const handleGenerateAndCopy = () => {
    const invoiceText = generateInvoiceText();
    navigator.clipboard.writeText(invoiceText).then(() => {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy text. Please try again.');
    });
  };
  
  const handleShareOnWhatsApp = () => {
    const invoiceText = generateInvoiceText();
    const encodedText = encodeURIComponent(invoiceText);
    const whatsappUrl = `https://wa.me/?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans">
      <div className="container mx-auto p-4 max-w-5xl pb-48">
        <header className="text-center mt-2 mb-6">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">SIRI BROKERS</h1>
          <p className="text-indigo-600 dark:text-indigo-400 mt-2 font-semibold">connecting buyers and sellers</p>
        </header>

        <main className="space-y-8">
          <div className="bg-white dark:bg-slate-800 p-4 sm:p-6 rounded-2xl shadow-lg space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">1. Seller Information</label>
                <SearchableSelect
                    options={merchants}
                    value={selectedMerchantId}
                    onChange={(id) => setSelectedMerchantId(id)}
                    placeholder="Search for a merchant..."
                />
              </div>
              <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">2. Select Products & Set Rates</label>
                  <MultiSelect
                      options={products}
                      selectedIds={selectedProductIds}
                      onToggle={(id) => setSelectedProductIds(prev => prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id])}
                  />
                   {selectedProducts.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 border-t border-slate-200 dark:border-slate-700 pt-4">
                            {selectedProducts.map(product => (
                                <div key={product.id}>
                                    <label htmlFor={`rate-${product.id}`} className="text-sm font-medium text-slate-600 dark:text-slate-400">{product.name}</label>
                                    <div className="relative mt-1">
                                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                            <span className="text-slate-500 sm:text-sm">₹</span>
                                        </div>
                                        <input
                                            type="number"
                                            id={`rate-${product.id}`}
                                            placeholder="0.00"
                                            value={productRates[product.id] || ''}
                                            onChange={(e) => handleRateChange(product.id, e.target.value)}
                                            className="w-full pl-7 p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
              </div>
          </div>
          

          <div className="bg-white dark:bg-slate-800 p-2 sm:p-4 rounded-2xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4 border-b border-slate-200 dark:border-slate-700 pb-3">3. Buyer &amp; Order Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
                <thead className="text-xs text-slate-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-slate-300">
                  <tr>
                    <th scope="col" className="p-3 min-w-[160px]">Buyer Name</th>
                    {selectedProducts.map(p => (
                        <th key={p.id} scope="col" className="p-3 min-w-[80px] text-center">{p.name} (Qty)</th>
                    ))}
                    <th scope="col" className="p-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {invoiceRows.map((row, index) => (
                    <InvoiceTableRow 
                      key={row.id} 
                      row={row} 
                      onRowChange={handleRowChange} 
                      onRemoveRow={handleRemoveRow}
                      isOnlyRow={invoiceRows.length === 1}
                      serialNumber={index + 1}
                      products={selectedProducts}
                      customers={merchants}
                    />
                  ))}
                </tbody>
                <InvoiceTableFooter
                  products={selectedProducts}
                  productTotals={totals.productTotals}
                  grandTotal={totals.grandTotal}
                />
              </table>
            </div>
            <button onClick={handleAddRow} className="mt-6 flex items-center justify-center w-full px-4 py-2 border border-dashed border-slate-300 dark:border-slate-600 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
              <PlusIcon />
              Add Another Buyer
            </button>
          </div>
        </main>
        
        <footer className="fixed bottom-0 left-0 right-0 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700">
            <div className="max-w-5xl mx-auto">
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${showCities && includedCitiesList.length > 0 ? 'max-h-48 pt-4 px-4' : 'max-h-0'}`}>
                    <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wider">Click to Exclude Delivery Locations</h4>
                    <div className="flex flex-wrap gap-2 pb-4">
                        {includedCitiesList.map(city => (
                            <span key={city} className="flex items-center bg-indigo-100 dark:bg-indigo-900/50 text-indigo-800 dark:text-indigo-200 text-sm font-medium pl-3 pr-2 py-1 rounded-full">
                                {city}
                                <button 
                                    onClick={() => handleRemoveCity(city)} 
                                    className="ml-2 -mr-1 flex-shrink-0 h-4 w-4 rounded-full inline-flex items-center justify-center text-indigo-500 hover:bg-indigo-200 dark:hover:bg-indigo-800 hover:text-indigo-600 dark:hover:text-indigo-100 focus:outline-none focus:bg-indigo-500 focus:text-white transition-colors"
                                    aria-label={`Remove ${city}`}
                                >
                                    <XIcon className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                <div className="p-4">
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={handleGenerateAndCopy}
                            disabled={!isFormValid}
                            className="flex-1 flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                            >
                            <ClipboardIcon />
                            Copy
                        </button>
                        <button
                            onClick={handleShareOnWhatsApp}
                            disabled={!isFormValid}
                            className="flex-1 flex items-center justify-center px-6 py-4 border border-transparent text-base font-medium rounded-xl shadow-sm text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all transform hover:scale-105"
                            >
                            <WhatsAppIcon />
                            Share
                        </button>
                    </div>
                </div>
            </div>
        </footer>

      </div>
      {allDeliveryLocations.length > 0 && (
        <button
            onClick={() => setShowCities(s => !s)}
            title="Toggle delivery locations"
            className="fixed bottom-36 left-4 z-20 h-14 w-14 flex items-center justify-center bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-slate-900 transition-transform transform hover:scale-110"
            aria-label="Toggle delivery locations"
            aria-expanded={showCities}
        >
            <span className="text-2xl">🚚</span>
        </button>
      )}
      <button
        onClick={() => setIsClearModalOpen(true)}
        title="Clear all fields"
        className="fixed bottom-36 right-4 z-20 h-14 w-14 flex items-center justify-center bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 dark:focus:ring-offset-slate-900 transition-transform transform hover:scale-110"
        aria-label="Clear all fields"
      >
          <RefreshIcon />
      </button>
      <Toast message="Copied to clipboard!" show={showToast} />
      <ConfirmModal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        onConfirm={handleClearAll}
        title="Clear All Fields"
        message="Are you sure you want to clear all data? This action cannot be undone."
      />
    </div>
  );
};

export default App;
