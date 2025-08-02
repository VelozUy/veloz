'use client';

import * as React from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  getBackgroundClasses,
  type SectionType,
  type PriorityLevel,
} from '@/lib/background-utils';
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
  priority?: PriorityLevel;
  sectionType?: SectionType;
  disabled?: boolean;
  'data-field'?: string;
}

export function MultiSelect({
  options,
  value,
  onValueChange,
  placeholder = 'Seleccionar opciones',
  className,
  priority = 'medium',
  sectionType = 'form',
  disabled = false,
  'data-field': dataField,
  ...props
}: MultiSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const backgroundClasses = getBackgroundClasses(sectionType, priority);

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
            'flex h-auto min-h-9 w-full items-center justify-between rounded-none border px-3 py-2 text-base shadow-none transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'aria-invalid:ring-destructive/20 aria-invalid:border-destructive',
            'touch-manipulation cursor-pointer',
            backgroundClasses.background,
            backgroundClasses.text,
            backgroundClasses.border,
            backgroundClasses.shadow,
            className
          )}
          role="button"
          tabIndex={0}
          data-field={dataField}
          onKeyDown={e => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          }}
          {...props}
        >
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {selectedOptions.length > 0 ? (
              selectedOptions.map(option => (
                <Badge
                  key={option.value}
                  variant="secondary"
                  className="text-xs px-2 py-1"
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
          backgroundClasses.background,
          backgroundClasses.border,
          backgroundClasses.shadow
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
