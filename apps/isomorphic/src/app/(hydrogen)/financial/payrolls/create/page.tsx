"use client";

import PageHeader from "@/app/shared/page-header";
import PrintButton from "@/app/shared/print-button";
import { useReactToPrint } from 'react-to-print';
import { RefObject, useEffect, useRef, useState } from 'react';
import { Button } from "rizzui/button";
import { toast } from "react-toastify";

import FirstBlock from "../../../../shared/financial/payrolls/first-block";
import SecondBlock, { SecondBlockProps } from "../../../../shared/financial/payrolls/second-block";
import TableBlock from "../../../../shared/financial/payrolls/table-block";
import { api } from "@/service/api";
import CalcPayBlock from "../../../../shared/financial/payrolls/calc-pay-block";
import OthersBlock from "../../../../shared/financial/payrolls/others-block";
import { CustomErrorLogin, RecordsType, userType } from "@/types";
import { InvoicePrint } from "../../../../shared/financial/payrolls/invoice-print";
import { useRouter } from "next/navigation";
import { routes } from "@/config/routes";
import ConfirmPopover from "@/components/popover/confirm-popover";

const pageHeader = {
    title: 'Folha de pagamento',
    breadcrumb: [
        {
            name: 'Dashboard',
        },
        {
            name: 'Folha de pagamento',
        },
        {
            name: 'Nova folha',
        },
    ],
};

