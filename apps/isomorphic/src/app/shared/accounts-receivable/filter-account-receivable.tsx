'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from 'rizzui';
import { useModal } from '../modal-views/use-modal';
import { SelectField } from '@/components/input/select-field';
import { api } from '@/service/api';
import { ptBR } from 'date-fns/locale';
import { DatePicker } from '@core/ui/datepicker';
import { apiCall } from '@/helpers/apiHelper';

type FilterAccountsReceivableFormData = {
    customerId: string;
    costCenterId: string;
    status: string;
    paymentMethodId: string;
    documentDateStart: string;
    documentDateEnd: string;
    dueDateStart: string;
    dueDateEnd: string;
};

type FilterAccountsReceivableProps = {
    onFilter: (filters: Record<string, any>) => void;
    currentFilters?: Partial<FilterAccountsReceivableFormData>;
};

export const FilterAccountsReceivable = ({ onFilter, currentFilters }: FilterAccountsReceivableProps) => {
    const [customers, setCustomers] = useState<{ label: string; value: string }[]>([]);
    const [costCenters, setCostCenters] = useState<{ label: string; value: string }[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<{ label: string; value: string }[]>([]);

    const { setValue, watch, getValues } = useForm<FilterAccountsReceivableFormData>({
        defaultValues: {
            customerId: currentFilters?.customerId || "",
            costCenterId: currentFilters?.costCenterId || "",
            status: currentFilters?.status || "",
            paymentMethodId: currentFilters?.paymentMethodId || "",
            documentDateStart: currentFilters?.documentDateStart || "",
            documentDateEnd: currentFilters?.documentDateEnd || "",
            dueDateStart: currentFilters?.dueDateStart || "",
            dueDateEnd: currentFilters?.dueDateEnd || "",
        }
    });

    const formData = watch();
    const { closeModal } = useModal();

    const stringToDate = (dateString: string): Date | null => {
        if (!dateString) return null;
        const [year, month, day] = dateString.split('-');
        return new Date(Number(year), Number(month) - 1, Number(day));
    };

    const dateToString = (date: Date | null): string => {
        if (!date) return '';
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [customersRes, costCentersRes, paymentMethodsRes] = await Promise.all([
                    apiCall(() => api.get('/customers')),
                    apiCall(() => api.get('/cost-centers')),
                    apiCall(() => api.get('/payment-methods')),
                ]);

                if (customersRes?.data) {
                    setCustomers(customersRes.data.map((customer: any) => ({
                        label: customer.name,
                        value: customer.id
                    })).sort((a: any, b: any) => String(a.label ?? '').localeCompare(String(b.label ?? ''), 'pt-BR', { sensitivity: 'base' })));
                }

                if (costCentersRes?.data) {
                    setCostCenters(costCentersRes.data.map((center: any) => ({
                        label: center.name,
                        value: center.id
                    })));
                }

                if (paymentMethodsRes?.data) {
                    setPaymentMethods(paymentMethodsRes.data.map((method: any) => ({
                        label: method.name,
                        value: method.id
                    })));
                }
            } catch (error) {
                console.error("Erro ao carregar dados para filtros:", error);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const filters: Record<string, any> = { page: 1, limit: 10 };

        const currentValues = getValues();

        Object.entries(currentValues).forEach(([key, value]) => {
            if (value && value !== "") {
                filters[key] = value;
            }
        });

        onFilter(filters);
        closeModal();
    };

    const handleClear = () => {
        setValue('customerId', '');
        setValue('costCenterId', '');
        setValue('status', '');
        setValue('paymentMethodId', '');
        setValue('documentDateStart', '');
        setValue('documentDateEnd', '');
        setValue('dueDateStart', '');
        setValue('dueDateEnd', '');
        onFilter({ page: 1, limit: 10 });
        closeModal();
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
            <div>
                <SelectField
                    label="Cliente"
                    placeholder="Filtrar por cliente"
                    options={[
                        { label: 'Todos os clientes', value: '' },
                        ...customers
                    ]}
                    onChange={(selected) => {
                        setValue('customerId', selected);
                    }}
                    value={formData.customerId}
                />
            </div>

            <div>
                <SelectField
                    label="Centro de Custo"
                    placeholder="Filtrar por centro de custo"
                    options={[
                        { label: 'Todos os centros de custo', value: '' },
                        ...costCenters
                    ]}
                    onChange={(selected) => {
                        setValue('costCenterId', selected);
                    }}
                    value={formData.costCenterId}
                />
            </div>

            <div>
                <SelectField
                    label="Status"
                    placeholder="Filtrar por status"
                    options={[
                        { label: 'Todos os status', value: '' },
                        { label: 'Em aberto', value: 'PENDING' },
                        { label: 'Recebido', value: 'PAID' },
                        { label: 'Vencido', value: 'OVERDUE' },
                    ]}
                    onChange={(selected) => {
                        setValue('status', selected);
                    }}
                    value={formData.status}
                />
            </div>

            <div>
                <SelectField
                    label="Método de Pagamento"
                    placeholder="Filtrar por método de pagamento"
                    options={[
                        { label: 'Todos os métodos', value: '' },
                        ...paymentMethods
                    ]}
                    onChange={(selected) => {
                        setValue('paymentMethodId', selected);
                    }}
                    value={formData.paymentMethodId}
                />
            </div>

            <div>
                <DatePicker
                    label="Data do Documento - Início"
                    selected={stringToDate(formData.documentDateStart)}
                    onChange={(date) => {
                        setValue('documentDateStart', dateToString(date));
                    }}
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date('1900-01-01')}
                    maxDate={new Date('2100-01-01')}
                    showMonthYearDropdown
                    scrollableMonthYearDropdown
                    placeholderText="Data inicial do documento"
                    popperPlacement="bottom-end"
                    inputProps={{
                        variant: 'outline',
                        inputClassName: 'px-2 py-3 h-auto [&_input]:text-ellipsis ring-0',
                    }}
                    className="flex-grow [&>label>span]:font-medium"
                    locale={ptBR}
                />
            </div>

            <div>
                <DatePicker
                    label="Data do Documento - Fim"
                    selected={stringToDate(formData.documentDateEnd)}
                    onChange={(date) => {
                        setValue('documentDateEnd', dateToString(date));
                    }}
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date('1900-01-01')}
                    maxDate={new Date('2100-01-01')}
                    showMonthYearDropdown
                    scrollableMonthYearDropdown
                    placeholderText="Data final do documento"
                    popperPlacement="bottom-end"
                    inputProps={{
                        variant: 'outline',
                        inputClassName: 'px-2 py-3 h-auto [&_input]:text-ellipsis ring-0',
                    }}
                    className="flex-grow [&>label>span]:font-medium"
                    locale={ptBR}
                />
            </div>

            <div>
                <DatePicker
                    label="Vencimento - Início"
                    selected={stringToDate(formData.dueDateStart)}
                    onChange={(date) => {
                        setValue('dueDateStart', dateToString(date));
                    }}
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date('1900-01-01')}
                    maxDate={new Date('2100-01-01')}
                    showMonthYearDropdown
                    scrollableMonthYearDropdown
                    placeholderText="Data inicial de vencimento"
                    popperPlacement="bottom-end"
                    inputProps={{
                        variant: 'outline',
                        inputClassName: 'px-2 py-3 h-auto [&_input]:text-ellipsis ring-0',
                    }}
                    className="flex-grow [&>label>span]:font-medium"
                    locale={ptBR}
                />
            </div>

            <div>
                <DatePicker
                    label="Vencimento - Fim"
                    selected={stringToDate(formData.dueDateEnd)}
                    onChange={(date) => {
                        setValue('dueDateEnd', dateToString(date));
                    }}
                    dateFormat="dd/MM/yyyy"
                    minDate={new Date('1900-01-01')}
                    maxDate={new Date('2100-01-01')}
                    showMonthYearDropdown
                    scrollableMonthYearDropdown
                    placeholderText="Data final de vencimento"
                    popperPlacement="bottom-end"
                    inputProps={{
                        variant: 'outline',
                        inputClassName: 'px-2 py-3 h-auto [&_input]:text-ellipsis ring-0',
                    }}
                    className="flex-grow [&>label>span]:font-medium"
                    locale={ptBR}
                />
            </div>

            <div className="md:col-span-2 flex flex-row gap-4">
                <Button
                    type="button"
                    className="flex-1"
                    variant="outline"
                    onClick={handleClear}
                >
                    Limpar Filtros
                </Button>
                <Button
                    className="flex-1"
                    type="submit"
                >
                    Aplicar Filtros
                </Button>
            </div>
        </form>
    );
};