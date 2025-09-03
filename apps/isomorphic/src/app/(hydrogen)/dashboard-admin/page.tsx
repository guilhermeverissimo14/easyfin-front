'use client';

import { useState, useCallback } from 'react';
import DashboardOverview from '../../shared/dashboard/dashboard-overview';
import DashboardCharts from '../../shared/dashboard/dashboard-charts';
import DashboardAnalytics from '../../shared/dashboard/dashboard-analytics';
import RecentTransactions from '../../shared/dashboard/recent-transactions';
import PageHeader from '../../shared/page-header';
import { subDays } from 'date-fns';

const pageHeader = {
   title: 'Dashboard Administrativo',
   breadcrumb: [
      {
         href: '/dashboard-admin',
         name: 'Dashboard',
      },
   ],
};

export default function DashAdmin() {
   const [dateFilter, setDateFilter] = useState<{
      startDate: Date | null;
      endDate: Date | null;
   }>({ startDate: subDays(new Date(), 30), endDate: new Date() });

   const handleDateChange = useCallback((startDate: Date | null, endDate: Date | null) => {
      setDateFilter({ startDate, endDate });
   }, []);

   return (
      <>
         <PageHeader title={pageHeader.title} breadcrumb={pageHeader.breadcrumb} />

         <div className="@container">
            {/* Overview Cards */}
            <div className="mb-6">
               <DashboardOverview />
            </div>

            {/* Charts Section */}
            <div className="mb-6">
               <DashboardCharts onDateChange={handleDateChange} />
            </div>

            {/* Recent Transactions */}
            <div className="mb-6">
               <RecentTransactions 
                  startDate={dateFilter.startDate} 
                  endDate={dateFilter.endDate} 
               />
            </div>

            {/* Analytics Section - Nova seção */}
            <div className="mb-6">
               <DashboardAnalytics />
            </div>
         </div>
      </>
   );
}
