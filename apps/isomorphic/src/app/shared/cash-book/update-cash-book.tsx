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
import { InputField } from '@/components/input/input-field';
import { LoadingSpinner } from '@/components/loading-spinner';
import { apiCall } from '@/helpers/apiHelper';
import { constCentersModel } from '@/types';

const updateCostCenterSchema = z.object({
   costCenterId: z.string().optional(),
   historic: z.string().optional(),
   description: z.string().optional(),
});

type UpdateCostCenterFormData = z.infer<typeof updateCostCenterSchema>;

interface UpdateCostCenterProps {
   cashFlowId: string;
   currentCostCenterId?: string;
   historic: string;
   description: string;
   documentNumber?: string;
   onSuccess: () => void;
}

export const UpdateCashBook = ({ 
   cashFlowId, 
   currentCostCenterId, 
   historic, 
   description,
   documentNumber, 
   onSuccess 
}: UpdateCostCenterProps) => {
   const [loading, setLoading] = useState(false);
   const [loadingCostCenters, setLoadingCostCenters] = useState(true);
   const [costCenters, setCostCenters] = useState<{ label: string; value: string }[]>([]);
   
   const { closeModal } = useModal();

   const {
      control,
      register,
      handleSubmit,
      formState: { errors },
   } = useForm<UpdateCostCenterFormData>({
      resolver: zodResolver(updateCostCenterSchema),
      defaultValues: {
         costCenterId: currentCostCenterId || '',
         historic: historic || '',
         description: description || '',
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
            api.put(`/cash-flow/${cashFlowId}`, {
               costCenterId: data.costCenterId || null,
               historic: data.historic || '',
               description: data.description || '',
            })
         );

         toast.success('Lançamento atualizado com sucesso!');
         onSuccess();
         closeModal();
      } catch (error) {
         console.error('Erro ao atualizar lançamento:', error);
         toast.error('Erro ao atualizar lançamento');
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
                  <p className="text-sm"><strong>Documento:</strong> {documentNumber || '-'}</p>
               </div>
            </div>

            <InputField
               label="Histórico"
               placeholder="Informe o histórico"
               type="text"
               register={register('historic')}
               error={errors.historic?.message}
            />

            <InputField
               label="Descrição"
               placeholder="Informe a descrição"
               type="text"
               register={register('description')}
               error={errors.description?.message}
            />

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
               <span>{loading ? 'Atualizando...' : 'Atualizar Lançamento'}</span>
            </Button>
         </div>
      </form>
   );
};
