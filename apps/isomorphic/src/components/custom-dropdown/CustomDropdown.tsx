'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { Tooltip } from 'rizzui';
import cn from '@core/utils/class-names';

interface DropdownItem {
  name: string;
  href: string;
  icon?: React.ReactNode;
}

interface MenuItem {
  name: string;
  icon?: React.ReactNode;
  dropdownItems?: DropdownItem[];
}

interface CustomDropdownProps {
  item: MenuItem;
  isActive: boolean;
  pathname: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const CustomDropdown = ({ item, isActive, pathname, isOpen, onToggle, onClose }: CustomDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    onToggle();
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      onClose();
    }, 150);
  };

  const handleClick = () => {
    onToggle();
  };

  const handleItemClick = () => {
    onClose();
  };

  const hasActiveChild = item?.dropdownItems?.some(dropdownItem => dropdownItem.href === pathname);
  const shouldShowAsActive = isActive || hasActiveChild;

  return (
    <div className="relative" ref={dropdownRef}>
      <Tooltip
        size="sm"
        color="invert"
        placement="right"
        content={item.name}
      >
        <div
          onClick={handleClick}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(
            'group relative mx-3 my-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-md font-medium transition-all duration-200 hover:scale-105',
            shouldShowAsActive || isOpen
              ? 'before:top-2/5 text-primary bg-primary/10 before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-700/90'
          )}
        >
          {item?.icon && (
            <span
              className={cn(
                'inline-flex size-5 items-center justify-center [&>svg]:size-5',
                shouldShowAsActive || isOpen ? 'text-primary' : 'text-gray-800 dark:text-gray-500 dark:group-hover:text-gray-700'
              )}
            >
              {item?.icon}
            </span>
          )}
        </div>
      </Tooltip>

      {isOpen && (
        <div
          className="absolute left-full top-0 ml-2 w-56 rounded-md border border-gray-200 bg-white p-3 shadow-lg z-50 dark:bg-gray-800 dark:border-gray-700"
          onMouseEnter={() => {
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
          }}
          onMouseLeave={handleMouseLeave}
        >
          <div className="space-y-1">
            <div className="px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 border-b border-gray-100 dark:border-gray-600 mb-2">
              <div className="flex items-center gap-2">
                {item?.icon && (
                  <span className="inline-flex size-4 items-center justify-center [&>svg]:size-4 text-primary">
                    {item?.icon}
                  </span>
                )}
                {item.name}
              </div>
            </div>
            {item?.dropdownItems?.map((dropdownItem: DropdownItem, index: number) => {
              const isChildActive = pathname === dropdownItem.href;
              return (
                <Link
                  key={dropdownItem.name + index}
                  href={dropdownItem.href}
                  onClick={handleItemClick}
                  className={cn(
                    'flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:scale-[1.02] w-full',
                    isChildActive
                      ? 'bg-primary/10 text-primary border-l-2 border-primary'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                  )}
                >
                  {dropdownItem?.icon && (
                    <span
                      className={cn(
                        'me-3 inline-flex size-4 items-center justify-center [&>svg]:size-4',
                        isChildActive ? 'text-primary' : 'text-gray-600 dark:text-gray-400'
                      )}
                    >
                      {dropdownItem?.icon}
                    </span>
                  )}
                  <span className="truncate">{dropdownItem?.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};