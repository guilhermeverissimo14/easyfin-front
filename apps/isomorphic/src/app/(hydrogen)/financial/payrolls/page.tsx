'use client';
import { useEffect, useState } from 'react';
import { redirect, useRouter } from 'next/navigation';
import TableComponent from '@/components/tables/table';
import { apiCall } from '@/helpers/apiHelper';
import { api } from '@/service/api';
import { routes } from '@/config/routes';
import { PiPlusBold } from 'react-icons/pi';
import TableLayout from '../../tables/table-layout';
import { ListPayrollsColumn } from '@/app/shared/financial/payrolls/column';
import { AllPayrollsType } from '@/types';
import Filters from '@/components/tables/filters';
import { ptBR } from 'date-fns/locale';
import { DatePicker } from '@core/ui/datepicker';
import { PayrollSelect } from '@/components/input/payroll-select';

export default function PayrollList() {
   const [dataPayroll, setDataPayroll] = useState<AllPayrollsType[]>([]);
   const [loading, setLoading] = useState(true);
   const [month, setMonth] = useState<number | undefined>(new Date().getMonth() + 1);
   const [year, setYear] = useState<number | undefined>(new Date().getFullYear());
   const [isClosed, setIsClosed] = useState<boolean | undefined>(undefined);
   const [role, setRole] = useState<string | undefined>(undefined);

   const router = useRouter();

   const getPayrolls = async () => {
      try {
         setLoading(true);
         const response = await apiCall(() =>
            api.get('/payrolls', {
               params: { month, year, isClosed, role }
            })
         );
         setDataPayroll(response?.data || []);
      } catch (error) {
         console.error('Erro ao buscar folhas de pagamento:', error);
         if ((error as any)?.response?.status === 401) {
            localStorage.clear();
            redirect('/signin');
         }
      } finally {
         setLoading(false);
         router.refresh();
      }
   };

   const closedOptions = [
      { value: 'todos', label: 'Todos' },
      { value: 'false', label: 'Não finalizado' },
      { value: 'true', label: 'Finalizado' },
   ];

   const roleOptions = [
      { value: 'todos', label: 'Todos' },
      { value: 'PILOT', label: 'Piloto' },
      { value: 'LOCAL_MANAGER', label: 'Gerente Local' },
   ];

   const pageHeader = {
      title: 'Folha de pagamento',
      breadcrumb: [
         {
            // href: routes.dashboard,
            name: 'Dashboard'
         },
         { name: 'Folha de pagamento' },
         { name: 'Listagem' },
      ],
   };

   useEffect(() => {
      getPayrolls();
   }, [month, year, isClosed, role]);


   return (
      <div className="mt-8">
         <TableLayout
            payrollNavigation={true}
            navigation={() => router.push(routes.financial.payrollsCreate)}
            breadcrumb={pageHeader.breadcrumb}
            title={pageHeader.title}
            data={dataPayroll}
            fileName="usuarios"
            header=""
            action="Criar folha"
            icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
         >
            <Filters>
               <DatePicker
                  selected={month && year ? new Date(year, month - 1) : null} // Define null se month ou year forem undefined
                  onChange={(date: Date | null) => {
                     if (date) {
                        setMonth(date.getMonth() + 1);
                        setYear(date.getFullYear());
                     } else {
                        setMonth(undefined); // Limpa o mês
                        setYear(undefined);  // Limpa o ano
                     }
                  }}
                  dateFormat="MMMM, yyyy"
                  locale={ptBR}
                  placeholderText="Selecione uma data"
                  inputProps={{
                     inputClassName:
                        "shadow-none ring-0 h-auto py-1 md:ml-0 border border-gray-400 hover:border-primary px-2 text-gray-900 dark:text-gray-0",
                     prefixClassName: "hidden",
                  }}
                  removeData={true}
                  onClickRemove={() => {
                     setMonth(undefined);
                     setYear(undefined);
                  }}
               />

               <PayrollSelect
                  placeholder="Selecione o status"
                  inputClassName="md:w-[200px] w-full"
                  value={isClosed === undefined ? 'todos' : isClosed.toString()}
                  onChange={(value) => setIsClosed(value === 'todos' ? undefined : value === 'true')}
                  options={closedOptions}
               />

               <PayrollSelect
                  placeholder="Selecione a função"
                  inputClassName="md:w-[200px] w-full"
                  value={role === undefined ? 'todos' : role}
                  onChange={(value) => setRole(value === 'todos' ? undefined : value)}
                  options={roleOptions}
               />
            </Filters>
            <TableComponent
               title=""
               column={ListPayrollsColumn(getPayrolls)}
               variant="classic"
               data={dataPayroll}
               tableHeader={true}
               searchAble={false}
               pagination={true}
               loading={loading}
            />
         </TableLayout>
      </div>
   );
}
