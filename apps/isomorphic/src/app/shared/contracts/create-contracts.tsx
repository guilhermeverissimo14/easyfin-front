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
import { moneyMask } from '@/utils/format';
import TrashIcon from '@core/components/icons/trash';
import { ptBR } from 'date-fns/locale';
import { DatePicker } from '@core/ui/datepicker';

const userSchema = z.object({
    producerId: z.string().min(1, 'Produtor é obrigatório'),
    pilots: z.array(z.object({
        id: z.string(),
        name: z.string()
    })).optional().nullable(),
    hectaresEstimate: z.string().min(1, 'Hectares estimados é obrigatório'),
    valuePerHectare: z.string().min(1, 'Valor por hectare é obrigatório'),
    paymentMethod: z.string().min(1, 'Método de pagamento é obrigatório'),
    installmentNumber: z.number().min(1, 'Número de parcelas é obrigatório').max(3, 'Número de parcelas deve ser entre 1 e 3'),
    initialChargeDate: z.date().refine((val) => val !== null, { message: 'Data inicial de cobrança é obrigatória' }).optional().nullable(),
});

export function CreateContracts({ getList }: { getList: () => void }) {

    const [loading, setLoading] = useState(false);
    const [producersOptions, setProducersOptions] = useState<OptionsSelect[]>([]);
    const [pilotsOptions, setPilotsOptions] = useState<OptionsSelect[]>([]);

    const [installments, setInstallments] = useState<number | null>(null);
    const [initialChargeDate, setInitialChargeDate] = useState<string | null>(null);
    const [dueDates, setDueDates] = useState<string[]>([]);

    const validateInitialChargeDate = (date: string) => {
        return isFuture(new Date(date)) || 'A data inicial deve ser uma data futura.';
    };

    const { closeModal } = useModal();

    const { register, handleSubmit, getValues, setValue, control, formState: { errors } } = useForm({
        resolver: zodResolver(userSchema),
    });

    const { fields: pilotFields, append: appendPilot, remove: removePilot } = useFieldArray({
        control,
        name: 'pilots',
    });

    const calculateDueDates = (installments: number, startDate: string) => {
        const dates = [];
        for (let i = 0; i < installments; i++) {
            dates.push(addMonths(new Date(startDate), i).toISOString().split('T')[0]);
        }
        return dates;
    };

    const handleInstallmentsChange = (value: string) => {
        const parsedValue = parseInt(value, 10);
        setInstallments(parsedValue);
        if (initialChargeDate) {
            setDueDates(calculateDueDates(parsedValue, initialChargeDate));
        }
    };

    const handleInitialChargeDateChange = (date: Date | string) => {
        const dateString = date instanceof Date ? date.toISOString().split('T')[0] : date;
        setInitialChargeDate(dateString);
        if (installments) {
            setDueDates(calculateDueDates(installments, dateString));
        }
    };


    async function addPilots(contractId: string, pilotsIds: string[]) {
        try {
            await api.put(`/service-contracts/${contractId}/pilots`, { pilotIds: pilotsIds });
        } catch (error) {
            console.error('Error ao adicionar pilotos:', error);
        }
    }

    async function onSubmit(data: ContractsType) {
        setLoading(true);

        const requestData = { ...data};
        requestData.valuePerHectare = parseFloat(data.valuePerHectare?.toString().replace(/[^\d,]/g, '').replace(',', '.') as string);
        requestData.hectaresEstimate = Number(data.hectaresEstimate);
        try {
            const response = await api.post('/service-contracts', requestData);
            const idContract = response.data.id;
            if (data.pilots) {
                addPilots(idContract, data.pilots.map(pilot => pilot.id));
            }
            getList();
            toast.success('Contrato criado com sucesso!');
            closeModal();
        } catch (error) {
            const err = error as CustomErrorLogin;
            toast.error(err.response.data.message || 'Erro ao criar contrato');
            console.log('Erro ao criar contrato', err);
        } finally {
            setLoading(false);
        }
    }

    async function getProducers() {
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

    const paymentOptions = [
        { label: 'Boleto', value: 'BOLETO' },
        { label: 'PIX', value: 'PIX' },
        { label: 'Cartão de Crédito', value: 'CARTAO_CREDITO' },
        { label: 'Cartão de Débito', value: 'CARTAO_DEBITO' },
    ]

    const installmentsOptions = [
        { label: '1x', value: 1 },
        { label: '2x', value: 2 },
        { label: '3x', value: 3 },
    ]

    useEffect(() => {
        getProducers();
        getPilots();
    }, []);

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
                                onClick={() => removePilot(index)}
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
                            error={errors.installments?.message as string}
                        />
                    )}
                />

                {installments && (
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
                                selected={value}
                                onChange={(date) => {
                                    onChange(date);
                                    handleInitialChargeDateChange(date || '');
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
                )}

                <p className="text-red-500 text-sm mt-1">{errors.initialChargeDate?.message as string}</p>

                {dueDates.length > 0 && (
                    <div className="space-y-2">
                        <h3 className="text-sm font-medium text-gray-700">Datas de Vencimento</h3>
                        <ul className="list-disc pl-5">
                            {dueDates.map((date, index) => (
                                <li key={index} className="text-sm text-gray-700">
                                    Parcela {index + 1}: {new Date(date + 'T00:00:00').toLocaleDateString('pt-BR')}
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
                    <span>{loading ? 'Carregando...' : 'Cadastrar'}</span>
                </Button>
            </div>
        </form>
    )
}