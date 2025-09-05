"use client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { PiPlusBold } from "react-icons/pi";

import TableComponent from "@/components/tables/table";
import ModalForm from "@/components/modal/modal-form";
import { useModal } from "@/app/shared/modal-views/use-modal";
import { apiCall } from "@/helpers/apiHelper";
import { api } from "@/service/api";
import { constCentersModel, PaginationInfo } from "@/types";
import { ListCostCenterColumn } from "@/app/shared/cost-centers/column";
import TableLayout from "../tables/table-layout";
import { CreateCostCenter } from "@/app/shared/cost-centers/create-cost-center";
import { TablePagination } from "@/components/tables/table-pagination";

export default function CostCenters() {
    const [costCenters, setCostCenters] = useState<constCentersModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [allCostCenters, setAllCostCenters] = useState<constCentersModel[]>([]);
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

    const getCostCenters = async () => {
        setLoading(true);
        try {
            const response = await apiCall(() => api.get<constCentersModel[]>('/cost-centers'));

            if (!response) {
                return;
            }

            setAllCostCenters(response.data);
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

    const updatePaginatedData = (data: constCentersModel[], page: number, limit: number) => {
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedData = data.slice(startIndex, endIndex);
        
        setCostCenters(paginatedData);
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
        updatePaginatedData(allCostCenters, page, pagination.limit);
    };

    const handleLimitChange = (limit: number) => {
        updatePaginatedData(allCostCenters, 1, limit);
    };

    useEffect(() => {
        getCostCenters();
    }, []);

    const pageHeader = {
        title: 'Centros de Custo',
        breadcrumb: [
            {
                name: 'Dashboard',
            },
            {
                name: 'Centros de Custo',
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
                            <ModalForm title="Cadastro de Centro de Custo">
                                <CreateCostCenter getCostCenters={getCostCenters} />
                            </ModalForm>
                        ),
                        size: 'md',
                    })
                }
                breadcrumb={pageHeader.breadcrumb}
                title={pageHeader.title}
                data={costCenters}
                columns={ListCostCenterColumn(getCostCenters)}
                fileName="centros-de-custo"
                header=""
                action={userRole === 'ADMIN' ? "Cadastrar centro de custo" : ""}
                icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
            >
                <TableComponent
                    title=""
                    column={ListCostCenterColumn(getCostCenters)}
                    variant="classic"
                    data={costCenters}
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