'use client';

import * as React from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface MultiSelectOption {
  value: string;
  label: string;
}

interface MultiSelectProps {
  options: MultiSelectOption[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  'data-field'?: string;
  'aria-invalid'?: boolean;
}

export function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Seleccionar opciones',
  className,
  disabled = false,
  'data-field': dataField,
  'aria-invalid': ariaInvalid,
  ...props
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleOptionToggle = (optionValue: string) => {
    const newValue = value.includes(optionValue)
      ? value.filter(v => v !== optionValue)
      : [...value, optionValue];
    onValueChange(newValue);
  };

  const handleRemoveOption = (optionValue: string) => {
    onValueChange(value.filter(v => v !== optionValue));
  };

  const selectedOptions = options.filter(option =>
    value.includes(option.value)
  );
  const unselectedOptions = options.filter(
    option => !value.includes(option.value)
  );

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <div
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-none border px-3 py-1 text-base shadow-none transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            // Thicker blue border on focus without outer ring to match other inputs
            'focus:border-2 focus-visible:border-2',
            'focus:!ring-0 focus:!ring-transparent focus:!border-primary',
            'focus-visible:!ring-0 focus-visible:!ring-transparent focus-visible:!border-primary',
            'aria-invalid:!border-destructive aria-invalid:!border-2',
            'touch-manipulation cursor-pointer',
            // Use card background to match form card
            'bg-card text-card-foreground border-border',
            className
          )}
          role="button"
          tabIndex={0}
          data-field={dataField}
          aria-invalid={ariaInvalid}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          {...props}
        >
          <div className="flex gap-1 flex-1 min-w-0 overflow-hidden">
            {selectedOptions.length > 0 ? (
              selectedOptions.map(option => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="text-xs px-2 py-0.5 whitespace-nowrap"
                >
                  {option.label}
                  <button
                    type="button"
                    onClick={e => {
                      e.stopPropagation();
                      handleRemoveOption(option.value);
                    }}
                    className="ml-1 hover:bg-muted-foreground/20 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))
            ) : (
              <span className="text-muted-foreground">{placeholder}</span>
            )}
          </div>
          <ChevronDown
            className={cn(
              'size-4 opacity-50 transition-transform',
              isOpen && 'rotate-180'
            )}
          />
        </div>
      </PopoverTrigger>
      <PopoverContent
        className={cn(
          'w-full p-0',
          'bg-card text-card-foreground border-border'
        )}
        align="start"
      >
        <div className="max-h-60 overflow-y-auto">
          {unselectedOptions.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Todas las opciones seleccionadas
            </div>
          ) : (
            unselectedOptions.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleOptionToggle(option.value)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors',
                  'focus:outline-none focus:bg-accent focus:text-accent-foreground'
                )}
              >
                <span>{option.label}</span>
                <Check className="w-4 h-4 opacity-0" />
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
