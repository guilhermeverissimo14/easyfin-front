import { UserRole } from '@/config/enums';


export interface TableRecentExpense {
    expense: string;
    description: string;
    valueFormatted: string;
    value: number;
    date: string;
    approved: boolean;
    approvedAt: string | null;
    approvedBy: string | null;
}


export interface DashProductionPilot{
   label: string;
   day: string;
   month: string;
   hectaresWorked: number;
}

export interface DashPilotExpenses{
   spendings: SpendingsTypePilot[];
   totalSpendings: number;
   totalSpendingsFormatted: string;
}

export interface SpendingsTypePilot {
   expense:string;
   value:number;
}
export interface CardsDashboard {
   referLastPeriodHectaresWorked: number;
   referLastPeriodExpenses: number;
   referLastPeriodRevenue: number;
   totalClients: number;
   totalExpenses: string;
   totalHectaresWorked: number;
   totalRevenue: string;
}

export interface PilotPerformance {
   pilotId: string;
   pilotName: string;
   totalSpent: number;
   totalSpentFormatted: string;
   totalHectaresWorked: number;
}

export interface AllPayrollsType {
   id: string;
   userId: string;
   colaborator: string;
   role: string;
   year: number;
   month: number;
   launchRecords: {
      typeId: string;
      label: string;
      amount: number;
   }[];
   totalValue: number;
   isClosed: boolean;
   createdAt: string;
   updatedAt: string;
}

export interface RecordsType {
   typeId?: string;
   label?: string;
   amount?: string;
   type?: string;
}

export type LauchType = {
   id: string;
   name: string;
   description: string;
   type: string;
   createdAt: string;
   updatedAt: string;
}

export interface ProductionRecord {
   id: string;
   date: string;
   hectaresWorked: number;
   contract: {
      id: string;
      reference: string;
      hectaresEstimated: number;
      status: string;
      createdAt: string;
   };
   createdAt: string;
   updatedAt: string;
   pilot: {
      id: string;
      name: string;
   }
}

export enum ContractStatus {
   NAO_INICIADO = 'Não iniciado',
   EM_ANDAMENTO = 'Em andamento',
   FINALIZADO = 'Finalizado',
}
export interface ContractsType {
   id?: string;
   localManager?: {
      id: string;
      name: string;
   };
   producer?: {
      id: string;
      name: string;
   };
   pilots?: {
      id: string;
      name: string;
   }[];
   financialRecords?: {
      id: string;
      paymentMethod: string;
      paymentStatus: string;
      createdAt: string;
      updatedAt: string;
      dueDate: string;
      initialPaymentDate: string;
      installmentNumber: number;
   }[];
   hectaresEstimate?: number;
   valuePerHectare?: number;
   paymentMethod?: string;
   status?: string;
   reference?: string;
}

export interface OptionsSelect {
   label: string;
   value: string;
}

export interface AdressType {
   logradouro: string;
   localidade: string;
   uf: string;
   erro: boolean;
}

export type ProducersType = {
   id: string;
   cpf: string;
   name: string;
   surname: string;
   email: string;
   phone: string;
   localManagerId?: string;
   active: boolean;
   locations: {
      id: string;
      name: string;
      latitude: number | string;
      longitude: number | string;
      address: string;
      city: string;
      state: string;
      zipCode: string;
   }[];
   createdAt: Date;
   updatedAt: Date;
};

export type SpendingsType = {
   id?: string;
   user?: {
      id: string;
      name: string;
      role: UserRole;
   };
   notes?: {
      id: string;
      notes: string;
      date: Date;
   }[];
   expenseId?: string;
   expense?: { id: string; name: string };
   value?: number | bigint;
   attachment?: { url: string; name: string };
   comments?: string;
   approved?: boolean;
   date?: Date;
   description?: string;
};

export type Expenses = {
   id?: string;
   name?: string;
   active?: boolean;
   createdAt?: Date;
   updatedAt?: Date;
};

export interface CustomErrorLogin {
   message?: string;
   response: {
      data: {
         message?: string;
      };
   };
}

export type userType = {
   id: string;
   name: string;
   email: string;
   role: UserRole;
   phone: string;
   cpfCnpj: string;
   birthdate: string;
   active: boolean;
   firstAccess: boolean;
   pilots: userType[];
   assistants: {
      id: string;
      name: string;
      baseSalary: number;
      commission: number;
   }[];
} & Record<string, any>;

export interface UserData {
   id: string;
   name: string;
   email: string;
   role: UserRole;
}

export interface User {
   id: string;
   token: string;
   user: UserData;
}

export interface LocalUser {
   id: string;
   name: string;
   email: string;
   role: 'ADMIN' | 'MANAGER' | 'LOCAL_MANAGER' | 'PILOT | FINANCIAL';
   phone: string;
   cpfCnpj: string;
   avatar: string;
   lastLogin: Date;
}

export interface Address {
   customerName?: string;
   phoneNumber?: string;
   country?: string;
   state?: string;
   city?: string;
   zip?: string;
   street?: string;
}


export interface WSNotification {
   id: string;
   type: string;
   contractId: string;
   userId: string;
   senderId: string;
   message: string;
   timestamp: number;
   createdAt: Date;
}

export interface Notifications {
   id: string;
   userId: string;
   senderId: string;
   message: string;
   read: boolean;
   createdAt: Date;
}
