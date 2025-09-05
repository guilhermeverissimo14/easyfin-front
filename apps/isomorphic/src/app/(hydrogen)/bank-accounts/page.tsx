"use client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { PiPlusBold } from "react-icons/pi";

import TableComponent from "@/components/tables/table";
import ModalForm from "@/components/modal/modal-form";
import { useModal } from "@/app/shared/modal-views/use-modal";
import { apiCall } from "@/helpers/apiHelper";
import { api } from "@/service/api";
import { BankAccount, PaginationInfo } from "@/types";
import { ListBankAccountColumn } from "@/app/shared/bank-accounts/column";
import TableLayout from "../tables/table-layout";
import { CreateBankAccount } from "@/app/shared/bank-accounts/create-bank-account";
import { TablePagination } from "@/components/tables/table-pagination";

export default function BankAccounts() {
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(false);
    const [allBankAccounts, setAllBankAccounts] = useState<BankAccount[]>([]);
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

    const getBankAccounts = async () => {
        setLoading(true);
        try {
            const response = await apiCall(() => api.get<BankAccount[]>('/bank-accounts'));

            if (!response) {
                return;
            }

            setAllBankAccounts(response.data);
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

    const updatePaginatedData = (data: BankAccount[], page: number, limit: number) => {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = data.slice(startIndex, endIndex);
        
        setBankAccounts(paginatedData);
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
        updatePaginatedData(allBankAccounts, page, pagination.limit);
    };

    const handleLimitChange = (limit: number) => {
        updatePaginatedData(allBankAccounts, 1, limit);
    };

    useEffect(() => {
        getBankAccounts();
    }, []);

    const pageHeader = {
        title: 'Contas Bancárias',
        breadcrumb: [
            {
                name: 'Dashboard',
            },
            {
                name: 'Contas Bancárias',
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
                            <ModalForm title="Cadastro de Conta Bancária">
                                <CreateBankAccount getBankAccounts={getBankAccounts} />
                            </ModalForm>
                        ),
                        size: 'md',
                    })
                }
                breadcrumb={pageHeader.breadcrumb}
                title={pageHeader.title}
                data={bankAccounts}
                columns={ListBankAccountColumn(getBankAccounts)}
                fileName="contas-bancarias"
                header=""
                action={userRole === 'ADMIN' ? "Cadastrar conta bancária" : ""}
                icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
            >
                <TableComponent
                    title=""
                    column={ListBankAccountColumn(getBankAccounts)}
                    variant="classic"
                    data={bankAccounts}
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