"use client";
import { toast } from "react-toastify";
import { useEffect, useState } from 'react';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from 'rizzui/button';
import { addMonths, isFuture } from 'date-fns';

import { InputField } from '@/components/input/input-field';
import { SelectField } from '@/components/input/select-field';
import { CustomErrorLogin, ProducersType, ContractsType, userType, OptionsSelect } from '@/types';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { useModal } from '../modal-views/use-modal';
import { moneyMask, formatMoney } from '@/utils/format';
import TrashIcon from '@core/components/icons/trash';
import { ptBR } from 'date-fns/locale';
import { DatePicker } from '@core/ui/datepicker';

const userSchema = z.object({
    producerId: z.string().min(1, 'Produtor é obrigatório'),
    pilots: z.array(z.object({
        id: z.string().min(1, 'Piloto é obrigatório'),
        name: z.string().min(1, 'Nome do piloto é obrigatório')
    })).optional().nullable(),
    hectaresEstimate: z.string().min(1, 'Hectares estimados é obrigatório'),
    valuePerHectare: z.string().min(1, 'Valor por hectare é obrigatório'),
    paymentMethod: z.string().min(1, 'Método de pagamento é obrigatório'),
    installmentNumber: z.number().min(1, 'Número de parcelas é obrigatório').max(3, 'Número de parcelas deve ser entre 1 e 3'),
    initialChargeDate: z.string().min(1, 'Data inicial de cobrança é obrigatória'),
});

interface EditContractsProps {
    id: string;
    getList: () => void;
}

