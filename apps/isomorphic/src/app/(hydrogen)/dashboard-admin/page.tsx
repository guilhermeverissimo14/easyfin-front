'use client';

import { metaObject } from '@/config/site.config';
import DashboardOverview from '../../shared/dashboard/dashboard-overview';
import DashboardCharts from '../../shared/dashboard/dashboard-charts';
import TopCustomers from '../../shared/dashboard/top-customers';
import TopSuppliers from '../../shared/dashboard/top-suppliers';
import RecentTransactions from '../../shared/dashboard/recent-transactions';
import PageHeader from '../../shared/page-header';

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
               <DashboardCharts />
            </div>

            {/* Top Customers and Suppliers */}
            <div className="mb-6 grid grid-cols-1 gap-6 @4xl:grid-cols-2">
               <TopCustomers />
               <TopSuppliers />
            </div>

            {/* Recent Transactions */}
            <div className="mb-6">
               <RecentTransactions />
            </div>
         </div>
      </>
   );
}
