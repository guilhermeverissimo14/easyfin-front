'use client';
import { useEffect, useState } from 'react';
import { VerticalTimeline, VerticalTimelineElement } from 'react-vertical-timeline-component';
import 'react-vertical-timeline-component/style.min.css';
import { api } from '@/service/api';
import { FaTractor } from 'react-icons/fa';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CustomErrorLogin, ProductionRecord } from '@/types';
import { Button } from 'rizzui/button';
import { CreateProduction } from './create-production';
import { useModal } from '../modal-views/use-modal';
import { toast } from 'react-toastify';
import EditableInput from '@/components/input/editable-input';
import { SkeletonLoader } from '@/components/skeleton/skeleton';

interface ProductionDetailsProps {
   contractStatus: string;
   idContract: string;
   getList: () => void;
}

export const ProductionDetails = ({ idContract, getList, contractStatus }: ProductionDetailsProps) => {
   const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([]);
   const [createProduction, setCreateProduction] = useState(false);
   const [showConfirmModal, setShowConfirmModal] = useState(false);
   const [loading, setLoading] = useState(false);

   const idPilot = (JSON.parse(localStorage.getItem('eas:user') || '{}') as { id: string }).id;

   const { closeModal } = useModal();

   const fetchProductionRecords = async () => {
      setLoading(true);
      try {
         const response = await api.get<ProductionRecord[]>(`/production-records/pilot/${idPilot}/contract/${idContract}`);
         setProductionRecords(response.data);
      } catch (error) {
         // console.error('Erro ao buscar registros de produção:', error);
      } finally {
         setLoading(false);
      }
   };

   const finalizeProduction = async () => {
      try {
         await api.put(`/service-contracts/${idContract}/status`, { status: 'FINALIZADO' });
         toast.success('Produção finalizada com sucesso!');
         getList();
         closeModal();
      } catch (error) {
         const err = error as CustomErrorLogin;
         toast.error(err.response.data.message || 'Erro ao finalizar produção');
         console.error('Erro ao finalizar produção:', error);
      }
   };

   useEffect(() => {
      fetchProductionRecords();
   }, [idPilot, idContract]);

   return (
      <>
         <div className={!createProduction ? 'w-full rounded-lg bg-gray-100 p-4' : 'hidden'}>
            {loading ? (
               <SkeletonLoader />
            ) : productionRecords.length === 0 ? (
               !createProduction && <h5 className="text-center text-gray-600">Nenhuma produção lançada até o momento</h5>
            ) : (
               <VerticalTimeline className="max-h-[50vh] w-full overflow-y-auto">
                  {productionRecords.map((record) => (
                     <VerticalTimelineElement
                        className="vertical-timeline-element--work pr-5"
                        contentArrowStyle={{ borderRight: '7px solid rgb(0 128 0)' }}
                        key={record.id}
                        date={format(new Date(record.date), 'dd/MM/yyyy', { locale: ptBR })}
                        iconStyle={{ background: 'rgb(0 128 0)', color: '#fff' }}
                        icon={<FaTractor />}
                     >
                        <div className="flex flex-col gap-2">
                           <li className="flex items-center gap-2">
                              <h2 className="text-xs font-bold text-gray-900 md:whitespace-nowrap md:text-base">Hectares Trabalhados:</h2>
                              {contractStatus === 'FINALIZADO' ? (
                                 <span className="text-xs font-semibold text-gray-700 md:text-base">{record.hectaresWorked}</span>
                              ) : (
                                 <EditableInput
                                    value={record.hectaresWorked || 0}
                                    onUpdate={async (newValue) => {
                                       try {
                                          await api.put(`/production-records/${record.id}`, {
                                             hectaresWorked: parseFloat(newValue),
                                          });
                                          toast.success('Hectares trabalhados atualizados com sucesso!');
                                          fetchProductionRecords();
                                       } catch (error) {
                                          toast.error('Erro ao atualizar hectares trabalhados');
                                          console.error('Erro ao atualizar hectares trabalhados:', error);
                                       }
                                    }}
                                 />
                              )}
                           </li>
                           <li className="flex items-center gap-2">
                              <h2 className="text-xs font-bold text-gray-900 md:text-base">Referência:</h2>
                              <span className="text-[8px] font-semibold text-gray-700 md:text-base">{record.contract.reference}</span>
                           </li>
                        </div>
                     </VerticalTimelineElement>
                  ))}
               </VerticalTimeline>
            )}
         </div>

         {contractStatus !== 'FINALIZADO' && (
            <div className="mb-4 mt-4 flex flex-col justify-center">
               {!createProduction && (
                  <Button className="w-full md:w-auto" onClick={() => setCreateProduction(true)}>
                     Lançar produção
                  </Button>
               )}

               {productionRecords.length > 0 && (
                  <Button variant="outline" className="mt-2 w-full md:w-auto" onClick={() => setShowConfirmModal(true)}>
                     Finalizar Produção
                  </Button>
               )}
            </div>
         )}

         {createProduction && (
            <CreateProduction
               contractId={idContract}
               getList={fetchProductionRecords}
               onClose={() => setCreateProduction(false)}
               createProduction={createProduction}
               setCreateProduction={setCreateProduction}
            />
         )}

         {showConfirmModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
               <div className="w-full max-w-sm rounded-lg bg-white p-6 shadow-lg">
                  <h2 className="mb-4 text-center text-lg font-bold">Tem certeza que deseja finalizar esse serviço?</h2>
                  <div className="flex justify-end gap-3">
                     <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
                        Cancelar
                     </Button>
                     <Button
                        onClick={() => {
                           finalizeProduction();
                           setShowConfirmModal(false);
                        }}
                     >
                        Confirmar
                     </Button>
                  </div>
               </div>
            </div>
         )}
      </>
   );
};
