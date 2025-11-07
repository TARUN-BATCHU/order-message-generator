import React from 'react';

interface IconProps {
    className?: string;
}

export const ClipboardIcon: React.FC<IconProps> = ({ className = "h-6 w-6 mr-2" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className = "h-5 w-5 mr-2" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
);

export const ChevronDownIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

export const ChevronUpIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
    </svg>
);

export const RefreshIcon: React.FC<IconProps> = ({ className = "h-6 w-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h5M20 20v-5h-5M4 4l1.5 1.5A9 9 0 0120.5 10.5M20 20l-1.5-1.5A9 9 0 003.5 13.5" />
    </svg>
);

export const WhatsAppIcon: React.FC<IconProps> = ({ className = "h-6 w-6 mr-2" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.04 2.01c-5.52 0-9.99 4.47-9.99 9.99 0 1.77.46 3.45 1.29 4.92L2 22l5.25-1.38c1.41.78 3.02 1.24 4.75 1.24h.01c5.52 0 9.99-4.47 9.99-9.99s-4.47-9.99-9.99-9.99zM12.04 20.13h-.01c-1.53 0-3-.39-4.32-1.09l-.31-.18-3.22.84.86-3.14-.2-.32c-.78-1.25-1.19-2.73-1.19-4.28 0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zm4.88-6.13c-.27-.14-1.59-.78-1.84-.87-.25-.09-.43-.14-.61.14-.18.27-.69.87-.85 1.04-.15.18-.3.19-.55.05-.25-.13-1.06-.39-2.02-1.25-.75-.67-1.25-1.5-1.4-1.75-.14-.25-.02-.39.13-.52.13-.13.27-.32.41-.48.14-.16.18-.27.27-.46.09-.18.05-.35-.02-.48s-.61-1.46-.83-2-.45-.44-.61-.45c-.16-.01-.35-.01-.52-.01-.18 0-.46.07-.7.32-.25.25-.94.92-1.21 2.25-.27 1.33.27 2.6.31 2.78.04.18 1.41 2.16 3.43 3.07.49.22.87.35 1.18.45.48.15.91.13 1.25.08.38-.06 1.17-.48 1.33-1.04.16-.56.16-1.04.11-1.13-.04-.09-.18-.14-.45-.27z"/>
    </svg>
);

export const XIcon: React.FC<IconProps> = ({ className = "h-3 w-3" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);
