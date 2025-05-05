"use client";
import { useEffect, useState } from 'react';
import { api } from '@/service/api';
import AvatarCard from '@core/ui/avatar-card';
import { SpendingsType } from '@/types';

export const CommentsDetails = ({ id }: { id: string }) => {
    const [commentsDetails, setCommentsDetails] = useState<SpendingsType>({} as SpendingsType);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getCommentsDetails = async () => {
            setLoading(true);
            try {
                const response = await api.get<SpendingsType[]>(`/spendings/financial`);
                const filteredId = response.data.find((item) => item.id === id);
                console.log('filteredId:', filteredId);
                setCommentsDetails(filteredId as SpendingsType);
            } catch (error) {
                console.error('Erro ao buscar detalhes das notas:', error);
            } finally {
                setLoading(false);
            }
        };
        getCommentsDetails();
    }, [id]);

    return (
        <main>
            <div className="mb-4 flex flex-row items-center justify-between">
                {commentsDetails?.user?.name ? (
                    <AvatarCard
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(commentsDetails.user.name)}&background=97CFB7&color=ffffff`}
                        name={commentsDetails.user.name}
                        description={commentsDetails.expense?.name}
                    />
                ) : (
                    <p>Carregando...</p>
                )}
                <div className="w-32 p-2">
                    {commentsDetails?.approved ? (
                        <span className="bg-green-100 text-green-dark p-2 rounded-full whitespace-nowrap">Aprovado</span>
                    ) : (
                        <span className="bg-red-100 text-red-dark p-2 rounded-full whitespace-nowrap">Não Aprovado</span>
                    )}
                </div>
            </div>

            {loading ? (
                <span></span>
            ) : (
                <div className="mt-4 rounded-lg border border-gray-300 bg-white shadow-lg">
                    <h2 className="pl-5 pt-2 text-lg font-bold text-gray-900">Motivo</h2>
                    <ul className="grid gap-4 pt-2 pr-5 pb-5 pl-5">
                        {commentsDetails?.notes?.map((note) => (
                            <li key={note.id} className="flex flex-col gap-2">
                                <span className="text-base text-gray-700">{note.notes}</span>
                                <span className="text-sm text-gray-500">{new Date(note.date).toLocaleDateString()}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )
            }

        </main>
    );
};