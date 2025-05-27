"use client";
import { useEffect, useState } from "react";
import { redirect } from "next/navigation";
import { PiPlusBold } from "react-icons/pi";

import TableComponent from "@/components/tables/table";
import ModalForm from "@/components/modal/modal-form";
import { useModal } from "@/app/shared/modal-views/use-modal";
import { apiCall } from "@/helpers/apiHelper";
import { api } from "@/service/api";
import { ListCustomerColumn } from "@/app/shared/customers/column";
import { CustomerType } from "@/types";
import TableLayout from "../tables/table-layout";
import { CreateCustomer } from "@/app/shared/customers/create-customer";

export default function Customers() {
    const [dataUser, setDataUser] = useState<CustomerType[]>([]);
      const [loading, setLoading] = useState(false);
   
      const { openModal } = useModal();
   
      const getCustomers = async () => {
         setLoading(true);
         try {
            const response = await apiCall(() => api.get<CustomerType[]>('/customers'));
   
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
         }finally{
            setLoading(false);
         }
      };
   
      useEffect(() => {
        getCustomers();
      }, []);

      const pageHeader = {
         title: 'Clientes',
         breadcrumb: [
            {
               // href: routes.dashboard,
               name: 'Dashboard',
            },
            {
               name: 'Clientes',
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
                        <ModalForm title="Cadastro de clientes">
                          <CreateCustomer getCustomers={getCustomers} />
                        </ModalForm>
                     ),
                     customSize: '620px',
                     size: 'lg',
                  })
               }
               columns={ListCustomerColumn(getCustomers)}
               breadcrumb={pageHeader.breadcrumb}
               title={pageHeader.title}
               data={dataUser}
               fileName="clientes"
               header=""
               action="Cadastar cliente"
               icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
            >
               <TableComponent
                  title=""
                  column={ListCustomerColumn(getCustomers)}
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