// se tipar essas props da erro no build
export default function PayrollCreate({ payrollEditId, payrollCloneId }: any) {

    const [isEdit, setIsEdit] = useState(false);
    const [isClone, setIsClone] = useState(false);
    const [userId, setUserId] = useState('');
    const [month, setMonth] = useState<number | undefined>(undefined);
    const [monthEdit, setMonthEdit] = useState<number | undefined>(undefined);
    const [yearEdit, setYearEdit] = useState<number | undefined>(undefined);
    const [year, setYear] = useState<number | undefined>(undefined);
    const [provent, setProvent] = useState(0);
    const [discount, setDiscount] = useState(0);
    const [records, setRecords] = useState<RecordsType[]>([]);
    const [userDetails, setUserDetails] = useState<userType | null>(null);
    const [totalCommission, setTotalCommission] = useState(0);
    const [totalGrossValue, setTotalGrossValue] = useState(0);
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const printRef = useRef<Element>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef as RefObject<Element>,
    });

    const loadPayrollData = async (id: string) => {
        try {
            const response = await api.get(`/payrolls/${id}`);
            const payroll = response.data;
            setUserId(payroll.userId);
            setMonthEdit(payroll.month);
            setYearEdit(payroll.year);
            setRecords(payroll.launchRecords);
            setTotalCommission(payroll.totalCommission || 0);
            setTotalGrossValue(payroll.totalGrossValue || 0);

            getUserById(payroll.userId);
        } catch (error) {
            console.error("Erro ao carregar folha de pagamento:", error);
            toast.error("Erro ao carregar folha de pagamento.");
        }
    };
    const handleDataChange = (data: SecondBlockProps) => {
        setUserId(data.userId as string);
        setMonth(data.month as number);
        setYear(data.year as number);
        setTotalCommission(data.totalCommission as number);
        setTotalGrossValue(data.totalGrossValue as number);
    };

    const handleTotalsChange = (totals: { provent: number; discount: number }) => {
        setProvent(totals.provent);
        setDiscount(totals.discount);
    };


    const handleRecordsChange = (updatedRecords: RecordsType[]) => {
        setRecords(updatedRecords);
    };

    async function sendData(isClosed: boolean) {

        setLoading(true);

        const formatCurrencyToNumber = (value: string): number => {
            return Number(
                value.replace(/[^\d,.-]/g, "")
                    .replace(/\./g, "")
                    .replace(",", ".")
            ) || 0;
        };

        const formattedRecords = records.map(record => ({
            ...record,
            amount: formatCurrencyToNumber(record.amount || "0")
        }));


        const data = {
            "userId": userId,
            "month": month,
            "year": year,
            "launchRecords": formattedRecords,
            "totalValue": provent - discount,
            "isClosed": isClosed
        }

        try {
            if (payrollEditId) {
                await api.put(`/payrolls/${payrollEditId}`, data);
                toast.success("Folha de pagamento atualizada com sucesso");
            } else {
                await api.post("/payrolls", data);
                toast.success("Folha de pagamento criada com sucesso");
            }

            router.push(routes.financial.payrolls);
        } catch (error) {
            const err = error as CustomErrorLogin;
            toast.error(
                err.response?.data?.message || "Erro ao salvar folha de pagamento"
            );
            console.error("Erro ao salvar folha de pagamento:", err);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }

    async function getUserById(userId: string) {
        try {
            const response = await api.get<userType>(`/users/${userId}`);
            setUserDetails(response.data);
        } catch (error) {
            console.error('Erro ao buscar detalhes do usuário:', error);
        }
    }

    useEffect(() => {
        if (userId) {
            getUserById(userId);
        }
    }, [userId]);

    useEffect(() => {
        if (payrollEditId) {
            setIsEdit(true);
            loadPayrollData(payrollEditId);
        } else if (payrollCloneId) {
            setIsClone(true);
            loadPayrollData(payrollCloneId);
        }
    }, [payrollEditId]);

    return (
        <>
            <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb}>
                <div className="mt-4 flex items-center gap-3 @lg:mt-0">
                    <PrintButton onClick={() => handlePrint()} />
                </div>
            </PageHeader>

            <InvoicePrint
                ref={printRef as any}
                userDetails={userDetails}
                records={records}
                provent={provent}
                discount={discount}
                totalCommission={totalCommission}
                totalGrossValue={totalGrossValue}
                month={month as number}
                year={year as number}
            />

            <div className="rounded-2xl p-0 md:p-8 w-full">
                <div className="custom-scrollbar overflow-x-auto scroll-smooth w-full">
                    <form
                        className="mx-0 md:mx-auto md:w-[840px] rounded-xl border border-gray-200 bg-white p-10 shadow-sm"
                    >
                        <FirstBlock />

                        <SecondBlock
                            isEdit={isEdit}
                            onDataChange={handleDataChange}
                            userDetails={userDetails}
                            monthProp={monthEdit as number}
                            yearProp={yearEdit as number}
                        />
                        {userId && month && year && (
                            <>
                                <TableBlock
                                    onRecordsChange={handleRecordsChange}
                                    onTotalsChange={handleTotalsChange}
                                    launchRecord={records}
                                    isEdit={isEdit}
                                    isClone={isClone}
                                    totalCommission={totalCommission}
                                />

                                <CalcPayBlock
                                    provent={provent}
                                    discount={discount}
                                    totalCommission={totalCommission}
                                    totalGrossValue={totalGrossValue}
                                />

                                <OthersBlock />
                            </>
                        )}
                    </form>

                    <div className="w-full flex flex-col items-center justify-center md:flex-row gap-4 md-gap-0  mt-8">
                        <Button
                            onClick={() => router.push(routes.financial.payrolls)}
                            variant="outline"
                            className="text-red-500 w-[90%] md:w-auto"
                        >
                            Cancelar
                        </Button>

                        <Button
                            onClick={() => sendData(false)}
                            disabled={loading}
                            variant="outline"
                            className="w-[90%] md:w-auto">
                            {loading ? 'Carregando...' : (isEdit ? 'Atualizar e continuar' : 'Salvar e continuar')}
                        </Button>

                        <ConfirmPopover
                            title="Finalizar Lançamento"
                            description="Uma vez finalizada, a folha não poderá mais ser modificada. Deseja continuar?"
                            onConfirm={() => sendData(true)} // Chama a função para finalizar o lançamento
                            confirmText="Sim, finalizar"
                            cancelText="Cancelar"
                        >
                            <Button
                                disabled={loading}
                                className="w-[90%] md:w-auto"
                            >
                                {loading ? "Carregando..." : "Finalizar Lançamento"}
                            </Button>
                        </ConfirmPopover>
                    </div>
                </div>
            </div>
        </>
    );
}
