'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { z } from 'zod';
import { toast } from "react-toastify";

import { api } from '@/service/api';
import { useModal } from '../modal-views/use-modal';
import { CustomErrorLogin, TaxRateModel } from '@/types';
import { InputField } from '@/components/input/input-field';
import { SelectField } from '@/components/input/select-field';
import { LoadingSpinner } from '@/components/loading-spinner';

const taxRateSchema = z.object({
    year: z
        .string()
        .nonempty('Ano não pode ser vazio')
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 2000 && Number(val) <= 2100, {
            message: 'Ano deve ser um número entre 2000 e 2100',
        }),
    month: z
        .string()
        .nonempty('Mês não pode ser vazio'),
    issqnTaxRate: z
        .string()
        .nonempty('Alíquota ISSQN não pode ser vazia'),
    effectiveTaxRate: z
        .string()
        .nonempty('Alíquota Efetiva não pode ser vazia')
});

type TaxRateFormData = z.infer<typeof taxRateSchema>;

interface EditTaxRateProps {
    id: string;
    getTaxRates: () => void;
}

export const EditTaxRate = ({ id, getTaxRates }: EditTaxRateProps) => {
    const [loading, setLoading] = useState(false);
    const [loadingTaxRate, setLoadingTaxRate] = useState(true);
    const [taxRateDetails, setTaxRateDetails] = useState<TaxRateModel | null>(null);
    
    const { closeModal } = useModal();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        control,
    } = useForm<TaxRateFormData>({
        resolver: zodResolver(taxRateSchema),
    });

    useEffect(() => {
        const fetchTaxRate = async () => {
            setLoadingTaxRate(true);
            try {
                const response = await api.get<TaxRateModel>(`/tax-rates/${id}`);
                setTaxRateDetails(response.data);
                
                // Preencher o formulário com os dados existentes
                setValue('year', response.data.year.toString());
                setValue('month', response.data.month.toString());
                setValue('issqnTaxRate', response.data.issqnTaxRate.toString().replace('.', ','));
                setValue('effectiveTaxRate', response.data.effectiveTaxRate.toString().replace('.', ','));
            } catch (error) {
                toast.error('Erro ao buscar dados da alíquota');
                console.error('Erro ao buscar alíquota:', error);
            } finally {
                setLoadingTaxRate(false);
            }
        };
        
        fetchTaxRate();
    }, [id, setValue]);

    const onSubmit = async (data: TaxRateFormData) => {
        setLoading(true);

        const requestData = {
            year: Number(data.year),
            month: Number(data.month),
            issqnTaxRate: Number(parseFloat(data.issqnTaxRate.replace(',', '.'))),
            effectiveTaxRate: Number(parseFloat(data.effectiveTaxRate.replace(',', '.'))),
        };

        try {
            await api.put(`/tax-rates/${id}`, requestData);

            toast.success('Alíquota atualizada com sucesso!');
            getTaxRates();
            closeModal();
        } catch (error) {
            const err = error as CustomErrorLogin;
            toast.error(err.response?.data?.message || 'Erro ao atualizar alíquota');
            console.log('Erro ao atualizar alíquota', err);
        } finally {
            setLoading(false);
        }
    };

    const monthOptions = [
        { label: 'Janeiro', value: '1' },
        { label: 'Fevereiro', value: '2' },
        { label: 'Março', value: '3' },
        { label: 'Abril', value: '4' },
        { label: 'Maio', value: '5' },
        { label: 'Junho', value: '6' },
        { label: 'Julho', value: '7' },
        { label: 'Agosto', value: '8' },
        { label: 'Setembro', value: '9' },
        { label: 'Outubro', value: '10' },
        { label: 'Novembro', value: '11' },
        { label: 'Dezembro', value: '12' },
    ];

    const formatAsPercentage = (value: string) => {
        let cleaned = value.replace(/[^\d,]/g, '');
    
        const parts = cleaned.split(',');
        if (parts.length > 2) {
            cleaned = parts[0] + ',' + parts[1];
        }

        if (cleaned.includes(',')) {
            const [int, dec] = cleaned.split(',');
            cleaned = int + ',' + dec.slice(0, 2);
        }

        cleaned = cleaned.replace(/^0+(?=\d)/, '');
        return cleaned;
    };

    if (loadingTaxRate) {
        return (
            <div className="flex h-full w-full items-center justify-center p-10">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <form
            className="flex w-[100%] flex-col items-center justify-center"
            onSubmit={handleSubmit(onSubmit)}
        >
            <div className="w-full space-y-5">
                <InputField
                    label="Ano"
                    placeholder="Digite o ano"
                    type="text"
                    register={register('year')}
                    error={errors.year?.message}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setValue('year', value);
                    }}
                />

                <Controller
                    control={control}
                    name="month"
                    render={({ field: { value, onChange } }) => (
                        <SelectField
                            label="Mês"
                            placeholder="Selecione o mês"
                            options={monthOptions}
                            onChange={(selected) => {
                                onChange(selected);
                            }}
                            value={value || ''}
                            error={errors.month?.message}
                        />
                    )}
                />

                <InputField
                    label="Alíquota ISSQN (%)"
                    placeholder="0,00"
                    type="text"
                    register={register('issqnTaxRate')}
                    error={errors.issqnTaxRate?.message}
                    onChange={(e) => {
                        const value = formatAsPercentage(e.target.value);
                        setValue('issqnTaxRate', value);
                    }}
                />

                <InputField
                    label="Alíquota Efetiva (%)"
                    placeholder="0,00"
                    type="text"
                    register={register('effectiveTaxRate')}
                    error={errors.effectiveTaxRate?.message}
                    onChange={(e) => {
                        const value = formatAsPercentage(e.target.value);
                        setValue('effectiveTaxRate', value);
                    }}
                />

                <Button
                    disabled={loading}
                    className="w-full"
                    type="submit"
                    size="lg"
                >
                    <span>{loading ? 'Carregando...' : 'Atualizar'}</span>
                </Button>
            </div>
        </form>
    );
};