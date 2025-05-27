"use client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { PiPlusBold } from "react-icons/pi";

import TableComponent from "@/components/tables/table";
import ModalForm from "@/components/modal/modal-form";
import { useModal } from "@/app/shared/modal-views/use-modal";
import { apiCall } from "@/helpers/apiHelper";
import { api } from "@/service/api";
import { BankAccount } from "@/types";
import { ListBankAccountColumn } from "@/app/shared/bank-accounts/column";
import TableLayout from "../tables/table-layout";
import { CreateBankAccount } from "@/app/shared/bank-accounts/create-bank-account";

export default function BankAccounts() {
    const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(false);

    const { openModal } = useModal();

    const getBankAccounts = async () => {
        setLoading(true);
        try {
            const response = await apiCall(() => api.get<BankAccount[]>('/bank-accounts'));

            if (!response) {
                return;
            }

            setBankAccounts(response.data);
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
                action="Cadastrar conta bancária"
                icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
            >
                <TableComponent
                    title=""
                    column={ListBankAccountColumn(getBankAccounts)}
                    variant="classic"
                    data={bankAccounts}
                    tableHeader={true}
                    searchAble={true}
                    pagination={true}
                    loading={loading}
                />
            </TableLayout>
        </div>
    );
}