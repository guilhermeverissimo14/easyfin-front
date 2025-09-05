'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { z } from 'zod';
import { useModal } from '../modal-views/use-modal';
import { SelectField } from '@/components/input/select-field';
import { api } from '@/service/api';
import { FilterParams } from '@/types';
import { ptBR } from 'date-fns/locale';
import { DatePicker } from '@core/ui/datepicker';

const filterSchema = z.object({
    customerId: z.string().optional(),
    costCenterId: z.string().optional(),
    status: z.string().optional(),
    paymentMethodId: z.string().optional(),
    documentDateStart: z.date().nullable().optional(),
    documentDateEnd: z.date().nullable().optional(),
    dueDateStart: z.date().nullable().optional(),
    dueDateEnd: z.date().nullable().optional(),
});

type FilterFormData = z.infer<typeof filterSchema>;

interface FilterAccountsReceivableProps {
    getAccounts: (params: FilterParams) => void;
}

export const FilterAccountsReceivable = ({ getAccounts }: FilterAccountsReceivableProps) => {
    const [loading, setLoading] = useState(false);
    const [customers, setCustomers] = useState([]);
    const [costCenters, setCostCenters] = useState([]);
    const [paymentMethods, setPaymentMethods] = useState([]);
    const { closeModal } = useModal();

    const {
        handleSubmit,
        control,
        register,
        reset,
        formState: { errors },
    } = useForm<FilterFormData>({
        resolver: zodResolver(filterSchema),
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const customersResponse = await api.get('/customers');
                setCustomers(customersResponse.data.map((customer: any) => ({
                    label: customer.name,
                    value: customer.id
                })));

                const costCentersResponse = await api.get('/cost-centers');
                setCostCenters(costCentersResponse.data.map((center: any) => ({
                    label: center.name,
                    value: center.id
                })));

                const paymentMethodsResponse = await api.get('/payment-methods');
                setPaymentMethods(paymentMethodsResponse.data.map((method: any) => ({
                    label: method.name,
                    value: method.id
                })));
            } catch (error) {
                console.error("Erro ao carregar dados para filtros:", error);
            }
        };

        fetchData();
    }, []);

    const onSubmit = async (data: FilterFormData) => {
        setLoading(true);

        try {
            // Prepare filter parameters
            const filters: FilterParams = {};

            if (data.customerId) filters.customerId = data.customerId;
            if (data.costCenterId) filters.costCenterId = data.costCenterId;
            if (data.status) filters.status = data.status;
            if (data.paymentMethodId) filters.paymentMethodId = data.paymentMethodId;

            if (data.documentDateStart) {
                filters.documentDateStart = data.documentDateStart.toISOString();
            }

            if (data.documentDateEnd) {
                filters.documentDateEnd = data.documentDateEnd.toISOString();
            }

            if (data.dueDateStart) {
                filters.dueDateStart = data.dueDateStart.toISOString();
            }

            if (data.dueDateEnd) {
                filters.dueDateEnd = data.dueDateEnd.toISOString();
            }

            await getAccounts(filters);
            closeModal();
        } catch (error) {
            console.error('Erro ao aplicar filtros:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearFilters = () => {
        reset({
            customerId: '',
            costCenterId: '',
            status: '',
            paymentMethodId: '',
            documentDateStart: null,
            documentDateEnd: null,
            dueDateStart: null,
            dueDateEnd: null,
        });

        getAccounts({});
        closeModal();
    };

    return (
        <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
            <Controller
                control={control}
                name="customerId"
                render={({ field: { value, onChange } }) => (
                    <SelectField
                        label="Cliente"
                        placeholder="Filtrar por cliente"
                        options={customers}
                        onChange={(selected) => {
                            onChange(selected);
                        }}
                        value={value || ''}
                        error={errors.customerId?.message}
                    />
                )}
            />

            <Controller
                control={control}
                name="costCenterId"
                render={({ field: { value, onChange } }) => (
                    <SelectField
                        label="Centro de Custo"
                        placeholder="Filtrar por centro de custo"
                        options={costCenters}
                        onChange={(selected) => {
                            onChange(selected);
                        }}
                        value={value || ''}
                        error={errors.costCenterId?.message}
                    />
                )}
            />

            <Controller
                control={control}
                name="status"
                render={({ field: { value, onChange } }) => (
                    <SelectField
                        label="Status"
                        placeholder="Filtrar por status"
                        options={[
                            { label: 'Pendente', value: 'PENDING' },
                            { label: 'Recebido', value: 'PAID' },
                            { label: 'Cancelado', value: 'CANCELLED' },
                            { label: 'Vencido', value: 'OVERDUE' },
                        ]}
                        onChange={(selected) => {
                            onChange(selected);
                        }}
                        value={value || ''}
                        error={errors.status?.message}
                    />
                )}
            />

            <Controller
                control={control}
                name="paymentMethodId"
                render={({ field: { value, onChange } }) => (
                    <SelectField
                        label="Método de Pagamento"
                        placeholder="Filtrar por método de pagamento"
                        options={paymentMethods}
                        onChange={(selected) => {
                            onChange(selected);
                        }}
                        value={value || ''}
                        error={errors.paymentMethodId?.message}
                    />
                )}
            />

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                    control={control}
                    name="documentDateStart"
                    render={({ field: { onChange, value } }) => (
                        <DatePicker
                            label="Data do documento inicial"
                            selected={value}
                            onChange={onChange}
                            dateFormat="dd/MM/yyyy"
                            minDate={new Date('1900-01-01')}
                            maxDate={new Date('2100-01-01')}
                            showMonthYearDropdown
                            scrollableMonthYearDropdown
                            placeholderText="Data inicial"
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

                <Controller
                    control={control}
                    name="documentDateEnd"
                    render={({ field: { onChange, value } }) => (
                        <DatePicker
                            label="Data do documento final"
                            selected={value}
                            onChange={onChange}
                            dateFormat="dd/MM/yyyy"
                            minDate={new Date('1900-01-01')}
                            maxDate={new Date('2100-01-01')}
                            showMonthYearDropdown
                            scrollableMonthYearDropdown
                            placeholderText="Data final"
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
            </div>

            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <Controller
                    control={control}
                    name="dueDateStart"
                    render={({ field: { onChange, value } }) => (
                        <DatePicker
                            label="Vencimento inicial"
                            selected={value}
                            onChange={onChange}
                            dateFormat="dd/MM/yyyy"
                            minDate={new Date('1900-01-01')}
                            maxDate={new Date('2100-01-01')}
                            showMonthYearDropdown
                            scrollableMonthYearDropdown
                            placeholderText="Data inicial"
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

                <Controller
                    control={control}
                    name="dueDateEnd"
                    render={({ field: { onChange, value } }) => (
                        <DatePicker
                            label="Vencimento final"
                            selected={value}
                            onChange={onChange}
                            dateFormat="dd/MM/yyyy"
                            minDate={new Date('1900-01-01')}
                            maxDate={new Date('2100-01-01')}
                            showMonthYearDropdown
                            scrollableMonthYearDropdown
                            placeholderText="Data final"
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
            </div>

            <div className="md:col-span-2 flex flex-row gap-4">
                <Button
                    type="button"
                    className="flex-1"
                    variant="outline"
                    onClick={clearFilters}
                >
                    Limpar Filtros
                </Button>
                <Button
                    className="flex-1"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? 'Aplicando...' : 'Aplicar Filtros'}
                </Button>
            </div>
        </form>
    );
};