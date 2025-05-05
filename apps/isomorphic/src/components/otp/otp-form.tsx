'use client';

import { Button, PinCode } from 'rizzui';
import { SubmitHandler } from 'react-hook-form';
import { Form } from '@core/ui/form';

type FormValues = {
  otp: string;
  onVerify: (code: string) => void;
  resendCode?: () => void;
};

export default function OtpForm({
  onVerify,
  resendCode,
  loading,
}: {
  onVerify: (code: string) => void;
  resendCode?: () => void;
  loading?: boolean;
}) {
  const onSubmit: SubmitHandler<FormValues> = (data) => {
    onVerify(data.otp);
  };

  return (
    <Form<FormValues> onSubmit={onSubmit} className="w-full">
      {({ setValue }) => (
        <div className="space-y-5 lg:space-y-7">
          <PinCode
            variant="outline"
            className="lg:justify-start"
            size="lg"
            setValue={(value) => setValue('otp', String(value))}
            length={6}
          />
          <div className="grid grid-cols-1 gap-5 pt-3 sm:grid-cols-2">
            <Button
              className="w-full"
              type="submit"
              size="lg"
              variant="outline"
              onClick={resendCode}
              disabled={loading}
            >
              {loading ? 'Reenviando...' : 'Reenviar Código'}
            </Button>
            <Button
              className="w-full"
              type="submit"
              size="lg"
              disabled={loading}
            >
              {loading ? 'Verificando...' : 'Verificar Código'}
            </Button>
          </div>
        </div>
      )}
    </Form>
  );
}
