"use client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { PiPlusBold } from "react-icons/pi";

import TableComponent from "@/components/tables/table";
import ModalForm from "@/components/modal/modal-form";
import { useModal } from "@/app/shared/modal-views/use-modal";
import { apiCall } from "@/helpers/apiHelper";
import { api } from "@/service/api";
import { SupplierType, PaginationInfo } from "@/types";
import { CreateSupplier } from "@/app/shared/suppliers/create-supplier";
import { ListSupplierColumn } from "@/app/shared/suppliers/column";
import TableLayout from "../tables/table-layout";
import { TablePagination } from "@/components/tables/table-pagination";

export default function Suppliers() {
    const [dataUser, setDataUser] = useState<SupplierType[]>([]);
    const [loading, setLoading] = useState(false);
    const [allSuppliers, setAllSuppliers] = useState<SupplierType[]>([]);
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

    const getSuppliers = async () => {
        setLoading(true);
        try {
            const response = await apiCall(() => api.get<SupplierType[]>('/suppliers'));

            if (!response) {
                return;
            }

            setAllSuppliers(response.data);
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

    const updatePaginatedData = (data: SupplierType[], page: number, limit: number) => {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = data.slice(startIndex, endIndex);
        
        setDataUser(paginatedData);
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
        updatePaginatedData(allSuppliers, page, pagination.limit);
    };

    const handleLimitChange = (limit: number) => {
        updatePaginatedData(allSuppliers, 1, limit);
    };

    useEffect(() => {
        getSuppliers();
    }, []);

    const pageHeader = {
        title: 'Fornecedores',
        breadcrumb: [
            {
                // href: routes.dashboard,
                name: 'Dashboard',
            },
            {
                name: 'Fornecedores',
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
                            <ModalForm title="Cadastro de fornecedores">
                                <CreateSupplier getSuppliers={getSuppliers} />
                            </ModalForm>
                        ),
                        customSize: '620px',
                        size: 'lg',
                    })
                }
                breadcrumb={pageHeader.breadcrumb}
                title={pageHeader.title}
                data={dataUser}
                columns={ListSupplierColumn(getSuppliers)}
                fileName="fornecedores"
                header=""
                action={userRole === 'ADMIN' ? "Cadastrar fornecedor" : ""}
                icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
            >
                <TableComponent
                    title=""
                    column={ListSupplierColumn(getSuppliers)}
                    variant="classic"
                    data={dataUser}
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