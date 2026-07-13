import React from 'react';

const Button = ({ children, variant = 'primary', onClick, className = '', disabled, ...props }) => {
  return (
    <button
      className={`btn btn-${variant} ${className}`}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
