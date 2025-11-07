import React, { useState, useMemo, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import type { SelectOption } from '../types';
import { ChevronDownIcon } from './icons';

interface SearchableSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (id: string) => void;
  placeholder?: string;
  wide?: boolean;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({ options, value, onChange, placeholder, wide = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

  const selectedOption = useMemo(() => options.find(opt => opt.id === value), [options, value]);

  const filteredOptions = useMemo(() =>
    options.filter(opt =>
      opt.name.toLowerCase().includes(searchTerm.toLowerCase())
    ), [options, searchTerm]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current && !wrapperRef.current.contains(event.target as Node) &&
        dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);
  
  useLayoutEffect(() => {
    if (isOpen) {
      const updatePosition = () => {
        if (wrapperRef.current) {
          const rect = wrapperRef.current.getBoundingClientRect();
          
          let dropdownWidth = rect.width;
          if (wide) {
              const widerWidth = Math.max(rect.width * 1.5, 320);
              const maxWidth = window.innerWidth - rect.left - 20; // 20px padding
              dropdownWidth = Math.min(widerWidth, maxWidth);
          }
          
          setDropdownStyle({
            position: 'fixed',
            top: `${rect.bottom + 4}px`, // 4px margin
            left: `${rect.left}px`,
            width: `${dropdownWidth}px`,
          });
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
  }, [isOpen, wide]);

  const handleSelect = (id: string) => {
    onChange(id);
    setSearchTerm('');
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
      if(!isOpen) setIsOpen(true);
  }
  
  const displayValue = isOpen ? searchTerm : selectedOption?.name || '';

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
         <input
            type="text"
            value={displayValue}
            onChange={handleInputChange}
            onFocus={() => {
                setIsOpen(true);
                setSearchTerm('');
            }}
            placeholder={placeholder}
            className={`w-full p-2 pr-10 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm ${!isOpen && selectedOption ? 'truncate' : ''}`}
        />
        <button type="button" onClick={() => setIsOpen(!isOpen)} className="absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
             <ChevronDownIcon className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {isOpen && createPortal(
        <ul ref={dropdownRef} style={dropdownStyle} className="z-50 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map(opt => (
              <li
                key={opt.id}
                onClick={() => handleSelect(opt.id)}
                className="px-4 py-2 text-sm cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/50 truncate text-slate-900 dark:text-white"
              >
                {opt.name}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-sm text-slate-500 dark:text-white">No results found</li>
          )}
        </ul>,
        document.body
      )}
    </div>
  );
};