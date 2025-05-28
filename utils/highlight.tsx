import React from 'react';

export const highlightText = (text: string, keyword: string) => {
    if (!keyword.trim()) return text;
    
    const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
    return parts.map((part, index) => 
        part.toLowerCase() === keyword.toLowerCase() 
            ? <span key={index} style={{ color:'var(--theme-color)'}}>{part}</span>
            : part
    );
}; 