"use client";
import { ActionIcon, Button, Flex, Tooltip } from "rizzui";
import EyeIcon from "@core/components/icons/eye";
import PencilIcon from "@core/components/icons/pencil";
import DeletePopoverWithLoading from "@/components/delete-popover-with-loading";
import { PiLinkBold } from "react-icons/pi";

export default function CashBookTableRowActionGroup({
  openModalEdit,
  openModalLink,
  openModalList,
  className,
  isVisible,
  isVisibleDelete,
  isVisibleEdit,
  isLink,
  deletePopoverTitle,
  deletePopoverDescription,
  onDelete,
}: {
  openModalEdit?: () => void;
  openModalList?: () => void;
  openModalLink?: () => void;
  className?: string;
  isVisible: boolean;
  isVisibleDelete: boolean;
  isVisibleEdit: boolean;
  isLink?: boolean;
  deletePopoverTitle?: string | undefined;
  deletePopoverDescription?: string | undefined;
  onDelete?: () => Promise<void>;
}) {
  return (
    <Flex align="center" justify="end" gap="0" className={className}>

      {isLink && (
         <Tooltip size="sm" content="Vincular Conta" placement="top" color="invert">
                  <Button
                    onClick={openModalLink} as="span" 
                    className=" bg-white cursor-pointer hover:bg-transparent px-2"
                  >
                     <ActionIcon as="span" size="sm" variant="outline" aria-label="Vincular">
                        <PiLinkBold size={16} className="text-gray-500 hover:text-gray-700" />
                     </ActionIcon>
                  </Button>
               </Tooltip>
      )}

      {isVisibleEdit && (
        <Tooltip size="sm" content="Editar" placement="top" color="invert">
          <Button onClick={openModalEdit} as="span" className=" bg-white cursor-pointer hover:bg-transparent px-2">
            <ActionIcon as="span" size="sm" variant="outline" aria-label="Editar">
              <PencilIcon className="size-4 text-gray-500 hover:text-gray-700" />
            </ActionIcon>
          </Button>
        </Tooltip>
      )}

      {isVisible && (
        <Tooltip size="sm" content="Visualizar" placement="top" color="invert">
          <Button onClick={openModalList} as="span" className=" bg-white cursor-pointer hover:bg-transparent px-2">
            <ActionIcon as="span" size="sm" variant="outline" aria-label="Visualizar">
              <EyeIcon className="size-4 text-gray-500 hover:text-gray-700" />
            </ActionIcon>
          </Button>
        </Tooltip>
      )}

      {isVisibleDelete && (
        <DeletePopoverWithLoading 
          title={deletePopoverTitle} 
          description={deletePopoverDescription} 
          onDelete={onDelete} 
        />
      )}

    </Flex>
  );
}
