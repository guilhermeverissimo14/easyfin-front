import { routes } from "@/config/routes";

// Note: do not add href in the label object, it is rendering as label
export const pageLinks = [
	{
		name: "Visão Geral",
	},
	{
		name: "Dashboard",
	},
	{
		name: "Dashboard",
		href: routes.dashboardAdmin,
	},
	{
		name: "Cadastros",
	},
	{
		name: "Alíquotas",
		href: routes.taxRates,
	},
	{
		name: "Centro de Custo",
		href: routes.constCenters,
	},
	{
		name: "Condições de Pagamento",
		href: routes.paymentTerms,
	},
	{
		name: "Contas Bancárias",
		href: routes.bankAccounts,
	},
	{
		name: "Clientes",
		href: routes.customers,
	},
	{
		name: "Fornecedores",
		href: routes.suppliers,
	},
	{
		name: "Usuários",
		href: routes.users,
	},
	{
		name: "Faturamento",
	},
	{
		name: "Notas Fiscais",
		href: routes.invoicing,
	},
	{
		name: "Financeiro",
	},
	{
		name: "Contas a Pagar",
		href: routes.accountsPayable,
	},
	{
		name: "Contas a Receber",
		href: routes.accountsReceivable,
	},
	{
		name: "Livro Caixa",
		href: routes.cashBook,
	},
	{
		name: "Relatórios",
	},
	{
		name: "Análise por Centro de Custo",
		href: routes.reports.costCenterAnalysis
	},
];
