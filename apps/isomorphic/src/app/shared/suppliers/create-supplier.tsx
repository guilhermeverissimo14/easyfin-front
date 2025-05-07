'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { z } from 'zod';
import { toast } from "react-toastify";
import axios from 'axios';

import { api } from '@/service/api';
import { useModal } from '../modal-views/use-modal';
import { AddressType, CustomErrorLogin } from '@/types';
import { InputField } from '@/components/input/input-field';
import { cpfCnpjMask, phoneNumberMask } from '@/utils/format';
import { SelectField } from '@/components/input/select-field';

const supplierSchema = z.object({
    name: z
        .string()
        .min(3, 'Nome deve ter no mínimo 3 caracteres')
        .nonempty('Nome não pode ser vazio'),
    cnpj: z
        .string()
        .nonempty('CNPJ não pode ser vazio'),
    email: z
        .string()
        .email('Formato de e-mail inválido')
        .nullable()
        .optional(),
    retIss: z
        .string()
        .nonempty('Retenção de ISS não pode ser vazio'),
    phone: z
        .string()
        .nullable()
        .optional(),
    address: z
        .string()
        .nullable()
        .optional(),
    zipCode: z
        .string()
        .nullable()
        .optional(),
    city: z
        .string()
        .nullable()
        .optional(),
    state: z
        .string()
        .nullable()
        .optional(),
    country: z
        .string()
        .nullable()
        .optional(),
    contact: z
        .string()
        .nullable()
        .optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface CreateSupplierProps {
    getSuppliers?: () => void;
}

export const CreateSupplier = ({ getSuppliers }: CreateSupplierProps) => {
    const [loading, setLoading] = useState(false);
    const { closeModal } = useModal();

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        formState: { errors },
        control,
    } = useForm<SupplierFormData>({
        resolver: zodResolver(supplierSchema),
        defaultValues: {
            country: 'Brasil',
        },
    });


    const fetchAddressFromCEP = async (cep: string) => {
        if (!cep || cep.length < 8) return;

        const cleanCep = cep.replace(/\D/g, '');

        if (cleanCep.length !== 8) return;

        try {
            setLoading(true);
            const response = await axios<AddressType>(`https://viacep.com.br/ws/${cleanCep}/json/`);

            if (!response.data?.erro) {
                setValue('address', response.data.logradouro);
                setValue('city', response.data.localidade);
                setValue('state', response.data.uf);
            } else {
                toast.error('CEP não encontrado');
            }
        } catch (error) {
            toast.error('Erro ao buscar o CEP');
            console.error('Erro ao buscar o CEP:', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: SupplierFormData) => {
        setLoading(true);

        const requestData = { ...data };

        if (!requestData.phone) delete requestData.phone;
        if (!requestData.email) delete requestData.email;
        if (!requestData.address) delete requestData.address;
        if (!requestData.zipCode) delete requestData.zipCode;
        if (!requestData.city) delete requestData.city;
        if (!requestData.state) delete requestData.state;
        if (!requestData.country) delete requestData.country;
        if (!requestData.contact) delete requestData.contact;

        if (requestData.phone) requestData.phone = requestData.phone.replace(/\D/g, '');
        if (requestData.cnpj) requestData.cnpj = requestData.cnpj.replace(/\D/g, '');
        if (requestData.zipCode) requestData.zipCode = requestData.zipCode.replace(/\D/g, '');

        try {
            await api.post('/suppliers', requestData);

            toast.success('Fornecedor cadastrado com sucesso!');
            getSuppliers?.();
            closeModal();
        } catch (error) {
            const err = error as CustomErrorLogin;
            toast.error(err.response?.data?.message || 'Erro ao cadastrar fornecedor');
            console.log('Erro ao cadastrar fornecedor', err);
        } finally {
            setLoading(false);
        }
    };

    const retIssOptions = [
        {
            label: 'Sim',
            value: "true",
        },
        {
            label: 'Não',
            value: "false",
        }
    ]

    return (
        <form
            className="flex w-[100%] flex-col items-center justify-center"
            onSubmit={handleSubmit(onSubmit)}
        >
            <div className="w-full space-y-5">
                <InputField
                    label="Nome da Empresa"
                    placeholder="Digite o nome do fornecedor"
                    type="text"
                    register={register('name')}
                    error={errors.name?.message}
                />

                <Controller
                    control={control}
                    name="retIss"
                    render={({ field: { value, onChange } }) => (
                        <SelectField
                            label="Retenção de ISS"
                            placeholder="Retenção de ISS"
                            options={retIssOptions}
                            onChange={(selected) => {
                                onChange(selected);
                            }}
                            value={value || ''}
                            error={errors.retIss?.message}
                        />
                    )}
                />

                <InputField
                    label="CNPJ"
                    placeholder="Digite o CNPJ"
                    type="text"
                    register={register('cnpj')}
                    error={errors.cnpj?.message}
                    onChange={(e) => {
                        const value = e.target.value;
                        setValue('cnpj', cpfCnpjMask(value));
                    }}
                />

                <InputField
                    label="Email (opcional)"
                    placeholder="Digite o email"
                    type="email"
                    register={register('email')}
                    error={errors.email?.message}
                />
                <InputField
                    label="Telefone (opcional)"
                    placeholder="Digite o telefone"
                    type="text"
                    register={register('phone')}
                    error={errors.phone?.message}
                    onChange={(e) => {
                        const value = e.target.value;
                        setValue('phone', phoneNumberMask(value));
                    }}
                />
                <InputField
                    label="CEP (opcional)"
                    placeholder="Digite o CEP"
                    type="text"
                    register={register('zipCode')}
                    error={errors.zipCode?.message}
                    onChange={(e) => {
                        const value = e.target.value;
                        const cepFormatted = value
                            .replace(/\D/g, '')
                            .replace(/(\d{5})(\d)/, '$1-$2')
                            .substr(0, 9);
                        setValue('zipCode', cepFormatted);

                        if (cepFormatted.length === 9) {
                            fetchAddressFromCEP(cepFormatted);
                        }
                    }}
                />

                <div className="grid grid-cols-2 gap-4">
                    <InputField
                        label="Endereço (opcional)"
                        placeholder="Digite o endereço"
                        type="text"
                        register={register('address')}
                        error={errors.address?.message}
                    />
                    <InputField
                        label="Cidade (opcional)"
                        placeholder="Digite a cidade"
                        type="text"
                        register={register('city')}
                        error={errors.city?.message}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <InputField
                        label="Estado (opcional)"
                        placeholder="Digite o estado"
                        type="text"
                        register={register('state')}
                        error={errors.state?.message}
                    />
                    <InputField
                        label="País (opcional)"
                        placeholder="Digite o país"
                        type="text"
                        register={register('country')}
                        error={errors.country?.message}
                    />
                </div>
                <InputField
                    label="Contato (opcional)"
                    placeholder="Digite o nome do contato"
                    type="text"
                    register={register('contact')}
                    error={errors.contact?.message}
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