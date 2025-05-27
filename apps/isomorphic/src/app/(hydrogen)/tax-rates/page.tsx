"use client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { PiPlusBold } from "react-icons/pi";

import TableComponent from "@/components/tables/table";
import ModalForm from "@/components/modal/modal-form";
import { useModal } from "@/app/shared/modal-views/use-modal";
import { apiCall } from "@/helpers/apiHelper";
import { api } from "@/service/api";
import { TaxRateModel } from "@/types";
import { ListTaxRateColumn } from "@/app/shared/tax-rates/column";
import TableLayout from "../tables/table-layout";
import { CreateTaxRate } from "@/app/shared/tax-rates/create-tax-rate";

export default function TaxRates() {
    const [taxRates, setTaxRates] = useState<TaxRateModel[]>([]);
    const [loading, setLoading] = useState(false);

    const { openModal } = useModal();

    const getTaxRates = async () => {
        setLoading(true);
        try {
            const response = await apiCall(() => api.get<TaxRateModel[]>('/tax-rates'));

            if (!response) {
                return;
            }

            setTaxRates(response.data);
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
                action="Cadastrar alíquota"
                icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
            >
                <TableComponent
                    title=""
                    column={ListTaxRateColumn(getTaxRates)}
                    variant="classic"
                    data={taxRates}
                    tableHeader={true}
                    searchAble={true}
                    pagination={true}
                    loading={loading}
                />
            </TableLayout>
        </div>
    );
}