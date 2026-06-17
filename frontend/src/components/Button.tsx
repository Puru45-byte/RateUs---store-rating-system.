import React, { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline';
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold px-5 py-2.5 rounded-btn text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none';
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-dark shadow-sm shadow-primary/10',
    outline: 'bg-surface border border-border text-heading hover:bg-surface-soft hover:border-muted/30',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
