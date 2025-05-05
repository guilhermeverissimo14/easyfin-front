'use client';

import { Controller, useForm } from 'react-hook-form';
import { DatePicker } from '@core/ui/datepicker';
import { PayrollInput } from '@/components/input/payroll-input';
import { PayrollSelect } from '@/components/input/payroll-select';
import { useEffect, useState } from 'react';
import { OptionsSelect, userType } from '@/types';
import { api } from '@/service/api';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from "react-toastify";

const userSchema = z.object({
  userId: z.string().nonempty('Usuário não pode ser vazio'),
  month: z.number().min(1, 'Mês não pode ser menor que 1'),
  year: z.number().min(4, 'Ano não pode ser menor que 4'),
});

type UserFormData = z.infer<typeof userSchema>;

export interface SecondBlockProps {
  userId: string;
  month: number;
  year: number;
  totalCommission: number;
  totalGrossValue: number;
}

export default function SecondBlock({ onDataChange, userDetails, isEdit, monthProp, yearProp }:
  {
    onDataChange: (data: SecondBlockProps) => void,
    userDetails: userType | null;
    isEdit?: boolean;
    monthProp: number;
    yearProp: number
  }
) {
  const [collaboratorOptions, setCollaboratorOptions] = useState<OptionsSelect[]>([]);
  const [totalCommission, setTotalCommission] = useState(0);
  const [totalGrossValue, setTotalGrossValue] = useState(0);

  const { control, watch, setValue, handleSubmit } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      userId: '',
      month: isEdit ? monthProp : new Date().getMonth() + 1,
      year: isEdit ? yearProp : new Date().getFullYear(),
    },
  });

  const selectedUserId = watch('userId');
  const selectedDate = watch(['month', 'year']);

  async function getUsers() {
    try {
      const response = await api.get<userType[]>('/users');
      if (!response) return;

      const usersFiltered = response.data
        .filter((user) => user.role === 'LOCAL_MANAGER' || user.role === 'PILOT')
        .map((user) => ({
          label: user.name,
          value: user.id,
        }));

      setCollaboratorOptions(usersFiltered);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  }


  async function onSubmit(data: UserFormData) {
    try {
      const response = await api.post('/payrolls/commission', data);

      setTotalCommission(response.data.totalCommission);
      setTotalGrossValue(response.data.totalHectares);

    } catch (error) {
      toast.error('Erro ao enviar dados');
      console.error('Erro ao enviar dados:', error);
    }
  }

  function convertRoles(role: string) {
    switch (role) {
      case 'ADMIN':
        return 'Administrador';
      case 'MANAGER':
        return 'Gerente';
      case 'LOCAL_MANAGER':
        return 'Gerente Local';
      case 'PILOT':
        return 'Piloto';
      case 'FINANCIAL':
        return 'Financeiro';
      default:
        return role;
    }
  }

  useEffect(() => {
    getUsers();
  }, []);

  useEffect(() => {
    if (userDetails) {
      setValue('userId', userDetails.id);
    }
  }, [userDetails, setValue]);

  useEffect(() => {
    if (isEdit && monthProp && yearProp) {
      setValue('month', monthProp); 
      setValue('year', yearProp);   
    }
  }, [isEdit, monthProp, yearProp]);

  useEffect(() => {
  
    if (selectedUserId && selectedDate[0] && selectedDate[1]) {
      onDataChange({
        userId: selectedUserId,
        month: selectedDate[0],
        year: selectedDate[1],
        totalCommission,
        totalGrossValue,
      });
      handleSubmit(onSubmit)();
    }
  }, [selectedUserId, selectedDate, handleSubmit, onDataChange, totalCommission, totalGrossValue]);

  return (
    <div className="md:mt-12 mt-6 flex flex-col justify-between md:flex-row md:gap-8 gap-2">
      <div className="space-y-0.5">

        <PayrollInput
          value="Colaborador:"
          inputClassName="font-medium hover:border-transparent"
          readOnly
        />

        {isEdit ? (
          <PayrollInput
            value={userDetails?.name || ""}
            inputClassName="font-medium hover:border-transparent"
            readOnly
          />
        ) : (
          <Controller
            name="userId"
            control={control}
            render={({ field: { value, onChange } }) => (
              <PayrollSelect
                options={collaboratorOptions}
                value={value}
                onChange={(value: string) => onChange(value)}
              />
            )}
          />
        )}

        <div style={{ marginTop: 32 }}>
          {userDetails?.phone && (
            <>
              <PayrollInput
                value={userDetails.phone}
                inputClassName="font-medium hover:border-transparent"
                readOnly
              />
            </>
          )}

          {userDetails && userDetails?.email && (
            <>
              <PayrollInput
                value={userDetails.email}
                inputClassName="font-medium hover:border-transparent"
                readOnly
              />
            </>
          )}

          {userDetails && (
            <>
              <PayrollInput
                value="Guanhães, MG"
                inputClassName="font-medium hover:border-transparent"
                readOnly
              />
            </>
          )}
        </div>

      </div>

      <div className="space-y-0.5 md:[&_input]:text-end">

        <PayrollInput
          value="Referente a:"
          inputClassName="font-medium hover:border-transparent"
          readOnly
        />

        <Controller
          name="month"
          control={control}
          render={({ field: { value, onChange } }) => (
            <DatePicker
              selected={new Date(selectedDate[1], selectedDate[0] - 1)}
              onChange={(date: Date | null) => {
                if (date) {
                  onChange( date.getMonth() + 1);
                  setValue('year', date.getFullYear());
                }
              }}
              dateFormat="MMMM, yyyy"
              locale={ptBR}
              placeholderText={format(new Date(), 'MMMM, yyyy', { locale: ptBR })}
              inputProps={{
                inputClassName:
                  'shadow-none ring-0 h-auto py-1 md:ml-0 border border-gray-400 md:border-transparent hover:border-primary px-2 text-gray-900 dark:text-gray-0',
                prefixClassName: 'hidden',
              }}
            />
          )}
        />

        <div style={{ marginTop: 32 }}>
          {userDetails && userDetails?.role && (
            <>
              <PayrollInput
                value="Função:"
                inputClassName="font-medium hover:border-transparent"
                readOnly
              />

              <PayrollInput
                value={convertRoles(userDetails.role)}
                inputClassName="font-medium hover:border-transparent"
                readOnly
              />
            </>
          )}
        </div>

      </div>
    </div>
  );
}