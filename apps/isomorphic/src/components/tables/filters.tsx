'use client';

import { useState } from 'react';
import { useMedia } from 'react-use';
import { Button, Flex } from 'rizzui';
import { PiFunnel} from 'react-icons/pi';
import { FilterDrawerView } from '@core/components/controlled-table/table-filter';
import cn from '@core/utils/class-names';

interface FiltersProps {
  children: React.ReactNode;
}

export default function Filters({ children }: FiltersProps) {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [showFilters, setShowFilters] = useState(true);
  const isLarge = useMedia('(min-width: 768px)', false); 

  return (
    <Flex  className="flex justify-between items-center gap-4">
      <Flex align="center" className="flex justify-between w-1/2">
        {isLarge && showFilters && children}
      </Flex>
      <Flex align="center" className="w-auto">
        <Button
          {...(!isLarge
            ? {
                onClick: () => setOpenDrawer(!openDrawer), 
              }
            : { onClick: () => setShowFilters(!showFilters) })} 
          variant="outline"
          className={cn(
            'h-[34px] pe-3 ps-2.5',
            isLarge && showFilters && 'border-dashed border-gray-700'
          )}
        >
          <PiFunnel className="me-1.5 size-[18px]" strokeWidth={1.7} />
          {isLarge && showFilters ? 'Esconder' : 'Filtros'}
        </Button>

        {!isLarge && (
          <FilterDrawerView
            drawerTitle="Filtros"
            isOpen={openDrawer}
            setOpenDrawer={setOpenDrawer}
          >
            <div className="grid grid-cols-1 gap-6">{children}</div>
          </FilterDrawerView>
        )}
      </Flex>
    </Flex>
  );
}