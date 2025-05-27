"use client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { PiPlusBold } from "react-icons/pi";

import TableComponent from "@/components/tables/table";
import ModalForm from "@/components/modal/modal-form";
import { useModal } from "@/app/shared/modal-views/use-modal";
import { apiCall } from "@/helpers/apiHelper";
import { api } from "@/service/api";
import { PaymentTermModel } from "@/types";
import { ListPaymentTermColumn } from "@/app/shared/payment-terms/column";
import TableLayout from "../tables/table-layout";
import { CreatePaymentTerm } from "@/app/shared/payment-terms/create-payment-terms";

export default function PaymentTerms() {
    const [paymentTerms, setPaymentTerms] = useState<PaymentTermModel[]>([]);
    const [loading, setLoading] = useState(false);

    const { openModal } = useModal();

    const getPaymentTerms = async () => {
        setLoading(true);
        try {
            const response = await apiCall(() => api.get<PaymentTermModel[]>('/payment-terms'));

            if (!response) {
                return;
            }

            setPaymentTerms(response.data);
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
                action="Cadastrar condição"
                icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
            >
                <TableComponent
                    title=""
                    column={ListPaymentTermColumn(getPaymentTerms)}
                    variant="classic"
                    data={paymentTerms}
                    tableHeader={true}
                    searchAble={true}
                    pagination={true}
                    loading={loading}
                />
            </TableLayout>
        </div>
    );
}