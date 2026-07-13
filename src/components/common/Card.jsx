import React from 'react';

const Card = ({ children, variant = 'parchment', className = '', ...props }) => {
  const panelClass = variant === 'parchment' ? 'parchment-panel' : 'dark-panel';
  return (
    <div className={`${panelClass} ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Card;
