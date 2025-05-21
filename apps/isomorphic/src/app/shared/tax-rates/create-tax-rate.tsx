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

interface CreateTaxRateProps {
    getTaxRates: () => void;
}

export const CreateTaxRate = ({ getTaxRates }: CreateTaxRateProps) => {
    const [loading, setLoading] = useState(false);
    const { closeModal } = useModal();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
        control,
    } = useForm<TaxRateFormData>({
        resolver: zodResolver(taxRateSchema),
        defaultValues: {
            year: new Date().getFullYear().toString(),
        },
    });

    const onSubmit = async (data: TaxRateFormData) => {
        setLoading(true);

        const requestData = {
            year: Number(data.year),
            month: Number(data.month),
            issqnTaxRate: Number(parseFloat(data.issqnTaxRate.replace(',', '.'))),
            effectiveTaxRate: Number(parseFloat(data.effectiveTaxRate.replace(',', '.'))),
        };

        try {
            await api.post('/tax-rates', requestData);

            toast.success('Alíquota cadastrada com sucesso!');
            getTaxRates();
            closeModal();
        } catch (error) {
            const err = error as CustomErrorLogin;
            toast.error(err.response?.data?.message || 'Erro ao cadastrar alíquota');
            console.log('Erro ao cadastrar alíquota', err);
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
                    <span>{loading ? 'Carregando...' : 'Cadastrar'}</span>
                </Button>
            </div>
        </form>
    );
};