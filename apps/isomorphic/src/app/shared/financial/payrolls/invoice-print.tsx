import { RecordsType, userType } from "@/types";
import Image from "next/image";
import { forwardRef } from "react";
import OthersBlock from "./others-block";
import CalcPayBlock from "./calc-pay-block";
import { PayrollInput } from "@/components/input/payroll-input";

interface InvoicePrintProps {
  userDetails: userType | null;
  records: RecordsType[];
  provent: number;
  discount: number;
  month: number;
  year: number;
  totalCommission: number;
  totalGrossValue: number;
}

export const InvoicePrint = forwardRef<HTMLDivElement, InvoicePrintProps>(
  ({ userDetails, records, provent, discount, totalCommission, totalGrossValue, month, year }, ref) => {

    function convertRoles(role: string) {
      switch (role) {
        case 'ADMIN':
          return 'Administrador';
        case 'MANAGER':
          return 'Gerente';
        case 'LOCAL_MANAGER':
          return 'Gerente Local';
        case 'PILOT':
          return 'Piloto';
        case 'FINANCIAL':
          return 'Financeiro';
        default:
          return role;
      }
    }

    return (
      <div className="hidden">
        <div ref={ref}>
          <style>
            {`
              @media print {
                @page {
                  size: A4 portrait; /* Define o tamanho da página como A4 e o formato como retrato */
                  margin: 20mm; /* Define as margens da página */
                }

                .print-container {
                  width: 100%; /* Garante que o conteúdo ocupe toda a largura */
                }
              }
            `}
          </style>
          <div className="print-container px-16 pt-4">


            <div className="grid grid-cols-2 items-center">
              <Image alt="Logo" src="/images/logo.png" width={230} height={150} />
              <div className="space-y-1">
                <PayrollInput
                  className="ms-auto max-w-xs"
                  value={"Recibo de pagamento de salário"}
                  inputClassName="[&_input]:text-end text-lg font-medium"
                  readOnly
                />
                <PayrollInput
                  value={"Minas Drones"}
                  className="ms-auto max-w-xs"
                  inputClassName="text-4xl text-gray-400 [&_input]:text-end font-semibold"
                  readOnly
                />
              </div>
            </div>


            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-0.5">

                <PayrollInput
                  value="Colaborador:"
                  inputClassName="font-medium"
                  readOnly
                />

                <PayrollInput
                  value={userDetails?.name || ""}
                  readOnly
                />

                <div style={{ marginTop: 32 }}>
                  {userDetails?.phone && (
                    <>
                      <PayrollInput
                        value={userDetails.phone}
                        inputClassName="font-medium"
                        readOnly
                      />
                    </>
                  )}

                  {userDetails && userDetails?.email && (
                    <>
                      <PayrollInput
                        value={userDetails.email}
                        inputClassName="font-medium"
                        readOnly
                      />
                    </>
                  )}

                  {userDetails && (
                    <>
                      <PayrollInput
                        value="Guanhães, MG"
                        inputClassName="font-medium"
                        readOnly
                      />
                    </>
                  )}

                  <PayrollInput
                    value={`Referente: ${month}/${year}`}
                    inputClassName="font-medium"
                    readOnly
                  />

                </div>

              </div>
            </div>


            <div className="mt-8">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2 text-left">Descrição</th>
                    <th className="border border-gray-300 px-4 py-2 text-left">Tipo</th>
                    <th className="border border-gray-300 px-4 py-2 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 px-4 py-2">{record.label || ""}</td>
                      <td className="border border-gray-300 px-4 py-2">{record.type}</td>
                      <td className="border border-gray-300 px-4 py-2 text-right">{record.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <CalcPayBlock
              provent={provent}
              discount={discount}
              totalCommission={totalCommission}
              totalGrossValue={totalGrossValue}
            />

            <OthersBlock/>
          </div>
        </div>
      </div>
    );
  }
);

InvoicePrint.displayName = "InvoicePrint";
