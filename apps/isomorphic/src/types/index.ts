import { UserRole } from '@/config/enums';

export interface AccountsReceivableResponse {
   id: string;
   customer: {
      id: string;
      name: string;
   };
   documentNumber: string;
   documentDate: string;
   launchDate: string;
   dueDate: string;
   receiptDate: string | null;
   value: number;
   paidValue: number;
   discount: number;
   fine: number;
   interest: number;
   installmentNumber: number;
   totalInstallments: number;
   user: {
      id: string;
      name: string;
   };
   costCenter: {
      id: string | null;
      name: string | null;
   };
   plannedPaymentMethod: {
      id: string;
      name: string;
   };
   paymentMethod: {
      id: string | null;
      name: string | null;
   };
   observation: string;
   hasInvoiceLink: boolean;
   status: string;
   createdAt: string;
   updatedAt: string;
}

export interface IAccountsReceivable {
   id: string;
   documentNumber: string;
   customerId: string;
   customerName: string;
   status: string;
   documentDate: string;
   launchDate: string;
   dueDate: string;
   installmentNumber: number;
   totalInstallments: number;
   value: number;
   plannedPaymentMethod?: string;
   costCenterId?: string;
   costCenterName: string;
   observation?: string;
   paymentDate: string;
   hasInvoiceLink: boolean;
}

export interface AccountsPayableResponse {
   id: string;
   supplier: {
      id: string;
      name: string;
   };
   documentNumber: string;
   documentDate: string;
   launchDate: string;
   dueDate: string;
   paymentDate: string | null;
   value: number;
   paidValue: number;
   discount: number;
   fine: number;
   interest: number;
   installmentNumber: number;
   totalInstallments: number;
   user: {
      id: string;
      name: string;
   };
   costCenter: {
      id: string | null;
      name: string | null;
   };
   plannedPaymentMethod: {
      id: string;
      name: string;
   };
   paymentMethod: {
      id: string | null;
      name: string | null;
   };
   userId: string;
   observation: string;
   status: string;
   createdAt: string;
   updatedAt: string;
}

export interface FilterParams {
   customerId?: string;
   supplierId?: string;
   costCenterId?: string;
   status?: string;
   paymentMethodId?: string;
   documentDateStart?: string;
   documentDateEnd?: string;
   dueDateStart?: string;
   dueDateEnd?: string;
}

export interface PaymentMethod {
   id: string;
   name: string;
   requiresBank: boolean;
   createdAt: string;
   updatedAt: string;
}

export interface PaymentTermModel {
   id: string;
   paymentMethodId: string;
   condition: string;
   description: string;
   installments: number;
   createdAt: string;
   updatedAt: string;
}

export interface constCentersModel {
   id: string;
   name: string;
   createdAt: Date;
   updatedAt: Date;
}

export interface BankAccount {
   id: string;
   bank: string;
   agency: string;
   account: string;
   type: 'C' | 'S'; // 'C' for checking, 'S' for savings
   createdAt: Date;
   updatedAt: Date;
   active: boolean;
}

export interface TaxRateModel {
   id: string;
   year: number;
   month: number;
   issqnTaxRate: number;
   effectiveTaxRate: number;
   updatedAt: Date;
   createdAt: Date;
}

export interface AddressType {
   cep: string;
   logradouro: string;
   complemento: string | null;
   unidade: string | null;
   bairro: string;
   localidade: string;
   uf: string;
   estado: string;
   regiao: string;
   ibge: string;
   gia: string | null;
   ddd: string;
   siafi: string;
   erro: boolean;
}

export interface CustomerType {
   id: string;
   cnpj: string;
   name: string;
   email: string | null;
   phone: string | null;
   address: string | null;
   zipCode: string | null;
   city: string | null;
   state: string | null;
   country: string | null;
   contact: string | null;
   retIss: boolean;
   active: boolean;
}
export interface SupplierType {
   id: string;
   cnpj: string;
   name: string;
   email: string | null;
   phone: string | null;
   address: string | null;
   zipCode: string | null;
   city: string | null;
   state: string | null;
   country: string | null;
   contact: string | null;
   retIss: boolean;
   active: boolean;
}

export interface OptionsSelect {
   label: string;
   value: string;
}

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

export interface ICashBook {
   id: string;
   date: string;
   history: string;
   value: string;
   type: string; // 'C' para crédito, 'D' para débito
   description: string;
   costCenter: string | null;
   balance: string;
   createdAt?: Date;
   updatedAt?: Date;
}

export enum PaymentStatus {
   'PENDING',
   'PAID',
   'CANCELLED',
   'OVERDUE',
}

export interface IAccountsPayable {
   id: string;
   documentNumber: string;
   supplierId: string;
   supplierName: string;
   status: string;
   documentDate: string;
   launchDate: string;
   dueDate: string;
   installmentNumber: number;
   totalInstallments: number;
   value: number;
   userId?: string;
   interest?: number;
   fine?: number;
   discount?: number;
   costCenterId?: string;
   costCenterName?: string;
   paymentMethodId?: string;
   plannedPaymentMethod?: string;
   observation?: string;
   createdAt?: Date;
   updatedAt?: Date;
}

export interface IAccountsReceivable {
   id: string;
   documentNumber: string;
   customerId: string;
   customerName: string;
   status: string;
   documentDate: string;
   launchDate: string;
   dueDate: string;
   receiptDate?: string;
   value: number;
   receivedValue?: number;
   discount?: number;
   fine?: number;
   interest?: number;
   installmentNumber: number;
   totalInstallments: number;
   costCenterId?: string;
   bankAccountId?: string;
   plannedPaymentMethod?: string;
   paymentMethodId?: string;
   userId?: string;
   observation?: string;
   createdAt?: Date;
   updatedAt?: Date;
   cancelledAt?: Date | null;
}

export interface IInvoice {
   id: string;
   invoiceNumber: string;
   customer: {
      id: string;
      name: string;
   };
   paymentCondition: {
      id: string;
      condition: string;
      description: string;
      installments: number;
   };
   issueDate: string;
   month: number;
   year: number;
   dueDate: string;
   serviceValue: number;
   retainsIss: boolean;
   issqnTaxRate: number;
   effectiveTaxRate: number;
   issqnValue: number;
   netValue: number;
   effectiveTax: number;
   bankAccount?: {
      id: string;
      name: string;
      agency: string;
      account: string;
   };
   costCenter: {
      id: string;
      name: string;
   };
   notes: string;
}

export interface LocalUser {
   id: string;
   name: string;
   email: string;
   role: 'ADMIN' | 'USER';
   phone: string;
   cpfCnpj: string;
   avatar: string;
   lastLogin: Date;
}
