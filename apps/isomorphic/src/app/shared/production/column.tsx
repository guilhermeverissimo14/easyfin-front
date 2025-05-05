import { ContractStatus, ContractsType, userType } from '@/types';
import { createColumnHelper } from '@tanstack/react-table';
import TableRowActionGroup from '@core/components/table-utils/table-row-action-group';
import { useModal } from '../modal-views/use-modal';
import ModalForm from '@/components/modal/modal-form';
import { ProductionDetails } from './production-details';

const columnHelper = createColumnHelper<ContractsType>();

export const ListProductionColumn = (getList: () => void) => {
   const { openModal } = useModal();

   const isMobile = window.innerWidth < 768;

   const columns = [

      columnHelper.accessor('producer', {
         id: 'producer',
         size: 160,
         header: 'Nome do produtor',
         cell: ({ row }) => <>{row.original.producer?.name}</>,
      }),

      columnHelper.accessor('hectaresEstimate', {
         id: 'hectaresEstimate',
         size: 160,
         header: 'hectares estimados',
         cell: ({ row }) => <>{row.original.hectaresEstimate} </>,
      }),
      columnHelper.accessor('valuePerHectare', {
         id: 'valuePerHectare',
         size: 160,
         header: 'Valor por hectare',
         cell: ({ row }) => (
            <>
               {new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
               }).format(row.original.valuePerHectare as number)}
            </>
         ),
      }),
      columnHelper.accessor('status', {
         id: 'status',
         size: 120,
         header: 'Status',
         cell: ({ row }) => (
            <>
               {row.original.status === 'NAO_INICIADO' && <span className="rounded-full bg-red-100 p-1 text-red-dark">Não Iniciado</span>}
               {row.original.status === 'EM_ANDAMENTO' && <span className="rounded-full bg-orange-100 p-1 text-orange-dark">Em Andamento</span>}
               {row.original.status === 'FINALIZADO' && <span className="rounded-full bg-green-100 p-1 text-green-dark">Finalizado</span>}
               {!['NAO_INICIADO', 'EM_ANDAMENTO', 'FINALIZADO'].includes(row.original.status as string) && (
                  <span className="text-gray-dark rounded-full bg-gray-100 p-2">{row.original.status}</span>
               )}
            </>
         ),
      }),
      columnHelper.display({
         id: 'actions',
         size: 0,
         header: '',
         cell: ({ row }) => (
            <TableRowActionGroup
               isVisible={true}
               isVisibleDelete={false}
               isVisibleEdit={false}
               openModalList={() =>
                  openModal({
                     view: (
                        <ModalForm width={true} title="Detalhes da produção">
                           <ProductionDetails
                              contractStatus={row.original.status as string}
                              idContract={row.original.id as string}
                              getList={getList}
                           />
                        </ModalForm>
                     ),
                     size: 'lg',
                     customSize: '1024px',
                  })
               }
            />
         ),
      }),
   ];

   return columns.filter((_, index) => {
      return isMobile ? index === 0 || index === columns.length - 1 : true;
   });
};
