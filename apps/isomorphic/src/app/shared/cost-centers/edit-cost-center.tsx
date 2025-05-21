'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { z } from 'zod';
import { toast } from "react-toastify";

import { api } from '@/service/api';
import { useModal } from '../modal-views/use-modal';
import { constCentersModel, CustomErrorLogin } from '@/types';
import { InputField } from '@/components/input/input-field';
import { LoadingSpinner } from '@/components/loading-spinner';

const costCenterSchema = z.object({
    name: z
        .string()
        .min(3, 'Nome deve ter no mínimo 3 caracteres')
        .nonempty('Nome do centro de custo não pode ser vazio'),
});

type CostCenterFormData = z.infer<typeof costCenterSchema>;

interface EditCostCenterProps {
    id: string;
    getCostCenters: () => void;
}

export const EditCostCenter = ({ id, getCostCenters }: EditCostCenterProps) => {
    const [loading, setLoading] = useState(false);
    const [loadingCostCenter, setLoadingCostCenter] = useState(true);
    const [costCenterDetails, setCostCenterDetails] = useState<constCentersModel | null>(null);
    
    const { closeModal } = useModal();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<CostCenterFormData>({
        resolver: zodResolver(costCenterSchema),
    });

    useEffect(() => {
        const fetchCostCenter = async () => {
            setLoadingCostCenter(true);
            try {
                const response = await api.get<constCentersModel>(`/cost-centers/${id}`);
                setCostCenterDetails(response.data);
                
                setValue('name', response.data.name);
            } catch (error) {
                toast.error('Erro ao buscar dados do centro de custo');
                console.error('Erro ao buscar centro de custo:', error);
            } finally {
                setLoadingCostCenter(false);
            }
        };
        
        fetchCostCenter();
    }, [id, setValue]);

    const onSubmit = async (data: CostCenterFormData) => {
        setLoading(true);

        try {
            await api.put(`/cost-centers/${id}`, data);

            toast.success('Centro de custo atualizado com sucesso!');
            getCostCenters();
            closeModal();
        } catch (error) {
            const err = error as CustomErrorLogin;
            toast.error(err.response?.data?.message || 'Erro ao atualizar centro de custo');
            console.log('Erro ao atualizar centro de custo', err);
        } finally {
            setLoading(false);
        }
    };

    if (loadingCostCenter) {
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
                    <span>{loading ? 'Carregando...' : 'Atualizar'}</span>
                </Button>
            </div>
        </form>
    );
};