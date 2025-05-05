import FinancialStats from '@/app/shared/dashboard-manager/transaction-states';

export default function FinancialDashboard() {
   return (
      <div className="grid grid-cols-6 gap-6 @container 3xl:gap-8">
         <FinancialStats className="col-span-full" />
      </div>
   );
}
