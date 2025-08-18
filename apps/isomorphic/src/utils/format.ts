import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const adjustToBrazilTimezone = (date: Date | null | undefined) => {
   if (!date) return null;

   const adjusted = new Date(date.getTime() - 3 * 60 * 60 * 1000);
   return adjusted.toISOString();
};

export const cpfCnpjMask = (value: string) => {
   const cleanedValue = value.replace(/\D/g, '');

   if (cleanedValue.length <= 11) {
      return cleanedValue
         .replace(/(\d{3})(\d)/, '$1.$2')
         .replace(/(\d{3})(\d)/, '$1.$2')
         .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
         .substring(0, 14);
   } else {
      return cleanedValue
         .replace(/(\d{2})(\d)/, '$1.$2')
         .replace(/(\d{3})(\d)/, '$1.$2')
         .replace(/(\d{3})(\d)/, '$1/$2')
         .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
         .substring(0, 18);
   }
};

export const cpfMask = (value: string) => {
   const cleanedValue = value.replace(/\D/g, '');

   return cleanedValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
      .substring(0, 14);
};

export const cepMask = (value: string) => {
   const cleanedValue = value.replace(/\D/g, '');

   return cleanedValue.replace(/(\d{5})(\d)/, '$1-$2').substring(0, 9);
};

export const phoneNumberMask = (value: string) => {
   const cleanedValue = value.replace(/\D/g, '');

   return cleanedValue
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .substring(0, 15);
};

export const moneyMask = (value: string) => {
   const cleanedValue = value.replace(/\D/g, '');
   const formattedValue = (Number(cleanedValue) / 100).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
   });
   return formattedValue;
};

export const formatCurrency = (value: number | string | null | undefined): string => {
   // Converter string para número se necessário
   let numValue: number;
   
   if (typeof value === 'string') {
      numValue = parseFloat(value);
   } else {
      numValue = value as number;
   }
   
   // Verificar se o valor é um número válido
   if (isNaN(numValue) || numValue === null || numValue === undefined || !isFinite(numValue)) {
      return new Intl.NumberFormat('pt-BR', {
         style: 'currency',
         currency: 'BRL'
      }).format(0);
   }
   
   return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
   }).format(numValue);
};


export function formatMoney(value: number): string {
   return value
      .toFixed(2)
      .replace('.', ',')
      .replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.');
}

export function formatMoneyBrl(value: number): string {
   return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
   }).format(value);
}

interface UserBirthdayInfo {
   birthdate: string;
   age: number;
}

export function getUserBirthday(birthdateString: string): UserBirthdayInfo {
   const birthdate = birthdateString ? format(parseISO(birthdateString), "d 'de' MMMM", { locale: ptBR }) : 'Não informado';

   const birthdateParsed = birthdateString ? parseISO(birthdateString) : null;
   const today = new Date();

   const age = birthdateParsed
      ? today.getFullYear() -
      birthdateParsed.getFullYear() -
      (today.getMonth() < birthdateParsed.getMonth() ||
         (today.getMonth() === birthdateParsed.getMonth() && today.getDate() < birthdateParsed.getDate())
         ? 1
         : 0)
      : 0;

   return { birthdate, age };
}

export function formatDate(dateString: string): string {
   const date = parseISO(dateString);
   return format(date, 'dd/MM/yyyy', { locale: ptBR });
}
