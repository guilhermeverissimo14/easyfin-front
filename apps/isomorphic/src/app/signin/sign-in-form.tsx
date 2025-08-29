"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { SubmitHandler } from "react-hook-form";
import {
	PiArrowRightBold,
	PiEnvelopeSimple,
	PiLockKey,
} from "react-icons/pi";
import { Password, Button, Input } from "rizzui";
import { Form } from "@core/ui/form";
import { loginSchema, LoginSchema } from "@/validators/login.schema";
import { loginUser } from "@/service/auth/authService";
import { CustomErrorLogin, User } from "@/types";
import { redirect } from "next/navigation";
import { toast } from "react-toastify";

const year = new Date().getFullYear();

const initialValues: LoginSchema = {
	email: "",
	password: "",
	rememberMe: true,
};

export default function SignInForm() {
	const [reset, setReset] = useState({});
	const [loading, setLoading] = useState(false);
	const [onSubmited, setOnSubmited] = useState(false);

	useEffect(() => {
		const isAuthenticated = localStorage.getItem("eas:isAuthenticated");
		const userRole = (
			JSON.parse(localStorage.getItem("eas:user") || "{}") as { role: string }
		).role;

		if (isAuthenticated) {
			if (userRole === "USER" || userRole === "ADMIN") {
				redirect("/dashboard-admin");
			} 
		}
	}, [onSubmited]);

	const onSubmit: SubmitHandler<LoginSchema> = async (data, event) => {
		event?.preventDefault();
		try {
			setLoading(true);
			const response: User | null = await loginUser(data.email, data.password);

			if (!response) {
				return;
			}

			await signIn("credentials", {
				id: response.user.id,
				name: response.user.name,
				email: response.user.email,
				token: response.token,
			});

			setReset({});
			setOnSubmited(true);
		} catch (error) {
			const err = error as CustomErrorLogin;

			if (err.message === "Network Error") {
				toast.error("Erro de conexão, tente novamente mais tarde");
			} else {
				toast.error(err.response.data.message);
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<Form<LoginSchema>
			validationSchema={loginSchema}
			resetValues={reset}
			onSubmit={onSubmit}
			useFormProps={{
				defaultValues: initialValues,
			}}
		>
			{({ register, formState: { errors }, watch }) => (
				<div className="space-y-4">
					<div className="relative">
						<div className="absolute left-3 top-[60%] z-10 -translate-y-1/2 transform text-gray-400">
							<PiEnvelopeSimple className="h-5 w-5" />
						</div>
						<Input
							type="email"
							size="lg"
							label="E-mail"
							placeholder="Digite seu email"
							className="[&>label>span]:mb-2 [&>label>span]:font-semibold [&>label>span]:text-gray-700"
							inputClassName="text-sm pl-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 rounded-xl"
							{...register("email")}
							error={errors.email?.message}
						/>
					</div>

					<div className="relative">
						<div className="absolute left-3 top-[60%] z-10 -translate-y-1/2 transform text-gray-400">
							<PiLockKey className="h-5 w-5" />
						</div>
						<Password
							label="Senha"
							placeholder="Digite sua senha"
							size="lg"
							className="[&>label>span]:mb-2 [&>label>span]:font-semibold [&>label>span]:text-gray-700"
							inputClassName="text-sm pl-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 rounded-xl"
							{...register("password")}
							error={errors.password?.message}
						/>
					</div>

					<div className="flex items-center justify-end py-2">
						<Link
							href={"/forgot-password"}
							className="text-sm font-semibold text-blue-600 transition-colors duration-200 hover:text-blue-700 hover:underline"
						>
							Esqueceu a senha?
						</Link>
					</div>

					<Button
						className="w-full transform rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:from-blue-700 hover:to-blue-800 hover:shadow-xl disabled:transform-none disabled:cursor-not-allowed disabled:opacity-50"
						type="submit"
						size="lg"
						disabled={loading}
					>
						{!loading ? (
							<div className="flex items-center justify-center space-x-2">
								<span>Entrar</span>
								<PiArrowRightBold className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" />
							</div>
						) : (
							<div className="flex items-center justify-center space-x-2">
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
								<span>Entrando...</span>
							</div>
						)}
					</Button>

					<div className="relative my-6">
						<div className="flex items-center">
							<div className="flex-grow border-t border-gray-200"></div>
							<span className="bg-gray px-4 text-sm font-medium text-gray-500">
								Acesso rápido e seguro
							</span>
							<div className="flex-grow border-t border-gray-200"></div>
						</div>
					</div>
					<div className="flex items-center justify-center py-2 absolute bottom-0 md:left-[28%] left-[26%]">
						<span className="bg-gray text-center text-[10px] font-medium text-gray-500">
							©{year} - Todos os Direitos Reservados
						</span>
					</div>
				</div>
			)}
		</Form>
	);
}
