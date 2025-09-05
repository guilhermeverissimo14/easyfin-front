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
import { CustomerType, PaginationInfo } from "@/types";
import TableLayout from "../tables/table-layout";
import { CreateCustomer } from "@/app/shared/customers/create-customer";
import { TablePagination } from "@/components/tables/table-pagination";

export default function Customers() {
    const [dataUser, setDataUser] = useState<CustomerType[]>([]);
    const [loading, setLoading] = useState(false);
    const [allCustomers, setAllCustomers] = useState<CustomerType[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo>({
        page: 1,
        limit: 10,
        totalCount: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
    });

       const userRole = (JSON.parse(localStorage.getItem('eas:user') || '{}') as { role: string }).role;
   
      const { openModal } = useModal();
   
      const getCustomers = async () => {
         setLoading(true);
         try {
            const response = await apiCall(() => api.get<CustomerType[]>('/customers'));
   
            if (!response) {
               return;
            }
   
            setAllCustomers(response.data);
            updatePaginatedData(response.data, 1, pagination.limit);
         } catch (error) {
            if ((error as any)?.response?.status === 401) {
               localStorage.clear();
               redirect('/signin');
            }
         }finally{
            setLoading(false);
         }
      };

      const updatePaginatedData = (data: CustomerType[], page: number, limit: number) => {
         const startIndex = (page - 1) * limit;
         const endIndex = startIndex + limit;
         const paginatedData = data.slice(startIndex, endIndex);
         
         setDataUser(paginatedData);
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
         updatePaginatedData(allCustomers, page, pagination.limit);
      };

      const handleLimitChange = (limit: number) => {
         updatePaginatedData(allCustomers, 1, limit);
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
               action={userRole === 'ADMIN' ? "Cadastrar cliente" : ""}
               icon={<PiPlusBold className="me-1.5 h-[17px] w-[17px]" />}
            >
               <TableComponent
                  title=""
                  column={ListCustomerColumn(getCustomers)}
                  variant="classic"
                  data={dataUser}
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