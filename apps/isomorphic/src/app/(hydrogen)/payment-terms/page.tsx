"use client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { PiPlusBold } from "react-icons/pi";

import TableComponent from "@/components/tables/table";
import ModalForm from "@/components/modal/modal-form";
import { useModal } from "@/app/shared/modal-views/use-modal";
import { apiCall } from "@/helpers/apiHelper";
import { api } from "@/service/api";
import { PaymentTermModel, PaginationInfo } from "@/types";
import { ListPaymentTermColumn } from "@/app/shared/payment-terms/column";
import TableLayout from "../tables/table-layout";
import { CreatePaymentTerm } from "@/app/shared/payment-terms/create-payment-terms";
import { TablePagination } from "@/components/tables/table-pagination";

export default function PaymentTerms() {
    const [paymentTerms, setPaymentTerms] = useState<PaymentTermModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [allPaymentTerms, setAllPaymentTerms] = useState<PaymentTermModel[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    });

    const userRole = (JSON.parse(localStorage.getItem('eas:user') || '{}') as { role: string }).role;

    const { openModal } = useModal();

    const getPaymentTerms = async () => {
        setLoading(true);
        try {
            const response = await apiCall(() => api.get<PaymentTermModel[]>('/payment-terms'));

            if (!response) {
                return;
            }

            setAllPaymentTerms(response.data);
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

    const updatePaginatedData = (data: PaymentTermModel[], page: number, limit: number) => {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = data.slice(startIndex, endIndex);
        
        setPaymentTerms(paginatedData);
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
        updatePaginatedData(allPaymentTerms, page, pagination.limit);
    };

    const handleLimitChange = (limit: number) => {
        updatePaginatedData(allPaymentTerms, 1, limit);
    };

    useEffect(() => {
        getPaymentTerms();
    }, []);

    const pageHeader = {
        title: 'Condições de Pagamento',
        breadcrumb: [
            {
                name: 'Dashboard',
            },
            {
                name: 'Condições de Pagamento',
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
                            <ModalForm title="Cadastro de Condição de Pagamento">
                                <CreatePaymentTerm getPaymentTerms={getPaymentTerms} />
                            </ModalForm>
                        ),
                        size: 'md',
                    })
                }
                breadcrumb={pageHeader.breadcrumb}
                title={pageHeader.title}
                data={paymentTerms}
                columns={ListPaymentTermColumn(getPaymentTerms)}
                fileName="condicoes-de-pagamento"
                header=""
                action={userRole === 'ADMIN' ? "Cadastrar condição" : ""}
                icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
            >
                <TableComponent
                    title=""
                    column={ListPaymentTermColumn(getPaymentTerms)}
                    variant="classic"
                    data={paymentTerms}
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