"use client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { PiPlusBold } from "react-icons/pi";

import TableComponent from "@/components/tables/table";
import ModalForm from "@/components/modal/modal-form";
import { useModal } from "@/app/shared/modal-views/use-modal";
import { apiCall } from "@/helpers/apiHelper";
import { api } from "@/service/api";
import { SupplierType } from "@/types";
import { CreateSupplier } from "@/app/shared/suppliers/create-supplier";
import { ListSupplierColumn } from "@/app/shared/suppliers/column";
import TableLayout from "../tables/table-layout";

export default function Suppliers() {
    const [dataUser, setDataUser] = useState<SupplierType[]>([]);
    const [loading, setLoading] = useState(false);

    const { openModal } = useModal();

    const getSuppliers = async () => {
        setLoading(true);
        try {
            const response = await apiCall(() => api.get<SupplierType[]>('/suppliers'));

            if (!response) {
                return;
            }

            setDataUser(response.data);
            setLoading(loading);
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
                action="Cadastar fornecedor"
                icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
            >
                <TableComponent
                    title=""
                    column={ListSupplierColumn(getSuppliers)}
                    variant="classic"
                    data={dataUser}
                    tableHeader={true}
                    searchAble={true}
                    pagination={true}
                    loading={loading}
                />
            </TableLayout>
        </div>
    );
}