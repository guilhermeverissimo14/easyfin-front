'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from 'rizzui';
import { z } from 'zod';
import { toast } from 'react-toastify';

import { api } from '@/service/api';
import { useModal } from '../modal-views/use-modal';
import { SelectField } from '@/components/input/select-field';
import { LoadingSpinner } from '@/components/loading-spinner';
import { apiCall } from '@/helpers/apiHelper';
import { constCentersModel } from '@/types';

const updateCostCenterSchema = z.object({
   costCenterId: z.string().optional(),
});

type UpdateCostCenterFormData = z.infer<typeof updateCostCenterSchema>;

interface UpdateCostCenterProps {
   cashFlowId: string;
   currentCostCenterId?: string;
   history: string;
   documentNumber?: string;
   onSuccess: () => void;
}

export const UpdateCostCenter = ({ 
   cashFlowId, 
   currentCostCenterId, 
   history, 
   documentNumber, 
   onSuccess 
}: UpdateCostCenterProps) => {
   const [loading, setLoading] = useState(false);
   const [loadingCostCenters, setLoadingCostCenters] = useState(true);
   const [costCenters, setCostCenters] = useState<{ label: string; value: string }[]>([]);
   
   const { closeModal } = useModal();

   const {
      control,
      handleSubmit,
      formState: { errors },
   } = useForm<UpdateCostCenterFormData>({
      resolver: zodResolver(updateCostCenterSchema),
      defaultValues: {
         costCenterId: currentCostCenterId || '',
      },
   });

   useEffect(() => {
      const fetchCostCenters = async () => {
         setLoadingCostCenters(true);
         try {
            const response = await apiCall(() => api.get<constCentersModel[]>('/cost-centers'));
            
            if (response?.data) {
               const costCenterOptions = [
                  { label: 'Nenhum', value: '' },
                  ...response.data.map((center) => ({
                     label: center.name,
                     value: center.id,
                  })),
               ];
               setCostCenters(costCenterOptions);
            }
         } catch (error) {
            console.error('Erro ao carregar centros de custo:', error);
            toast.error('Erro ao carregar centros de custo');
         } finally {
            setLoadingCostCenters(false);
         }
      };

      fetchCostCenters();
   }, []);

   const onSubmit = async (data: UpdateCostCenterFormData) => {
      setLoading(true);

      try {
         await apiCall(() => 
            api.patch(`/cash-flow/${cashFlowId}/update-cost-center`, {
               costCenterId: data.costCenterId || null,
            })
         );

         toast.success('Centro de custo atualizado com sucesso!');
         onSuccess();
         closeModal();
      } catch (error) {
         console.error('Erro ao atualizar centro de custo:', error);
         toast.error('Erro ao atualizar centro de custo');
      } finally {
         setLoading(false);
      }
   };

   if (loadingCostCenters) {
      return (
         <div className="flex h-full w-full items-center justify-center p-10">
            <LoadingSpinner />
         </div>
      );
   }

   return (
      <form
         className="flex w-[100%] flex-col items-center justify-center"
         onSubmit={handleSubmit(onSubmit)}
      >
         <div className="w-full space-y-5">
            <div className="text-center space-y-2 mb-6">
               <div className="bg-gray-50 p-4 rounded-md text-left">
                  <p className="text-sm"><strong>Histórico:</strong> {history}</p>
                  {documentNumber && (
                     <p className="text-sm"><strong>Documento:</strong> {documentNumber}</p>
                  )}
               </div>
            </div>

            <Controller
               control={control}
               name="costCenterId"
               render={({ field: { value, onChange } }) => (
                  <SelectField
                     label="Centro de Custo"
                     placeholder="Selecione o centro de custo"
                     options={costCenters}
                     onChange={(selected) => {
                        onChange(selected);
                     }}
                     value={value || ''}
                     error={errors.costCenterId?.message}
                  />
               )}
            />

            <Button 
               disabled={loading} 
               className="w-full" 
               type="submit" 
               size="lg"
            >
               <span>{loading ? 'Atualizando...' : 'Atualizar Centro de Custo'}</span>
            </Button>
         </div>
      </form>
   );
};
