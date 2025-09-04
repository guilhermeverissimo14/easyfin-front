'use client';

import Link from 'next/link';
import { Fragment, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Title } from 'rizzui/typography';
import { Collapse } from 'rizzui/collapse';
import { Tooltip } from 'rizzui';
import cn from '@core/utils/class-names';
import { PiCaretDownBold } from 'react-icons/pi';
import { menuItems } from '@/layouts/hydrogen/menu-items';
import { menuItemsUsers } from './menu-items-users';
import { LocalUser } from '@/types';
import { useSidebar } from '@/app/contexts/sidebar-context';

export function SidebarMenu() {
  const pathname = usePathname();
  const { isCollapsed, toggleSidebar } = useSidebar();
  const user = localStorage.getItem('eas:user');
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const parsedUser: LocalUser | null = user ? (JSON.parse(user) as LocalUser) : null;

  const userRole = parsedUser?.role;
  let itemsToRender;

  if (userRole === ('USER' as string)) {
    itemsToRender = menuItemsUsers;
  } else {
    itemsToRender = menuItems;
  }

  useEffect(() => {
    if (isCollapsed) {
      setOpenDropdown(null);
      return;
    }
    
    const activeDropdown = itemsToRender.find(item => 
      item?.dropdownItems?.some(dropdownItem => dropdownItem.href === pathname)
    );
    if (activeDropdown) {
      setOpenDropdown(activeDropdown.name);
    }
  }, [pathname, itemsToRender, isCollapsed]);

  const handleDropdownToggle = (itemName: string, currentOpen: boolean) => {
    if (isCollapsed) return;
    
    if (currentOpen) {
      setOpenDropdown(null);
    } else {
      setOpenDropdown(itemName);
    }
  };

  const handleCollapsedItemClick = (item: any) => {
    if (item?.dropdownItems && item.dropdownItems.length > 0) {
      toggleSidebar();
      setTimeout(() => {
        setOpenDropdown(item.name);
      }, 100);
    }
  };

  const CollapsedMenuItem = ({ item, isActive, isDropdownOpen }: any) => {
    if (!item?.dropdownItems) {
      return (
        <Tooltip
          size="sm"
          color="invert"
          placement="right"
          content={item.name}
        >
          <Link
            href={item?.href}
            className={cn(
              'group relative mx-3 my-2 flex h-10 w-10 items-center justify-center rounded-md font-medium transition-all duration-200 hover:scale-105',
              isActive
                ? 'before:top-2/5 text-primary bg-primary/10 before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-700/90'
            )}
          >
            {item?.icon && (
              <span
                className={cn(
                  'inline-flex size-5 items-center justify-center [&>svg]:size-5',
                  isActive ? 'text-primary' : 'text-gray-800 dark:text-gray-500 dark:group-hover:text-gray-700'
                )}
              >
                {item?.icon}
              </span>
            )}
          </Link>
        </Tooltip>
      );
    }
 
    return (
      <Tooltip
        size="sm"
        color="invert"
        placement="right"
        content={item.name}
      >
        <div
          onClick={() => handleCollapsedItemClick(item)}
          className={cn(
            'group relative mx-3 my-2 flex h-10 w-10 cursor-pointer items-center justify-center rounded-md font-medium transition-all duration-200 hover:scale-105',
            isActive || isDropdownOpen
              ? 'before:top-2/5 text-primary bg-primary/10 before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary'
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-700/90'
          )}
        >
          {item?.icon && (
            <span
              className={cn(
                'inline-flex size-5 items-center justify-center [&>svg]:size-5',
                isActive || isDropdownOpen ? 'text-primary' : 'text-gray-800 dark:text-gray-500 dark:group-hover:text-gray-700'
              )}
            >
              {item?.icon}
            </span>
          )}
        </div>
      </Tooltip>
    );
  };

  return (
    <div className="mt-4 pb-3 3xl:mt-6">
      {itemsToRender.map((item, index) => {
        const isActive = pathname === (item?.href as string);
        const pathnameExistInDropdowns: any = item?.dropdownItems?.filter((dropdownItem) => dropdownItem.href === pathname);
        const isDropdownOpen = Boolean(pathnameExistInDropdowns?.length);
        const isCurrentlyOpen = openDropdown === item.name;

        return (
          <Fragment key={item.name + '-' + index}>
            {item?.href ? (
              <>
                {isCollapsed ? (
                  <CollapsedMenuItem 
                    item={item} 
                    isActive={isActive || isDropdownOpen} 
                    isDropdownOpen={isDropdownOpen}
                  />
                ) : (
                  <>
                    {item?.dropdownItems ? (
                      <Collapse
                        key={`${item.name}-${isCurrentlyOpen}`}
                        defaultOpen={isCurrentlyOpen}
                        header={({ open, toggle }) => (
                          <div
                            onClick={() => {
                              handleDropdownToggle(item.name, open || false);
                            }}
                            className={cn(
                              'group relative mx-3 flex cursor-pointer items-center justify-between rounded-md px-3 py-2 font-medium lg:my-1 2xl:mx-5 2xl:my-2 transition-all duration-200 hover:scale-[1.01]',
                              isDropdownOpen || isCurrentlyOpen
                                ? 'before:top-2/5 text-primary bg-primary/5 before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary 2xl:before:-start-5'
                                : 'text-gray-700 transition-colors duration-200 hover:bg-gray-100 dark:text-gray-700/90 dark:hover:text-gray-700'
                            )}
                          >
                            <span className="flex items-center">
                              {item?.icon && (
                                <span
                                  className={cn(
                                    'me-2 inline-flex h-5 w-5 items-center justify-center rounded-md [&>svg]:h-[20px] [&>svg]:w-[20px]',
                                    isDropdownOpen ? 'text-primary' : 'text-gray-800 dark:text-gray-500 dark:group-hover:text-gray-700'
                                  )}
                                >
                                  {item?.icon}
                                </span>
                              )}
                              {item.name}
                            </span>
                            <PiCaretDownBold
                              strokeWidth={3}
                              className={cn(
                                'h-3.5 w-3.5 -rotate-90 text-gray-500 transition-transform duration-200 rtl:rotate-90',
                                open && 'rotate-0 rtl:rotate-0'
                              )}
                            />
                          </div>
                        )}
                      >
                        {item?.dropdownItems?.map((dropdownItem, index) => {
                          const isChildActive = pathname === (dropdownItem?.href as string);

                          return (
                            <Link
                              href={dropdownItem?.href}
                              key={dropdownItem?.name + index}
                              className={cn(
                                'mx-3.5 mb-0.5 flex items-center justify-between rounded-md px-3.5 py-2 font-medium last-of-type:mb-1 lg:last-of-type:mb-2 2xl:mx-5 transition-all duration-200 hover:scale-[1.01]',
                                isChildActive
                                  ? 'text-primary'
                                  : 'text-gray-500 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900'
                              )}
                            >
                              <div className="flex items-center truncate">
                                <span className="mr-3 h-1 w-1 rounded-full bg-current opacity-60"></span>
                                <span className="truncate">{dropdownItem?.name}</span>
                              </div>
                            </Link>
                          );
                        })}
                      </Collapse>
                    ) : (
                      <Link
                        href={item?.href}
                        className={cn(
                          'group relative mx-3 my-0.5 flex items-center justify-between rounded-md px-3 py-2 font-medium lg:my-1 2xl:mx-5 2xl:my-2 transition-all duration-200 hover:scale-[1.01]',
                          isActive
                            ? 'before:top-2/5 text-primary bg-primary/5 before:absolute before:-start-3 before:block before:h-4/5 before:w-1 before:rounded-ee-md before:rounded-se-md before:bg-primary 2xl:before:-start-5'
                            : 'text-gray-700 transition-colors duration-200 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-700/90'
                        )}
                      >
                        <div className="flex items-center truncate">
                          {item?.icon && (
                            <span
                              className={cn(
                                'me-2 inline-flex size-5 items-center justify-center rounded-md [&>svg]:size-5',
                                isActive ? 'text-primary' : 'text-gray-800 dark:text-gray-500 dark:group-hover:text-gray-700'
                              )}
                            >
                              {item?.icon}
                            </span>
                          )}
                          <span className="truncate">{item.name}</span>
                        </div>
                      </Link>
                    )}
                  </>
                )}
              </>
            ) : (
              !isCollapsed && (
                <Title
                  as="h6"
                  className={cn(
                    'mb-2 truncate px-6 text-xs font-normal uppercase tracking-widest text-gray-500 2xl:px-8',
                    index !== 0 && 'mt-6 3xl:mt-7'
                  )}
                >
                  {item.name}
                </Title>
              )
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
