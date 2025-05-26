'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { z } from 'zod';
import { toast } from "react-toastify";

import { api } from '@/service/api';
import { useModal } from '../modal-views/use-modal';
import { CustomErrorLogin, PaymentMethod, PaymentTermModel } from '@/types';
import { InputField } from '@/components/input/input-field';
import { LoadingSpinner } from '@/components/loading-spinner';
import { SelectField } from '@/components/input/select-field';

// Validação com consistência entre parcelas e condição
const paymentTermSchema = z.object({
    description: z.string().nonempty('Descrição não pode ser vazia'),
    condition: z
        .string()
        .nonempty('Condição não pode ser vazia')
        .refine((val) => /^\d+(,\d+)*$/.test(val), {
            message: 'Condição deve ser no formato "30,60,90" (sem espaços)',
        }),
    installments: z
        .string()
        .nonempty('Número de parcelas não pode ser vazio')
        .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
            message: 'Número de parcelas deve ser um número positivo',
        }),
    paymentMethodId: z
        .string()
        .nonempty('Método de pagamento não pode ser vazio'),
}).refine((data) => {
    const days = data.condition?.split(',').filter(Boolean);
    const numInstallments = Number(data.installments);
    return !isNaN(numInstallments) && days.length === numInstallments;
}, {
    message: 'Você definiu uma quantidade de parcelas, mas informou uma condição diferente',
    path: ['condition'],
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
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loadingMethods, setLoadingMethods] = useState(true);
    
    const { closeModal } = useModal();

    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors },
    } = useForm<PaymentTermFormData>({
        resolver: zodResolver(paymentTermSchema),
    });

    // Buscar métodos de pagamento
    useEffect(() => {
        const fetchPaymentMethods = async () => {
            try {
                const response = await api.get<PaymentMethod[]>('/payment-methods');
                setPaymentMethods(response.data);
            } catch (error) {
                console.error('Erro ao buscar métodos de pagamento:', error);
                toast.error('Não foi possível carregar os métodos de pagamento');
            } finally {
                setLoadingMethods(false);
            }
        };

        fetchPaymentMethods();
    }, []);

    // Buscar dados da condição de pagamento existente
    useEffect(() => {
        const fetchPaymentTerm = async () => {
            setLoadingPaymentTerm(true);
            try {
                const response = await api.get<PaymentTermModel>(`/payment-terms/${id}`);
                setPaymentTermDetails(response.data);
                
                // Preencher o formulário com os dados existentes
                setValue('description', response.data.description);
                setValue('condition', response.data.condition);
                setValue('installments', response.data.installments.toString());
                setValue('paymentMethodId', response.data.paymentMethodId);
                
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

        // Remove espaços da condição, se houver
        const conditionWithoutSpaces = data.condition.replace(/\s+/g, '');

        const requestData = {
            description: data.description,
            condition: conditionWithoutSpaces,
            installments: Number(data.installments),
            paymentMethodId: data.paymentMethodId,
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

    const formatCondition = (value: string) => {
        let cleaned = value.replace(/[^\d,]/g, '');
        cleaned = cleaned.replace(/\s+/g, '');
        return cleaned;
    };

    if (loadingPaymentTerm || loadingMethods) {
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
                <Controller
                    control={control}
                    name="paymentMethodId"
                    render={({ field: { value, onChange } }) => (
                        <SelectField
                            label="Método de Pagamento"
                            placeholder="Selecione o método de pagamento"
                            options={paymentMethods.map(method => ({
                                label: method.name,
                                value: method.id
                            }))}
                            onChange={(selected) => {
                                onChange(selected);
                            }}
                            value={value || ''}
                            error={errors.paymentMethodId?.message}
                        />
                    )}
                />

                <InputField
                    label="Condição (dias das parcelas)"
                    placeholder="Ex: 30,60,90"
                    type="text"
                    register={register('condition')}
                    error={errors.condition?.message}
                    onChange={(e) => {
                        const value = formatCondition(e.target.value);
                        setValue('condition', value);
                    }}
                />

                <InputField
                    label="Descrição"
                    placeholder="Digite a descrição da condição de pagamento"
                    type="text"
                    register={register('description')}
                    error={errors.description?.message}
                />

                <InputField
                    label="Número de parcelas"
                    placeholder="Digite o número de parcelas"
                    type="text"
                    register={register('installments')}
                    error={errors.installments?.message}
                    onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        setValue('installments', value);
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