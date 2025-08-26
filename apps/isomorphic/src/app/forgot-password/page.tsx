"use client";

import Image from "next/image";
import Link from "next/link";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Input } from "rizzui";
import { toast } from "react-toastify";

import { PiEnvelopeSimple, PiArrowLeftBold } from "react-icons/pi";
import { api } from "@/service/api";
import { CustomErrorLogin } from "@/types";

const forgotPasswordSchema = z.object({
	email: z.string().email("Formato de e-mail inválido"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordFormData>({
		resolver: zodResolver(forgotPasswordSchema),
	});

	const onSubmit = async (data: ForgotPasswordFormData) => {
		setLoading(true);
		try {
			await api.post("auth/forgot-password", data);
			toast.success("E-mail de recuperação enviado com sucesso!");
			localStorage.setItem("eas:resetEmail", data.email);
			router.push("/reset-password");
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
		<main className="relative flex min-h-screen items-center justify-center overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-blue-700 to-cyan-500">
				<div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
				<div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
				<div className="absolute top-1/2 left-1/2 w-64 h-64 bg-cyan-400/10 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2"></div>
			</div>

			<div className="relative z-10 w-full max-w-md mx-4">
				<div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-8 transition-all duration-300 hover:shadow-3xl">
					<div className="mb-8 flex w-full justify-center">
						<div className="transform transition-transform duration-300 hover:scale-105">
							<Image
								alt="Logo"
								src="/images/logo_principal.png"
								width={200}
								height={130}
								className="drop-shadow-sm"
							/>
						</div>
					</div>

					<div className="text-center mb-6">
						<h1 className="text-2xl font-bold text-gray-800 mb-3">
							Esqueceu sua senha?
						</h1>
						<p className="text-gray-600 text-sm leading-relaxed">
							Não se preocupe! Informe seu e-mail e enviaremos um código para
							recuperação.
						</p>
					</div>

					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="space-y-6">
							<div className="relative">
								<div className="absolute left-3 top-[60%] transform -translate-y-1/2 text-gray-400 z-10">
									<PiEnvelopeSimple className="h-5 w-5" />
								</div>
								<Input
									type="email"
									size="lg"
									label="E-mail"
									placeholder="Digite seu email"
									className="[&>label>span]:font-semibold [&>label>span]:text-gray-700 [&>label>span]:mb-2"
									inputClassName="text-sm pl-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-200 rounded-xl"
									{...register("email")}
								/>
								{errors.email && (
									<p className="text-sm text-red-500 mt-1 ml-1">
										{errors.email.message}
									</p>
								)}
							</div>

							{/* Botão de envio melhorado */}
							<Button
								disabled={loading}
								className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
								type="submit"
								size="lg"
							>
								{loading ? (
									<div className="flex items-center justify-center space-x-2">
										<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
										<span>Enviando...</span>
									</div>
								) : (
									<div className="flex items-center justify-center space-x-2">
										<span>Enviar E-mail</span>
										<PiEnvelopeSimple className="h-5 w-5" />
									</div>
								)}
							</Button>

							<div className="flex items-center justify-center pt-2">
								<Link
									href="/signin"
									className="inline-flex items-center space-x-2 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors duration-200 hover:underline"
								>
									<PiArrowLeftBold className="h-4 w-4" />
									<span>Voltar para login</span>
								</Link>
							</div>
						</div>
					</form>
				</div>
			</div>
		</main>
	);
}
