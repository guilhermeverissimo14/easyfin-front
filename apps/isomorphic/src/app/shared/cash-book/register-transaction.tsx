'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { z } from 'zod';
import { toast } from 'react-toastify';

import { api } from '@/service/api';
import { useModal } from '../modal-views/use-modal';
import { InputField } from '@/components/input/input-field';
import { SelectField } from '@/components/input/select-field';
import { moneyMask } from '@/utils/format';

const bankAccountSchema = z.object({
   type: z.string().nonempty('Tipo de lançamento não pode ser vazio'),
   value: z.string().nonempty('Valor não pode ser vazio'),
   costCenter: z.string().optional(),
});

type BankAccountFormData = z.infer<typeof bankAccountSchema>;

interface RegisterTransactionProps {
   getCashBook: () => void;
}

export const RegisterTransaction = ({ getCashBook }: RegisterTransactionProps) => {
   const [loading, setLoading] = useState(false);
   const { closeModal } = useModal();

   const {
      register,
      handleSubmit,
      setValue,
      formState: { errors },
      control,
   } = useForm<BankAccountFormData>({
      resolver: zodResolver(bankAccountSchema),
   });

   const onSubmit = async (data: BankAccountFormData) => {};

   const accountTypeOptions = [
      { label: 'Débito', value: 'D' },
      { label: 'Crédito', value: 'C' },
   ];

   const costCenterOptions = [
      { label: 'Despesas Refeição', value: 'Despesas Refeição' },
      { label: 'Compras', value: 'Compras' },
      { label: 'Fornecedores', value: 'Fornecedores' },
      { label: 'Fretes Transportes', value: 'Fretes Transportes' },
   ];

   return (
      <form className="flex w-[100%] flex-col items-center justify-center" onSubmit={handleSubmit(onSubmit)}>
         <div className="w-full space-y-5">
            <div className="flex flex-col items-end justify-center space-y-1">
               <span className="font-semibold">Banco do Brasil</span>
               <span className="text-sm">Ag. 1234 - CC 56789-0</span>
            </div>
            <Controller
               control={control}
               name="type"
               render={({ field: { value, onChange } }) => (
                  <SelectField
                     label="Tipo "
                     placeholder="Selecione o tipo do lançamento"
                     options={accountTypeOptions}
                     onChange={(selected) => {
                        onChange(selected);
                     }}
                     value={value || ''}
                     error={errors.type?.message}
                  />
               )}
            />

            <InputField
               label="Valor"
               placeholder="Informe o valor"
               type="text"
               register={register('value')}
               error={errors.value?.message}
               onChange={(e) => {
                  const value = moneyMask(e.target.value);
                  setValue('value', value);
               }}
            />

            <Controller
               control={control}
               name="costCenter"
               render={({ field: { value, onChange } }) => (
                  <SelectField
                     label="Centro de Custo "
                     placeholder="Selecione o centro de custo"
                     options={costCenterOptions}
                     onChange={(selected) => {
                        onChange(selected);
                     }}
                     value={value || ''}
                     error={errors.costCenter?.message}
                  />
               )}
            />

            <Button disabled={loading} className="w-full" type="submit" size="lg">
               <span>{loading ? 'Carregando...' : 'Cadastrar'}</span>
            </Button>
         </div>
      </form>
   );
};
