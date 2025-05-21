'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { z } from 'zod';
import { toast } from "react-toastify";

import { api } from '@/service/api';
import { useModal } from '../modal-views/use-modal';
import { CustomErrorLogin, PaymentTermModel } from '@/types';
import { InputField } from '@/components/input/input-field';
import { LoadingSpinner } from '@/components/loading-spinner';

const paymentTermSchema = z.object({
    description: z
        .string()
        .min(3, 'Descrição deve ter no mínimo 3 caracteres')
        .nonempty('Descrição não pode ser vazia'),
    term: z
        .string()
        .nonempty('Prazo não pode ser vazio')
        .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
            message: 'Prazo deve ser um número positivo',
        }),
    tax: z
        .string()
        .default('0')
        .refine((val) => !isNaN(Number(val.replace(',', '.'))) && Number(val.replace(',', '.')) >= 0 && Number(val.replace(',', '.')) <= 100, {
            message: 'Taxa deve ser um número entre 0 e 100',
        }),
});

type PaymentTermFormData = z.infer<typeof paymentTermSchema>;

interface EditPaymentTermProps {
    id: string;
    getPaymentTerms: () => void;
}

export const EditPaymentTerm = ({ id, getPaymentTerms }: EditPaymentTermProps) => {
    const [loading, setLoading] = useState(false);
    const [loadingPaymentTerm, setLoadingPaymentTerm] = useState(true);
    const [paymentTermDetails, setPaymentTermDetails] = useState<PaymentTermModel | null>(null);
    
    const { closeModal } = useModal();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<PaymentTermFormData>({
        resolver: zodResolver(paymentTermSchema),
    });

    // Buscar dados da condição de pagamento existente
    useEffect(() => {
        const fetchPaymentTerm = async () => {
            setLoadingPaymentTerm(true);
            try {
                const response = await api.get<PaymentTermModel>(`/payment-terms/${id}`);
                setPaymentTermDetails(response.data);
                
                // Preencher o formulário com os dados existentes
                setValue('description', response.data.description);
                setValue('term', response.data.term.toString());
                
                // Formatar a taxa para exibir com vírgula no lugar de ponto
                const formattedTax = response.data.tax.toString().replace('.', ',');
                setValue('tax', formattedTax);
            } catch (error) {
                toast.error('Erro ao buscar dados da condição de pagamento');
                console.error('Erro ao buscar condição de pagamento:', error);
            } finally {
                setLoadingPaymentTerm(false);
            }
        };
        
        fetchPaymentTerm();
    }, [id, setValue]);

    const onSubmit = async (data: PaymentTermFormData) => {
        setLoading(true);

        const requestData = {
            description: data.description,
            term: Number(data.term),
            tax: Number(parseFloat(data.tax.replace(',', '.'))),
        };

        try {
            await api.put(`/payment-terms/${id}`, requestData);

            toast.success('Condição de pagamento atualizada com sucesso!');
            getPaymentTerms();
            closeModal();
        } catch (error) {
            const err = error as CustomErrorLogin;
            toast.error(err.response?.data?.message || 'Erro ao atualizar condição de pagamento');
            console.log('Erro ao atualizar condição de pagamento', err);
        } finally {
            setLoading(false);
        }
    };

    // Função para formatar número como percentual
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

    if (loadingPaymentTerm) {
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
                    label="Descrição"
                    placeholder="Digite a descrição da condição de pagamento"
                    type="text"
                    register={register('description')}
                    error={errors.description?.message}
                />

                <InputField
                    label="Prazo (dias)"
                    placeholder="Digite o prazo em dias"
                    type="text"
                    register={register('term')}
                    error={errors.term?.message}
                    onChange={(e) => {
                        // Allow only numbers
                        const value = e.target.value.replace(/\D/g, '');
                        setValue('term', value);
                    }}
                />

                <InputField
                    label="Taxa (%)"
                    placeholder="0,00"
                    type="text"
                    register={register('tax')}
                    error={errors.tax?.message}
                    onChange={(e) => {
                        const value = formatAsPercentage(e.target.value);
                        setValue('tax', value);
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