import { Controller } from "react-hook-form";
import { InputField } from "../input/input-field";
import { SelectField } from "../input/select-field";
import { cpfMask, phoneNumberMask } from "@/utils/format";
import { OptionsSelect, userType } from "@/types";
import { useEffect, useState } from "react";
import { api } from "@/service/api";

interface PersonalDataFormProps {
    register: any;
    errors: any;
    control: any;
    setValue: any
}

export const PersonalDataForm = ({
    register,
    errors,
    control,
    setValue
}: PersonalDataFormProps) => {

    const [isLocalManager, setIsLocalManager] = useState(false);
    const [localManagerOptions, setLocalManagerOptions] = useState<OptionsSelect[]>([]);



    const getLocalManager = async () => {
        try {
            const response = await api.get<userType[]>('/users');

            if (!response) {
                return;
            }

            const localManagerFiltered = response.data
                .filter((user) => user.role === 'LOCAL_MANAGER')
                .map((localManager) => ({
                    label: localManager.name,
                    value: localManager.id,
                }));

            setLocalManagerOptions(localManagerFiltered);
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
        }
    };

    useEffect(() => {
        const userRole = (JSON.parse(localStorage.getItem('eas:user') as string) as userType).role;
        if (userRole !== 'LOCAL_MANAGER') {
            setIsLocalManager(true);
        } else {
            setIsLocalManager(false);
        }

        if (userRole !== 'LOCAL_MANAGER') {
            getLocalManager();
        }
    }, []);

    return (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <InputField
                label="Nome"
                placeholder="Digite o nome"
                type="text"
                register={register('name')}
                error={errors.name?.message}
            />
            <InputField
                label="Apelido (opcional)"
                placeholder="Digite o apelido"
                type="text"
                register={register('surname')}
                error={errors.surname?.message}
            />
            <InputField
                label="CPF"
                placeholder="Digite o CPF"
                type="text"
                register={register('cpf')}
                onChange={(e) => setValue('cpf', cpfMask(e.target.value))}
                error={errors.cpf?.message}
            />
            <InputField
                label="Telefone"
                placeholder="Digite o telefone"
                type="text"
                register={register('phone')}
                onChange={(e) => setValue('phone', phoneNumberMask(e.target.value))}
                error={errors.phone?.message}
            />
            <InputField
                label="Email"
                placeholder="Digite o email"
                type="email"
                register={register('email')}
                error={errors.email?.message}
            />
            {isLocalManager && (
                <Controller
                    control={control}
                    name="localManagerId"
                    render={({ field }) => (
                        <SelectField
                            label="Gerente local"
                            placeholder="Selecione o gerente local"
                            options={localManagerOptions}
                            {...field}
                            error={errors.localManagerId?.message}
                        />
                    )}
                />
            )}
        </div>
    )
}