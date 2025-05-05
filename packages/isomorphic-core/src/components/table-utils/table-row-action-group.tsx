"use client";
import { ActionIcon, Button, Flex, Tooltip } from "rizzui";

import EyeIcon from "@core/components/icons/eye";
import PencilIcon from "@core/components/icons/pencil";
import DeletePopover from "../delete-popover";
import ImageIcon from "../icons/image-solid";
import CommentsIcon from "../icons/comments";
import PageBlankIcon from "../icons/page-blank";

export default function TableRowActionGroup({
  openModalEdit,
  openModalList,
  openModalNote,
  openModalImage,
  navigationEdit,
  navigationCopySheet,
  className,
  isVisible,
  copySheet,
  editPayroll = false,
  isVisibleNote = false,
  isVisibleImg = false,
  isVisibleDelete,
  isVisibleEdit,
  deletePopoverTitle,
  deletePopoverDescription,
  onDelete
}: {
  openModalEdit?: () => void;
  openModalList?: () => void;
  openModalNote?: () => void;
  openModalImage?: () => void;
  navigationEdit?: () => void;
  navigationCopySheet?: () => void;
  copySheet?: boolean;
  editPayroll?: boolean;
  editUrl?: string;
  viewUrl?: string;
  className?: string;
  isVisible: boolean;
  isVisibleNote?: boolean;
  isVisibleImg?: boolean;
  isVisibleDelete: boolean;
  isVisibleEdit: boolean;
  deletePopoverTitle?: string | undefined;
  deletePopoverDescription?: string | undefined;
  onDelete?: () => void;
}) {
  return (
    <Flex align="center" justify="end" gap="0" className={className}>
      {isVisibleEdit && (
        <Tooltip size="sm" content="Editar" placement="top" color="invert">
          <Button
            onClick={!editPayroll ? openModalEdit : navigationEdit}
            as="span"
            className=" bg-white cursor-pointer hover:bg-transparent px-2"
          >
            <ActionIcon as="span" size="sm" variant="outline" aria-label="Editar">
              <PencilIcon className="size-4 text-black" />
            </ActionIcon>
          </Button>
        </Tooltip>
      )}

      {isVisible && (
        <Tooltip
          size="sm"
          content="Visualizar"
          placement="top"
          color="invert"
        >
          <Button
            onClick={openModalList}
            as="span"
            className=" bg-white cursor-pointer hover:bg-transparent px-2"
          >
            <ActionIcon
              as="span"
              size="sm"
              variant="outline"
              aria-label="Visualizar"
            >
              <EyeIcon className="size-4 text-black " />
            </ActionIcon>
          </Button>
        </Tooltip>
      )}

      {isVisibleImg && (
        <Tooltip
          size="sm"
          content="Visualizar Comprovante"
          placement="top"
          color="invert"
        >
          <Button
            onClick={openModalImage}
            as="span"
            className=" bg-white cursor-pointer hover:bg-transparent px-2"
          >
            <ActionIcon
              as="span"
              size="sm"
              variant="outline"
              aria-label="Visualizar Comprovante"
            >
              <ImageIcon className="size-4 text-black fill-red-500 " />
            </ActionIcon>
          </Button>
        </Tooltip>
      )}

      {isVisibleNote && (
        <Tooltip
          size="sm"
          content="Adicionar comentário"
          placement="top"
          color="invert"
        >
          <Button
            onClick={openModalNote}
            as="span"
            className=" bg-white cursor-pointer hover:bg-transparent px-2"
          >
            <ActionIcon
              as="span"
              size="sm"
              variant="outline"
              aria-label="Adicionar Nota"
            >
              <CommentsIcon className="size-4 text-black " />
            </ActionIcon>
          </Button>
        </Tooltip>
      )}


      {isVisibleDelete && (
        <DeletePopover
          title={deletePopoverTitle}
          description={deletePopoverDescription}
          onDelete={onDelete}
        />
      )}

      {copySheet && (
          <Tooltip
            size="sm"
            content="Clonar folha"
            placement="top"
            color="invert"
          >
            <Button
              onClick={navigationCopySheet}
              as="span"
              className=" bg-white cursor-pointer hover:bg-transparent px-2"
            >
              <ActionIcon
                as="span"
                size="sm"
                variant="outline"
                aria-label="Clonar folha"
              >
                <PageBlankIcon className="size-4 text-black " />
              </ActionIcon>
            </Button>
          </Tooltip>
      )}

    </Flex>
  );
}
