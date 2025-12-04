import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import type { SelectOption, Merchant } from '../types';
import { ChevronDownIcon } from './icons';

interface SearchableSelectProps {
  options: (SelectOption | Merchant)[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  wide?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder, wide = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddressFilter, setShowAddressFilter] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState('');
  const [addressSearchTerm, setAddressSearchTerm] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [addressHighlightedIndex, setAddressHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const addressDropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});
  const [addressDropdownStyle, setAddressDropdownStyle] = useState<React.CSSProperties>({});

  const selectedOption = useMemo(() => options.find(opt => opt.id === value), [options, value]);

  const uniqueAddresses = useMemo(() => {
    const addresses = new Set<string>();
    options.forEach(opt => {
      if ('address' in opt && opt.address && opt.address.trim()) {
        addresses.add(opt.address.trim());
      }
    });
    return Array.from(addresses).sort();
  }, [options]);

  const filteredAddresses = useMemo(() => {
    if (!addressSearchTerm.trim()) return uniqueAddresses;
    const searchLower = addressSearchTerm.toLowerCase().trim();
    return uniqueAddresses.filter(address => 
      address.toLowerCase().includes(searchLower)
    );
  }, [uniqueAddresses, addressSearchTerm]);

  const filteredOptions = useMemo(() => {
    let filtered = options;
    
    // Filter by selected address first
    if (selectedAddress) {
      filtered = filtered.filter(opt => 
        'address' in opt && opt.address === selectedAddress
      );
    }
    
    // Then filter by search term (name only)
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(opt => 
        opt.name.toLowerCase().includes(searchLower)
      );
      
      // Sort by match quality - better matches first
      filtered.sort((a, b) => {
        const aName = a.name.toLowerCase();
        const bName = b.name.toLowerCase();
        
        // Exact match comes first
        if (aName === searchLower && bName !== searchLower) return -1;
        if (bName === searchLower && aName !== searchLower) return 1;
        
        // Starts with search term comes next
        const aStarts = aName.startsWith(searchLower);
        const bStarts = bName.startsWith(searchLower);
        if (aStarts && !bStarts) return -1;
        if (bStarts && !aStarts) return 1;
        
        // Earlier position in name comes next
        const aIndex = aName.indexOf(searchLower);
        const bIndex = bName.indexOf(searchLower);
        if (aIndex !== bIndex) return aIndex - bIndex;
        
        // Shorter names come first (more relevant)
        return aName.length - bName.length;
      });
    }
    
    return filtered;
  }, [options, searchTerm, selectedAddress]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current && !wrapperRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
        addressDropdownRef.current && !addressDropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setShowAddressFilter(false);
      }
    }
    if (isOpen || showAddressFilter) {
        document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, showAddressFilter]);
  
  useLayoutEffect(() => {
    if (isOpen || showAddressFilter) {
      const updatePosition = () => {
        if (wrapperRef.current) {
          const rect = wrapperRef.current.getBoundingClientRect();
          
          let dropdownWidth = rect.width;
          if (wide) {
              const widerWidth = Math.max(rect.width * 1.5, 320);
              const maxWidth = window.innerWidth - rect.left - 20; // 20px padding
              dropdownWidth = Math.min(widerWidth, maxWidth);
          }
          
          const style = {
            position: 'fixed' as const,
            top: `${rect.bottom + 4}px`, // 4px margin
            left: `${rect.left}px`,
            width: `${dropdownWidth}px`,
          };
          
          setDropdownStyle(style);
          setAddressDropdownStyle(style);
        }
      };

      updatePosition();
      window.addEventListener('resize', updatePosition);
      document.addEventListener('scroll', updatePosition, true); // Use capture for scrolling parents

      return () => {
        window.removeEventListener('resize', updatePosition);
        document.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpen, showAddressFilter, wide]);

  const handleSelect = (id: string) => {
    onChange(id);
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (showAddressFilter) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setAddressHighlightedIndex(prev => 
            prev < filteredAddresses.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setAddressHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredAddresses.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (addressHighlightedIndex >= 0 && filteredAddresses[addressHighlightedIndex]) {
            handleAddressSelect(filteredAddresses[addressHighlightedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setShowAddressFilter(false);
          setAddressHighlightedIndex(-1);
          inputRef.current?.focus();
          break;
      }
    } else if (isOpen) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (highlightedIndex >= 0 && filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex].id);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
          break;
      }
    } else {
      switch (e.key) {
        case 'ArrowDown':
        case 'Enter':
        case ' ':
          e.preventDefault();
          setIsOpen(true);
          setHighlightedIndex(0);
          break;
      }
    }
  };

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(-1);
  }, [filteredOptions]);

  useEffect(() => {
    setAddressHighlightedIndex(-1);
  }, [filteredAddresses]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!isOpen) setIsOpen(true);
  };

  const handleFocus = () => {
    setIsOpen(true);
  };

  const handleAddressSelect = (address: string) => {
    setSelectedAddress(address);
    setShowAddressFilter(false);
    setSearchTerm('');
    setAddressSearchTerm('');
    setAddressHighlightedIndex(-1);
    inputRef.current?.focus();
  };

  const clearFilters = () => {
    setSelectedAddress('');
    setSearchTerm('');
    setAddressSearchTerm('');
  };

  const handleAddressSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressSearchTerm(e.target.value);
  };
  
  const displayValue = isOpen ? searchTerm : selectedOption?.name || '';

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
         <input
            ref={inputRef}
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={`w-full p-2 pr-20 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm ${!isOpen && selectedOption ? 'truncate' : ''}`}
        />
        <div className="absolute inset-y-0 right-0 flex items-center">
          <button 
            type="button" 
            onClick={() => setShowAddressFilter(!showAddressFilter)}
            className="px-2 text-slate-500 hover:text-indigo-600 text-xs font-medium"
            title="Filter by address"
          >
            📍
          </button>
          <button type="button" onClick={() => setIsOpen(!isOpen)} className="px-2 text-slate-500">
               <ChevronDownIcon className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>
      
      {selectedAddress && (
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span className="text-slate-600 dark:text-slate-400">Filtered by: {selectedAddress}</span>
          <button 
            onClick={clearFilters}
            className="text-red-500 hover:text-red-700"
            title="Clear filter"
          >
            ✕
          </button>
        </div>
      )}

      {showAddressFilter && createPortal(
        <div ref={addressDropdownRef} style={addressDropdownStyle} className="z-50 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
          <div className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-700 border-b border-slate-200 dark:border-slate-600">
            Select Address
          </div>
          <div className="p-2 border-b border-slate-200 dark:border-slate-600">
            <input
              type="text"
              value={addressSearchTerm}
              onChange={handleAddressSearchChange}
              onKeyDown={handleKeyDown}
              placeholder="Search addresses..."
              className="w-full p-2 text-sm bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              autoFocus
            />
          </div>
          <ul className="max-h-40 overflow-y-auto">
            {filteredAddresses.length > 0 ? (
              filteredAddresses.map((address, index) => (
                <li
                  key={address}
                  onClick={() => handleAddressSelect(address)}
                  className={`px-4 py-2 text-sm cursor-pointer text-slate-900 dark:text-white ${
                    index === addressHighlightedIndex 
                      ? 'bg-indigo-100 dark:bg-indigo-800' 
                      : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/50'
                  }`}
                >
                  📍 {address}
                </li>
              ))
            ) : (
              <li className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
                No addresses found
              </li>
            )}
          </ul>
        </div>,
        document.body
      )}
      
      {isOpen && !showAddressFilter && createPortal(
        <ul ref={dropdownRef} style={dropdownStyle} className="z-50 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((opt, index) => (
              <li
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className={`px-4 py-2 text-sm cursor-pointer text-slate-900 dark:text-white ${
                  index === highlightedIndex 
                    ? 'bg-indigo-100 dark:bg-indigo-800' 
                    : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/50'
                }`}
              >
                <div className="truncate font-medium">{opt.name}</div>
                {'address' in opt && opt.address && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate mt-1">
                    📍 {opt.address}
                  </div>
                )}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400">
              {selectedAddress ? 'No merchants found in this address' : 'Start typing to search names...'}
            </li>
          )}
        </ul>,
        document.body
      )}
    </div>
  );
};