export const EditContracts = ({ id, getList }: EditContractsProps) => {

    const [loading, setLoading] = useState(false);
    const [loadingProducers, setLoadingProducers] = useState(false);
    const [producersOptions, setProducersOptions] = useState<OptionsSelect[]>([]);
    const [pilotsOptions, setPilotsOptions] = useState<OptionsSelect[]>([]);
    const [contractDetails, setContractDetails] = useState<ContractsType | null>(null);
    const [dueDates, setDueDates] = useState<string[]>([]);

    
    const validateInitialChargeDate = (date: string) => {
        return isFuture(new Date(date)) || 'A data inicial deve ser uma data futura.';
    };


    const { closeModal } = useModal();

    const { register, handleSubmit, setValue, getValues, control, formState: { errors } } = useForm({
        resolver: zodResolver(userSchema),
    });

    const { fields: pilotFields, append: appendPilot, remove: removePilot } = useFieldArray({
        control,
        name: 'pilots',
    });

    async function addPilots(contractId: string, pilotsIds: string[]) {
        try {
            await api.put(`/service-contracts/${contractId}/pilots`, { pilotIds: pilotsIds });
        } catch (error) {
            // console.error('Error ao adicionar pilotos:', error);
        }
    }

    const calculateDueDates = (installments: number, startDate: string) => {
        const dates = [];
        for (let i = 0; i < installments; i++) {
            dates.push(addMonths(new Date(startDate), i).toISOString().split('T')[0]);
        }
        return dates;
    };

    const handleInstallmentsChange = (value: string) => {
        const parsedValue = parseInt(value, 10);
        setValue('installmentNumber', parsedValue);
        const initialPaymentDate = getValues('initialChargeDate');
        if (initialPaymentDate) {
            setDueDates(calculateDueDates(parsedValue, initialPaymentDate));
        }
    };

    const handleInitialPaymentDateChange = (date: Date | string) => {
        const dateString = date instanceof Date ? date.toISOString().split('T')[0] : date;
        setValue('initialChargeDate', dateString);
        const installments = getValues('installmentNumber');
        if (installments) {
            setDueDates(calculateDueDates(installments, dateString));
        }
    };


    async function onSubmit(data: ContractsType) {
        setLoading(true);
        const requestData = { ...data};
        requestData.valuePerHectare = parseFloat(data.valuePerHectare?.toString().replace(/[^\d,]/g, '').replace(',', '.') as string);

        try {
            await api.put(`/service-contracts/${id}`, requestData);
            addPilots(id, data.pilots?.map(pilot => pilot.id) || []);
            getList();
            toast.success('Contrato atualizado com sucesso!');
            closeModal();
        } catch (error) {
            const err = error as CustomErrorLogin;
            toast.error(err.response.data.message || 'Erro ao atualizar contrato');
            console.log('Erro ao atualizar contrato', err);
        } finally {
            setLoading(false);
        }
    }

    async function deletePilot(pilotId: string) {
        try {
            await api.delete(`/service-contracts/${id}/pilots/${pilotId}`);
            getList();
            toast.success('Piloto removido com sucesso!');
        } catch (error) {
            const err = error as CustomErrorLogin;
            toast.error(err.response.data.message || 'Erro ao remover piloto');
            console.log('Erro ao remover piloto', err);
        }
    }

    async function getProducers() {
        setLoadingProducers(true);
        try {
            const response = await apiCall(() => api.get<ProducersType[]>('/producers'));
            if (!response) {
                return;
            }

            const filteredProducers = response.data
                .filter((producer) => producer.name)
                .map((producer) => ({ label: producer.name, value: producer.id }));
            setProducersOptions(filteredProducers);

        } catch (error) {
            console.error("Error ao buscar produtores:", error);
        }finally{
            setLoadingProducers(false);
        }
    }

    async function getPilots() {
        try {
            let response = await apiCall(() => api.get<userType[]>('/users'));
            if (!response) {
                return;
            }

            const pilotsData = response.data.filter((user) => user.role === 'PILOT');

            const filteredPilots = pilotsData
                .filter((pilot) => pilot.name)
                .map((pilot) => ({ label: pilot.name, value: pilot.id }));
            setPilotsOptions(filteredPilots);

        } catch (error) {
            console.error("Error ao buscar pilotos:", error);
        }
    }

    async function getContractDetails() {
        try {
            const response = await apiCall(() => api.get<ContractsType>(`/service-contracts/${id}`));
            if (!response) {
                return;
            }

            const contract = response.data;
            setContractDetails(contract);
            setValue('producerId', contract.producer?.id);
            setValue('pilots', contract.pilots?.map(pilot => ({ id: pilot.id, name: pilot.name })) || []);
            setValue('hectaresEstimate', contract.hectaresEstimate ? contract.hectaresEstimate.toString() : '');
            setValue('valuePerHectare', contract.valuePerHectare !== undefined ? formatMoney(contract.valuePerHectare) : '');
            setValue('paymentMethod', contract.financialRecords?.[0]?.paymentMethod || '');

            const financialRecords = contract.financialRecords || [];
            const installmentNumber = financialRecords.length;

            if (installmentNumber > 0) {
                setValue('installmentNumber', installmentNumber);

                const initialPaymentDate = financialRecords[0].initialPaymentDate;
                setValue('initialChargeDate', initialPaymentDate);

                setDueDates(calculateDueDates(installmentNumber, initialPaymentDate));
            }
        } catch (error) {
            console.error('Erro ao buscar contrato:', error);
        }
    }

    useEffect(() => {
        getProducers();
        getPilots();
        getContractDetails();
    }, [id]);

    const paymentOptions = [
        { label: 'Boleto', value: 'BOLETO' },
        { label: 'PIX', value: 'PIX' },
        { label: 'Cartão de Crédito', value: 'CARTAO_CREDITO' },
        { label: 'Cartão de Débito', value: 'CARTAO_DEBITO' },
    ];

    const installmentsOptions = [
        { label: '1x', value: 1 },
        { label: '2x', value: 2 },
        { label: '3x', value: 3 },
    ]

    if(loadingProducers) {
        return (
            <div className="flex w-full flex-col items-center justify-center">
                <span className="text-gray-500">Carregando...</span>
            </div>
        );
    }

    return (
        <form
            className='flex w-full flex-col items-center justify-center'
            onSubmit={handleSubmit(onSubmit)}
        >
            <div className="w-full space-y-5 mb-4">

                <Controller
                    control={control}
                    name="producerId"
                    render={({ field: { value, onChange } }) => (
                        <SelectField
                            label="Produtor"
                            placeholder="Selecione o produtor"
                            options={producersOptions}
                            onChange={(selected) => {
                                onChange(selected);
                            }}
                            value={value || ''}
                            error={errors.producerId?.message ? "Produtor é obrigatório" : ''}
                        />
                    )}
                />

                {pilotFields.map((field, index) => {

                    const selectedPilotIds = pilotFields
                        .map((_, i) => getValues(`pilots.${i}.id`))
                        .filter((id) => id);

                    const filteredPilotsOptions = pilotsOptions.filter(
                        (option) => !selectedPilotIds.includes(option.value) || option.value === getValues(`pilots.${index}.id`)
                    );

                    return (
                        <div key={field.id} className="flex items-end w-full justify-items-center space-x-5">
                            <div className="w-4/5">
                                <Controller
                                    control={control}
                                    name={`pilots.${index}.id`}
                                    render={({ field: { value, onChange } }) => (
                                        <SelectField
                                            label={`Piloto ${index + 1}`}
                                            placeholder="Selecione o piloto"
                                            options={filteredPilotsOptions}
                                            onChange={(selected) => {
                                                const selectedPilot = pilotsOptions.find((pilot) => pilot.value === selected);
                                                onChange(selected);
                                                setValue(`pilots.${index}.name`, selectedPilot?.label || '');
                                            }}
                                            value={value || ''}
                                            error={(errors.pilots as any)?.[index]?.id ? 'Piloto é obrigatório' : ''}
                                        />
                                    )}
                                />
                            </div>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={() => {
                                    removePilot(index);
                                    const pilotId = contractDetails?.pilots?.[index]?.id;
                                    if (pilotId) {
                                        deletePilot(pilotId);
                                    }
                                }}
                                className="w-1/5"
                                size="lg"
                            >
                                <TrashIcon className="w-5 h-5 text-red-500" />
                            </Button>
                        </div>
                    );
                })}

                <Button
                    variant="outline"
                    type="button"
                    onClick={() => appendPilot({ id: '', name: '' })}
                    className="w-full"
                    size="lg"
                >
                    Adicionar Pilotos
                </Button>

                <InputField
                    label="Hectares Estimados"
                    type="number"
                    placeholder="Digite os hectares estimados"
                    register={register('hectaresEstimate')}
                    error={errors.hectaresEstimate?.message}
                />

                <InputField
                    label="Valor por Hectare"
                    type="text"
                    placeholder="Digite o valor por hectare"
                    register={register('valuePerHectare')}
                    error={errors.valuePerHectare?.message}
                    onChange={(e) => {
                        const value = e.target.value;
                        setValue('valuePerHectare', moneyMask(value));
                    }}
                />

                <Controller
                    control={control}
                    name="paymentMethod"
                    render={({ field: { value, onChange } }) => (
                        <SelectField
                            label="Método de Pagamento"
                            placeholder="Selecione o método de pagamento"
                            options={paymentOptions}
                            onChange={(selected) => {
                                onChange(selected);
                            }}
                            value={value || ''}
                            error={errors.paymentMethod?.message ? "Método de pagamento é obrigatório" : ''}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="installmentNumber"
                    rules={{
                        required: 'Número de parcelas é obrigatório.',
                        validate: (value) =>
                            value >= 1 && value <= 3 || 'Número de parcelas deve ser entre 1 e 3.',
                    }}
                    render={({ field: { value, onChange } }) => (
                        <SelectField
                            label="Número de Parcelas"
                            placeholder="Selecione o número de parcelas"
                            options={installmentsOptions as any}
                            onChange={(selected) => {
                                onChange(selected);
                                handleInstallmentsChange(selected);
                            }}
                            value={value || ''}
                            error={errors.installmentNumber?.message as string}
                        />
                    )}
                />

                <Controller
                    control={control}
                    name="initialChargeDate"
                    rules={{
                        required: 'Data inicial de cobrança é obrigatória.',
                        validate: validateInitialChargeDate,
                    }}
                    render={({ field: { value, onChange } }) => (
                        <DatePicker
                            label="Data Inicial de Cobrança"
                            selected={value ? new Date(value) : null}
                            onChange={(date) => {
                                onChange(date);
                                handleInitialPaymentDateChange(date || '');
                            }}
                            dateFormat="dd/MM/yyyy"
                            showMonthYearDropdown
                            minDate={new Date()}
                            maxDate={addMonths(new Date(), 12)}
                            scrollableMonthYearDropdown
                            placeholderText="Selecione a data inicial"
                            popperPlacement="bottom-end"
                            inputProps={{
                                variant: 'outline',
                                inputClassName: 'px-2 py-3 h-auto [&_input]:text-ellipsis ring-0',
                            }}
                            className="flex-grow [&>label>span]:font-medium"
                            locale={ptBR}
                        />
                    )}
                />
                <p className="text-red-500 text-sm mt-1">{errors.initialChargeDate?.message as string}</p>

                {dueDates.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-700">Datas de Vencimento</h3>
                        <ul className="list-disc pl-5">
                            {dueDates.map((date, index) => (
                                <li key={index} className="text-sm text-gray-700">
                                    Parcela {index + 1}: {new Date(date).toLocaleDateString('pt-BR')}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

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