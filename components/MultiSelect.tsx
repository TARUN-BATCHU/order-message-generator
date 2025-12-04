import React, { useState, useRef, useEffect, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import type { SelectOption } from '../types';
import { ChevronDownIcon } from './icons';

interface MultiSelectProps {
  options: SelectOption[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({ options, selectedIds, onToggle }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [dropdownStyle, setDropdownStyle] = useState<React.CSSProperties>({});

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
          setDropdownStyle({
            position: 'fixed',
            top: `${rect.bottom + 4}px`, // 4px margin
            left: `${rect.left}px`,
            width: `${rect.width}px`,
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
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      switch (e.key) {
        case 'ArrowDown':
        case 'Enter':
        case ' ':
          e.preventDefault();
          setIsOpen(true);
          setHighlightedIndex(0);
          break;
      }
    } else {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev < options.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex(prev => 
            prev > 0 ? prev - 1 : options.length - 1
          );
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (highlightedIndex >= 0 && options[highlightedIndex]) {
            onToggle(options[highlightedIndex].id);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setHighlightedIndex(-1);
          buttonRef.current?.focus();
          break;
      }
    }
  };

  // Reset highlighted index when dropdown opens
  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
    } else {
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  const displayLabel = selectedIds.length === 0
    ? 'Select products...'
    : selectedIds.length === 1
    ? `${options.find(o => o.id === selectedIds[0])?.name}`
    : `${selectedIds.length} products selected`;

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="w-full flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDownIcon className={`h-5 w-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && createPortal(
        <div ref={dropdownRef} style={dropdownStyle} className="z-50 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {options.map((opt, index) => (
            <label
              key={opt.id}
              className={`flex items-center px-4 py-2 text-sm cursor-pointer text-slate-900 dark:text-white ${
                index === highlightedIndex 
                  ? 'bg-indigo-100 dark:bg-indigo-800' 
                  : 'hover:bg-indigo-50 dark:hover:bg-indigo-900/50'
              }`}
            >
              <input
                type="checkbox"
                checked={selectedIds.includes(opt.id)}
                onChange={() => onToggle(opt.id)}
                className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                tabIndex={-1}
              />
              <span className="ml-3">{opt.name}</span>
            </label>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
};