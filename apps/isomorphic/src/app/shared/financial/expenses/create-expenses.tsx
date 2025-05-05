"use client";
import { toast } from "react-toastify";
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from 'rizzui/button';

import { InputField } from '@/components/input/input-field';
import { api } from '@/service/api';
import { useModal } from '../../modal-views/use-modal';
import { CustomErrorLogin, Expenses } from '@/types';
import { apiCall } from '@/helpers/apiHelper';

const userSchema = z.object({
    name:
        z.string()
            .min(3, 'Nome deve ter no mínimo 3 caracteres')
            .nonempty('Nome não pode ser vazio'),
});

interface FormCreateExpensesProps {
    getExpenses: () => void;
}

export const CreateExpenses = ({ getExpenses }: FormCreateExpensesProps) => {

    const [loading, setLoading] = useState(false);

    const { closeModal } = useModal();

    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: zodResolver(userSchema),
    });

    async function onSubmit(data: Expenses) {
        setLoading(true);

        try {
            await apiCall(() => api.post(`/expenses`, data));
            getExpenses?.();
            toast.success('Despesa lançada com sucesso!');
            closeModal();
            setLoading(false);
        } catch (error) {
             const err = error as CustomErrorLogin;
            toast.error(err.response.data.message ||'Erro ao criar despesa');
            console.error('Erro ao criar despesa:', error);
            setLoading(false);
        }
    }

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
                    <span>{loading ? 'Carregando...' : 'Cadastrar'}</span>
                </Button>
            </div>

        </form>
    )
}