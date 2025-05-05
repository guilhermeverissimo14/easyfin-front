"use client";

import { useState } from 'react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from "react-toastify";
import { Button } from 'rizzui/button';

import { InputField } from '@/components/input/input-field';
import { useModal } from '../modal-views/use-modal';
import { api } from '@/service/api';

const userSchema = z.object({
    notes: z.string()
        .optional()
        .nullable(),
});

interface AddDescriptionProps {
    id: string;
    getList: () => void;
}

export default function AddDescription({ id, getList }: AddDescriptionProps) {

    const [loading, setLoading] = useState(false);

    const { closeModal } = useModal();

    const { register, handleSubmit, getValues, setValue, control, formState: { errors } } = useForm<{ notes: string }>({
        resolver: zodResolver(userSchema),
    });

    async function onSubmit(data: { notes: string }) {

        setLoading(true);

        try {
            await api.post(`/spendings/${id}/notes`, data);
            getList();
            toast.success('Descrição adicionada com sucesso');
            closeModal();
        } catch (error) {

            console.log("Error ao adicionar descrição", error);
            toast.error('Erro ao adicionar descrição');

        } finally {
            setLoading(false);
        }
    }


    return (
        <form
            className='flex w-full flex-col items-center justify-center'
            onSubmit={handleSubmit(onSubmit)}
        >
            <div className="w-full space-y-5">
                <InputField
                    label="Comentário"
                    placeholder="Digite uma comentário"
                    type="text"
                    register={register('notes')}
                    error={errors.notes?.message}
                />

                <Button
                    disabled={loading}
                    className="w-full"
                    type="submit"
                    size="lg"
                >
                    <span>{loading ? 'Carregando...' : 'Criar'}</span>
                </Button>
            </div>
        </form>
    )
}