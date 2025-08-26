import Image from "next/image";

import { metaObject } from "@/config/site.config";
import SignInForm from "./sign-in-form";

export const metadata = {
	...metaObject("Entrar"),
};

export default function SignIn() {
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
						<h1 className="text-2xl font-bold text-gray-800 mb-2">
							Bem-vindo de volta!
						</h1>
						<p className="text-gray-600 text-sm">
							Faça login para acessar sua conta
						</p>
					</div>

					<SignInForm />
				</div>
			</div>
		</main>
	);
}
