import { useState, useEffect } from "react";
import { useModal } from "../modal-views/use-modal";
import { api } from "@/service/api";
import { Button } from 'rizzui';
import { SelectField } from '@/components/input/select-field';
import { DatePicker } from '@core/ui/datepicker';
import { ptBR } from 'date-fns/locale';

type FilterCashBookFormData = {
   type: string;
   description: string;
   history: string;
   costCenterId: string;
   dateStart: string;
   dateEnd: string;
   valueMin: string;
   valueMax: string;
   bankAccountId: string;
};

type FilterCashBookAdvancedProps = {
   onFilter: (filters: Record<string, any>) => void;
   currentFilters?: Partial<FilterCashBookFormData>;
};

export const FilterCashBookAdvanced = ({
   onFilter,
   currentFilters,
}: FilterCashBookAdvancedProps) => {

   const [formData, setFormData] = useState<FilterCashBookFormData>({
      type: currentFilters?.type || "",
      description: currentFilters?.description || "",
      history: currentFilters?.history || "",
      costCenterId: currentFilters?.costCenterId || "",
      dateStart: currentFilters?.dateStart || "",
      dateEnd: currentFilters?.dateEnd || "",
      valueMin: currentFilters?.valueMin || "",
      valueMax: currentFilters?.valueMax || "",
      bankAccountId: currentFilters?.bankAccountId || "",
   });

   const { closeModal } = useModal();

   const [costCenters, setCostCenters] = useState<{ label: string; value: string }[]>([]);

   const stringToDate = (dateString: string): Date | null => {
      return dateString ? new Date(dateString) : null;
   };

   const dateToString = (date: Date | null): string => {
      return date ? date.toISOString().split('T')[0] : '';
   };

   useEffect(() => {
      const fetchCostCenters = async () => {
         try {
            const costCentersResponse = await api.get('/cost-centers');
            setCostCenters(costCentersResponse.data.map((costCenter: any) => ({
               label: costCenter.name,
               value: costCenter.id
            })));
         } catch (error) {
            console.error('Erro ao buscar centros de custo:', error);
         }
      };

      fetchCostCenters();
   }, []);

   const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const filters: Record<string, any> = { page: 1, limit: 10 };

      Object.entries(formData).forEach(([key, value]) => {
         if (value && value !== "") {
            filters[key] = value;
         }
      });

      onFilter(filters);
      closeModal();
   };

   const handleClear = () => {
      setFormData({
         type: "",
         description: "",
         history: "",
         costCenterId: "",
         dateStart: "",
         dateEnd: "",
         valueMin: "",
         valueMax: "",
         bankAccountId: "",
      });
      onFilter({ page: 1, limit: 10 });
   };

   return (
      <form
         onSubmit={handleSubmit}
         className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
         <div>
            <SelectField
               label="Tipo"
               placeholder="Filtrar por tipo"
               options={[
                  { label: 'Todos', value: '' },
                  { label: 'Crédito', value: 'CREDIT' },
                  { label: 'Débito', value: 'DEBIT' },
               ]}
               onChange={(selected) => {
                  setFormData((prev) => ({ ...prev, type: selected }));
               }}
               value={formData.type}
            />
         </div>

          <div>
            <SelectField
               label="Centro de Custo"
               placeholder="Filtrar por centro de custo"
               options={[
                  { label: 'Todos os centros de custo', value: '' },
                  { label: 'Sem centro de custo', value: 'empty' },
                  ...costCenters
               ]}
               onChange={(selected) => {
                  setFormData((prev) => ({ ...prev, costCenterId: selected }));
               }}
               value={formData.costCenterId}
            />
         </div>

         <div>
            <DatePicker
               label="Data Início"
               selected={stringToDate(formData.dateStart)}
               onChange={(date) => {
                  setFormData((prev) => ({ ...prev, dateStart: dateToString(date) }));
               }}
               dateFormat="dd/MM/yyyy"
               minDate={new Date('1900-01-01')}
               maxDate={new Date('2100-01-01')}
               showMonthYearDropdown
               scrollableMonthYearDropdown
               placeholderText="Data inicial"
               popperPlacement="bottom-end"
               inputProps={{
                  variant: 'outline',
                  inputClassName: 'px-2 py-3 h-auto [&_input]:text-ellipsis ring-0',
               }}
               className="flex-grow [&>label>span]:font-medium"
               locale={ptBR}
            />
         </div>

         <div>
            <DatePicker
               label="Data Fim"
               selected={stringToDate(formData.dateEnd)}
               onChange={(date) => {
                  setFormData((prev) => ({ ...prev, dateEnd: dateToString(date) }));
               }}
               dateFormat="dd/MM/yyyy"
               minDate={new Date('1900-01-01')}
               maxDate={new Date('2100-01-01')}
               showMonthYearDropdown
               scrollableMonthYearDropdown
               placeholderText="Data final"
               popperPlacement="bottom-end"
               inputProps={{
                  variant: 'outline',
                  inputClassName: 'px-2 py-3 h-auto [&_input]:text-ellipsis ring-0',
               }}
               className="flex-grow [&>label>span]:font-medium"
               locale={ptBR}
            />
         </div>
         <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Mínimo
               </label>
               <input
                  type="number"
                  step="0.01"
                  value={formData.valueMin}
                  onChange={(e) =>
                     setFormData((prev) => ({ ...prev, valueMin: e.target.value }))
                  }
                  placeholder="0.00"
                  className="block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Máximo
               </label>
               <input
                  type="number"
                  step="0.01"
                  value={formData.valueMax}
                  onChange={(e) =>
                     setFormData((prev) => ({ ...prev, valueMax: e.target.value }))
                  }
                  placeholder="0.00"
                  className="block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
               />
            </div>
         </div>

         <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição
               </label>
               <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                     setFormData((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Buscar por descrição"
                  className="block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
               />
            </div>

            <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                  Histórico
               </label>
               <input
                  type="text"
                  value={formData.history}
                  onChange={(e) =>
                     setFormData((prev) => ({ ...prev, history: e.target.value }))
                  }
                  placeholder="Buscar por histórico"
                  className="block w-full px-3 py-2 rounded-md border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
               />
            </div>
         </div>

         <div className="md:col-span-2 flex flex-row gap-4">
            <Button
               type="button"
               className="flex-1"
               variant="outline"
               onClick={handleClear}
            >
               Limpar Filtros
            </Button>
            <Button
               className="flex-1"
               type="submit"
            >
               Aplicar Filtros
            </Button>
         </div>
      </form>
   );
};