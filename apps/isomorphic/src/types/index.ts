import { UserRole } from '@/config/enums';

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
   historic: string;
   value: number;
   type: string; // 'C' para crédito, 'D' para débito
   description: string;
   costCenter: string | null;
   balance: number;
   createdAt?: Date;
   updatedAt?: Date;
}

export interface IAccountsPayable {
   id: string;
   documentNumber: string;
   supplierId: string;
   supplierName: string;
   status: string;
   launchDate: string;
   dueDate: string;
   installmentNumber: number;
   totalInstallments: number;
   value: number;
   userId?: string;
   interest?: number;
   fine?: number;
   discount?: number;
   plannedPaymentMethod?: string;
}

export interface IAccountPayable {
   id: string;
   documentNumber: string;
   supplierId: string;
   supplierName: string;
   status: string;
   launchDate: string;
   dueDate: string;
   installmentNumber: number;
   totalInstallments: number;
   value: number;
}
