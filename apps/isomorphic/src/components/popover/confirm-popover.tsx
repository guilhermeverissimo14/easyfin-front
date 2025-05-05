"use client";

import { Title, Text, Button, Popover } from "rizzui";
import { PiWarningBold } from "react-icons/pi";

type ConfirmPopoverProps = {
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  children: any;
};

export default function ConfirmPopover({
  title,
  description,
  onConfirm,
  confirmText = "Sim",
  cancelText = "Não",
  children,
}: ConfirmPopoverProps) {
  return (
    <Popover placement="top">
      <Popover.Trigger>{children}</Popover.Trigger>
      <Popover.Content className="z-10">
        {({ setOpen }) => (
          <div className="w-64 pb-2 pt-1 text-left rtl:text-right">
            <Title
              as="h6"
              className="mb-0.5 flex items-start text-sm text-gray-700 sm:items-center"
            >
              <PiWarningBold className="me-1 size-[17px] text-yellow-500" />{" "}
              {title}
            </Title>
            <Text className="mb-2 leading-relaxed text-gray-500">
              {description}
            </Text>
            <div className="flex items-center justify-end">
              <Button
                size="sm"
                className="me-1.5 h-7"
                onClick={() => {
                  onConfirm();
                  setOpen(false);
                }}
              >
                {confirmText}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7"
                onClick={() => setOpen(false)}
              >
                {cancelText}
              </Button>
            </div>
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
}