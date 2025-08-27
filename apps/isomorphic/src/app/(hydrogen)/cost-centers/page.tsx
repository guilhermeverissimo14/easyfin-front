"use client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { PiPlusBold } from "react-icons/pi";

import TableComponent from "@/components/tables/table";
import ModalForm from "@/components/modal/modal-form";
import { useModal } from "@/app/shared/modal-views/use-modal";
import { apiCall } from "@/helpers/apiHelper";
import { api } from "@/service/api";
import { constCentersModel } from "@/types";
import { ListCostCenterColumn } from "@/app/shared/cost-centers/column";
import TableLayout from "../tables/table-layout";
import { CreateCostCenter } from "@/app/shared/cost-centers/create-cost-center";

export default function CostCenters() {
    const [costCenters, setCostCenters] = useState<constCentersModel[]>([]);
    const [loading, setLoading] = useState(false);

    const { openModal } = useModal();

     const userRole = (JSON.parse(localStorage.getItem('eas:user') || '{}') as { role: string }).role;

    const getCostCenters = async () => {
        setLoading(true);
        try {
            const response = await apiCall(() => api.get<constCentersModel[]>('/cost-centers'));

            if (!response) {
                return;
            }

            setCostCenters(response.data);
        } catch (error) {
            if ((error as any)?.response?.status === 401) {
                localStorage.clear();
                redirect('/signin');
            }
        } finally {
            setLoading(false);
        }
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
                    pagination={true}
                    loading={loading}
                />
            </TableLayout>
        </div>
    );
}