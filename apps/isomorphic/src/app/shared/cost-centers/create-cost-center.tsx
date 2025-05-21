'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { z } from 'zod';
import { toast } from "react-toastify";

import { api } from '@/service/api';
import { useModal } from '../modal-views/use-modal';
import { CustomErrorLogin } from '@/types';
import { InputField } from '@/components/input/input-field';

const costCenterSchema = z.object({
    name: z
        .string()
        .min(3, 'Nome deve ter no mínimo 3 caracteres')
        .nonempty('Nome do centro de custo não pode ser vazio'),
});

type CostCenterFormData = z.infer<typeof costCenterSchema>;

interface CreateCostCenterProps {
    getCostCenters: () => void;
}

export const CreateCostCenter = ({ getCostCenters }: CreateCostCenterProps) => {
    const [loading, setLoading] = useState(false);
    const { closeModal } = useModal();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<CostCenterFormData>({
        resolver: zodResolver(costCenterSchema),
    });

    const onSubmit = async (data: CostCenterFormData) => {
        setLoading(true);

        try {
            await api.post('/cost-centers', data);

            toast.success('Centro de custo cadastrado com sucesso!');
            getCostCenters();
            closeModal();
        } catch (error) {
            const err = error as CustomErrorLogin;
            toast.error(err.response?.data?.message || 'Erro ao cadastrar centro de custo');
            console.log('Erro ao cadastrar centro de custo', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            className="flex w-[100%] flex-col items-center justify-center"
            onSubmit={handleSubmit(onSubmit)}
        >
            <div className="w-full space-y-5">
                <InputField
                    label="Nome do Centro de Custo"
                    placeholder="Digite o nome do centro de custo"
                    type="text"
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
    );
};