'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { z } from 'zod';
import { toast } from "react-toastify";

import { api } from '@/service/api';
import { useModal } from '../modal-views/use-modal';
import { CustomErrorLogin } from '@/types';
import { InputField } from '@/components/input/input-field';
import { SelectField } from '@/components/input/select-field';

const bankAccountSchema = z.object({
    bank: z
        .string()
        .nonempty('Nome do banco não pode ser vazio'),
    agency: z
        .string()
        .nonempty('Agência não pode ser vazia'),
    account: z
        .string()
        .nonempty('Número da conta não pode ser vazio'),
    type: z
        .string()
        .nonempty('Tipo de conta não pode ser vazio'),
});

type BankAccountFormData = z.infer<typeof bankAccountSchema>;

interface CreateBankAccountProps {
    getBankAccounts: () => void;
}

export const CreateBankAccount = ({ getBankAccounts }: CreateBankAccountProps) => {
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

    const onSubmit = async (data: BankAccountFormData) => {
        setLoading(true);

        try {
            await api.post('/bank-accounts', data);

            toast.success('Conta bancária cadastrada com sucesso!');
            getBankAccounts();
            closeModal();
        } catch (error) {
            const err = error as CustomErrorLogin;
            toast.error(err.response?.data?.message || 'Erro ao cadastrar conta bancária');
            console.log('Erro ao cadastrar conta bancária', err);
        } finally {
            setLoading(false);
        }
    };

    const accountTypeOptions = [
        { label: 'Conta Corrente', value: 'C' },
        { label: 'Conta Poupança', value: 'P' },
    ];

   
    const formatAgency = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        
        if (cleaned.length <= 4) {
            return cleaned;
        }
        
        return cleaned.slice(0, 4) + '-' + cleaned.slice(4, 5);
    };

    const formatAccount = (value: string) => {
        const cleaned = value.replace(/\D/g, '');
        
        if (cleaned.length <= 5) {
            return cleaned;
        }
        
        const digitPosition = Math.min(cleaned.length - 1, 11);
        return cleaned.slice(0, digitPosition) + '-' + cleaned.slice(digitPosition);
    };

    return (
        <form
            className="flex w-[100%] flex-col items-center justify-center"
            onSubmit={handleSubmit(onSubmit)}
        >
            <div className="w-full space-y-5">
                <InputField
                    label="Banco"
                    placeholder="Digite o nome do banco"
                    type="text"
                    register={register('bank')}
                    error={errors.bank?.message}
                />

                <InputField
                    label="Agência"
                    placeholder="Digite o número da agência"
                    type="text"
                    register={register('agency')}
                    error={errors.agency?.message}
                    onChange={(e) => {
                        const value = formatAgency(e.target.value);
                        setValue('agency', value);
                    }}
                />

                <InputField
                    label="Conta"
                    placeholder="Digite o número da conta"
                    type="text"
                    register={register('account')}
                    error={errors.account?.message}
                    onChange={(e) => {
                        const value = formatAccount(e.target.value);
                        setValue('account', value);
                    }}
                />

                <Controller
                    control={control}
                    name="type"
                    render={({ field: { value, onChange } }) => (
                        <SelectField
                            label="Tipo de Conta"
                            placeholder="Selecione o tipo de conta"
                            options={accountTypeOptions}
                            onChange={(selected) => {
                                onChange(selected);
                            }}
                            value={value || ''}
                            error={errors.type?.message}
                        />
                    )}
                />

                <Button
                    disabled={loading}
                    className="w-full"
                    type="submit"
                    size="lg"
                >
                    <span>{loading ? 'Carregando...' : 'Cadastrar'}</span>
                </Button>
            </div>
        </form>
    );
};