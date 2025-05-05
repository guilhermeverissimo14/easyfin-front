'use client';

import { Title, Text, Button, Popover } from 'rizzui';

type UpdateStatusPopoverProps = {
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  children: React.ReactElement;
};

export default function UpdateStatusPopover({
  title,
  message,
  onConfirm,
  children,
}: UpdateStatusPopoverProps) {
  const handleConfirm = async () => {
    try {
      await onConfirm();
    } catch (error) {
      console.error('Erro ao realizar ação:', error);
    }
  };

  return (
    <Popover placement="left">
      <Popover.Trigger>
        <div style={{ width: '100%', cursor: 'pointer' }}>{children}</div>
      </Popover.Trigger>
      <Popover.Content className="z-10">
        {({ setOpen }) => (
          <div className="w-56 pb-2 pt-1 text-left rtl:text-right">
            <Title
              as="h6"
              className="mb-0.5 flex items-start text-sm text-gray-700 sm:items-center"
            >
              {title}
            </Title>
            <Text className="mb-2 leading-relaxed text-gray-500">
              {message}
            </Text>
            <div className="flex items-center justify-end">
              <Button
                size="sm"
                className="me-1.5 h-7"
                onClick={async () => {
                  await handleConfirm();
                  setOpen(false);
                }}
              >
                Sim
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-7"
                onClick={() => setOpen(false)}
              >
                Não
              </Button>
            </div>
          </div>
        )}
      </Popover.Content>
    </Popover>
  );
}