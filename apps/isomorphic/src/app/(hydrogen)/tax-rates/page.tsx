"use client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { PiPlusBold } from "react-icons/pi";

import TableComponent from "@/components/tables/table";
import ModalForm from "@/components/modal/modal-form";
import { useModal } from "@/app/shared/modal-views/use-modal";
import { apiCall } from "@/helpers/apiHelper";
import { api } from "@/service/api";
import { TaxRateModel, PaginationInfo } from "@/types";
import { ListTaxRateColumn } from "@/app/shared/tax-rates/column";
import TableLayout from "../tables/table-layout";
import { CreateTaxRate } from "@/app/shared/tax-rates/create-tax-rate";
import { TablePagination } from "@/components/tables/table-pagination";

export default function TaxRates() {
    const [taxRates, setTaxRates] = useState<TaxRateModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [allTaxRates, setAllTaxRates] = useState<TaxRateModel[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    });

    const { openModal } = useModal();

     const userRole = (JSON.parse(localStorage.getItem('eas:user') || '{}') as { role: string }).role;

    const getTaxRates = async () => {
        setLoading(true);
        try {
            const response = await apiCall(() => api.get<TaxRateModel[]>('/tax-rates'));

            if (!response) {
                return;
            }

            setAllTaxRates(response.data);
            updatePaginatedData(response.data, 1, pagination.limit);
        } catch (error) {
            if ((error as any)?.response?.status === 401) {
                localStorage.clear();
                redirect('/signin');
            }
        } finally {
            setLoading(false);
        }
    };

    const updatePaginatedData = (data: TaxRateModel[], page: number, limit: number) => {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = data.slice(startIndex, endIndex);
        
        setTaxRates(paginatedData);
        setPagination({
            page,
            limit,
            totalCount: data.length,
            totalPages: Math.ceil(data.length / limit),
            hasNextPage: endIndex < data.length,
            hasPreviousPage: page > 1,
        });
    };

    const handlePageChange = (page: number) => {
        updatePaginatedData(allTaxRates, page, pagination.limit);
    };

    const handleLimitChange = (limit: number) => {
        updatePaginatedData(allTaxRates, 1, limit);
    };

    useEffect(() => {
        getTaxRates();
    }, []);

    const pageHeader = {
        title: 'Alíquotas',
        breadcrumb: [
            {
                name: 'Dashboard',
            },
            {
                name: 'Alíquotas',
            },
            {
                name: 'Listagem',
            },
        ],
    };

    return (
        <div className="mt-8">
            <TableLayout
                openModal={() =>
                    openModal({
                        view: (
                            <ModalForm title="Cadastro de Alíquotas">
                                <CreateTaxRate getTaxRates={getTaxRates} />
                            </ModalForm>
                        ),
                        size: 'md',
                    })
                }
                breadcrumb={pageHeader.breadcrumb}
                title={pageHeader.title}
                data={taxRates}
                columns={ListTaxRateColumn(getTaxRates)}
                fileName="aliquotas"
                header=""
                action={userRole === 'ADMIN' ? "Cadastrar alíquota" : ""}
                icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
            >
                <TableComponent
                    title=""
                    column={ListTaxRateColumn(getTaxRates)}
                    variant="classic"
                    data={taxRates}
                    tableHeader={true}
                    searchAble={true}
                    pagination={false}
                    loading={loading}
                />
                
                <TablePagination 
                    pagination={pagination} 
                    onPageChange={handlePageChange} 
                    onLimitChange={handleLimitChange} 
                />
            </TableLayout>
        </div>
    );
}