"use client";

import { useState } from "react";
import { Title, Text, ActionIcon, Button, Popover, Tooltip } from "rizzui";
import TrashIcon from "@core/components/icons/trash";
import { PiTrashFill, PiSpinner } from "react-icons/pi";

type DeletePopoverWithLoadingProps = {
  title: string | undefined;
  description: string | undefined;
  onDelete?: () => Promise<void>;
};

export default function DeletePopoverWithLoading({ 
  title, 
  description, 
  onDelete 
}: DeletePopoverWithLoadingProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (setOpen: (open: boolean) => void) => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await onDelete?.();
      setOpen(false);
    } catch (error) {
      console.error('Erro na exclusão:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Tooltip size="sm" content="Remover" placement="top" color="invert">
      <Popover placement="left">
        <Popover.Trigger>
          <ActionIcon 
            size="sm" 
            variant="outline" 
            aria-label={"Delete Item"} 
            className="cursor-pointer"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <PiSpinner className="size-4 text-gray-500 animate-spin" />
            ) : (
              <TrashIcon className="size-4 text-gray-500 hover:text-gray-700" />
            )}
          </ActionIcon>
        </Popover.Trigger>
        <Popover.Content className="z-10">
          {({ setOpen }) => (
            <div className="w-56 pb-2 pt-1 text-left rtl:text-right">
              <Title as="h6" className="mb-0.5 flex items-start text-sm text-gray-700 sm:items-center">
                <PiTrashFill className="me-1 size-[17px]" /> {title}
              </Title>
              <Text className="mb-2 leading-relaxed text-gray-500">{description}</Text>
              <div className="flex items-center justify-end">
                <Button
                  size="sm"
                  className="me-1.5 h-7"
                  onClick={() => handleDelete(setOpen)}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <PiSpinner className="me-1 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    'Sim'
                  )}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-7" 
                  onClick={() => setOpen(false)}
                  disabled={isDeleting}
                >
                  Não
                </Button>
              </div>
            </div>
          )}
        </Popover.Content>
      </Popover>
    </Tooltip>
  );
}
