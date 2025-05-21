'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { z } from 'zod';
import { toast } from "react-toastify";

import { api } from '@/service/api';
import { useModal } from '../modal-views/use-modal';
import { BankAccount, CustomErrorLogin } from '@/types';
import { InputField } from '@/components/input/input-field';
import { SelectField } from '@/components/input/select-field';
import { LoadingSpinner } from '@/components/loading-spinner';

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

interface EditBankAccountProps {
    id: string;
    getBankAccounts: () => void;
}

export const EditBankAccount = ({ id, getBankAccounts }: EditBankAccountProps) => {
    const [loading, setLoading] = useState(false);
    const [loadingAccount, setLoadingAccount] = useState(true);
    const [bankAccountDetails, setBankAccountDetails] = useState<BankAccount | null>(null);
    
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

    useEffect(() => {
        const fetchBankAccount = async () => {
            setLoadingAccount(true);
            try {
                const response = await api.get<BankAccount>(`/bank-accounts/${id}`);
                setBankAccountDetails(response.data);
                
                setValue('bank', response.data.bank);
                setValue('agency', response.data.agency);
                setValue('account', response.data.account);
                setValue('type', response.data.type);
            } catch (error) {
                toast.error('Erro ao buscar dados da conta bancária');
                console.error('Erro ao buscar conta bancária:', error);
            } finally {
                setLoadingAccount(false);
            }
        };
        
        fetchBankAccount();
    }, [id, setValue]);

    const onSubmit = async (data: BankAccountFormData) => {
        setLoading(true);

        try {
            await api.put(`/bank-accounts/${id}`, data);

            toast.success('Conta bancária atualizada com sucesso!');
            getBankAccounts();
            closeModal();
        } catch (error) {
            const err = error as CustomErrorLogin;
            toast.error(err.response?.data?.message || 'Erro ao atualizar conta bancária');
            console.log('Erro ao atualizar conta bancária', err);
        } finally {
            setLoading(false);
        }
    };

    const accountTypeOptions = [
        { label: 'Conta Corrente', value: 'C' },
        { label: 'Conta Poupança', value: 'S' },
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

    if (loadingAccount) {
        return (
            <div className="flex h-full w-full items-center justify-center p-10">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="mx-auto rounded-lg shadow-md">
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
                    onClick={handleSubmit(onSubmit)}
                    disabled={loading}
                    className="w-full"
                    type="submit"
                    size="lg"
                >
                    <span>{loading ? 'Carregando...' : 'Salvar'}</span>
                </Button>
            </div>
        </div>
    );
};