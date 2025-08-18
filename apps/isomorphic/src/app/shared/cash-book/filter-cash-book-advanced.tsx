import { useState } from "react";
import { useModal } from "../modal-views/use-modal";

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
            <label className="block text-sm font-medium text-gray-700 mb-1">
               Tipo
            </label>
            <select
               value={formData.type}
               onChange={(e) =>
                  setFormData((prev) => ({ ...prev, type: e.target.value }))
               }
               className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
               <option value="">Todos</option>
               <option value="CREDIT">Crédito</option>
               <option value="DEBIT">Débito</option>
            </select>
         </div>

         <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
               Data Início
            </label>
            <input
               type="date"
               value={formData.dateStart}
               onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dateStart: e.target.value }))
               }
               className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
         </div>

         <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
               Data Fim
            </label>
            <input
               type="date"
               value={formData.dateEnd}
               onChange={(e) =>
                  setFormData((prev) => ({ ...prev, dateEnd: e.target.value }))
               }
               className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
         </div>

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
               className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
               className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
         </div>

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
               className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
               className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
         </div>

         <div className="col-span-2 flex justify-end gap-4 pt-4">
            <button
               type="button"
               onClick={handleClear}
               className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
               Limpar Filtros
            </button>
            <button
               type="submit"
               className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600  focus:outline-none"
            >
               Aplicar Filtros
            </button>
         </div>
      </form>
   );
};