"use client";
import { toast } from "react-toastify";
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from 'rizzui/button';

import { InputField } from '@/components/input/input-field';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { Expenses } from '@/types';
import { useModal } from '../../modal-views/use-modal';

const userSchema = z.object({
    name:
        z.string()
            .min(3, 'Nome deve ter no mínimo 3 caracteres')
            .nonempty('Nome não pode ser vazio'),
});

interface FormEditExpensesProps {
    getExpenses?: () => void;
    id: string;
}

export const EditExpenses = ({ getExpenses, id }: FormEditExpensesProps) => {

    const [loading, setLoading] = useState(false);
    const [expenseDetails, setExpenseDetails] = useState<Expenses[] | null>(null);

    const {closeModal} = useModal();

    const { register, setValue, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(userSchema),
    });

    
    async function getExpensesDetails() {
        const response = await apiCall(() => api.get<Expenses[]>(`/expenses`));

        if (!response) {
            return;
        }
        const filteredExpenseId = response.data.filter((expense) => expense.id === id);
        setExpenseDetails(filteredExpenseId);
        setValue('name', filteredExpenseId[0].name);
    }

    async function onSubmit(data: Expenses) {
        setLoading(true);

        try {
            await apiCall(() => api.put(`/expenses/${id}`, data));
            getExpenses?.();
            toast.success('Despesa atualizada com sucesso!');
            closeModal();
            setLoading(false);
        } catch (error) {
            toast.error('Erro ao atualizar despesa');
            console.error('Erro ao atualizar despesa:', error);
            setLoading(false);
        }
    }

    useEffect(() => {
        getExpensesDetails();
    },[]);

    return (
        <form
            className='flex w-[100%] flex-col items-center justify-center'
            onSubmit={handleSubmit(onSubmit)}
        >
            <div className="w-full space-y-5">
                <InputField
                    label='Nome da despesa'
                    placeholder='Ex: Combustível'
                    type='text'
                    register={register('name')}
                    error={errors.name?.message}
                />
                <Button
                    disabled={loading}
                    className="w-full"
                    type="submit"
                    size="lg"
                >
                    <span>{loading ? 'Carregando...' : 'Salvar'}</span>
                </Button>
            </div>

        </form>
    )
}