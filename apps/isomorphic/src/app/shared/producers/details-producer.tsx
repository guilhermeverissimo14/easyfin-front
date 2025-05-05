

'use client';

import { useEffect, useState } from 'react';
import { api } from '@/service/api';
import { toast } from "react-toastify";
import { ProducersType } from '@/types';
import { ListProducerDetails } from '@/components/card/list-produceres';
import DeleteLocationButton from '../modal-views/delete-item';

export default function DetailsProducer({ id }: { id: string }) {
    const [producerDetails, setProducerDetails] = useState<ProducersType>({} as ProducersType);

    const getProducerDetails = async () => {
        try {
            const response = await api.get<ProducersType>(`/producers/${id}`);
            setProducerDetails(response.data);
        } catch (error) {
            console.error('Erro ao buscar produtor:', error);
        }
    };

    useEffect(() => {
        getProducerDetails();
    }, [id]);

    const handleDeleteLocation = async (producerId: string, locationId: string) => {
        try {
            await api.delete(`/producers/${producerId}/location/${locationId}`);
            getProducerDetails();
            toast.success('Endereço removido com sucesso!');
        } catch (error) {
            console.error('Erro ao remover endereço:', error);
            toast.error('Erro ao remover endereço');
        }
    };

    return (
        <main className="rounded-lg border border-gray-300 bg-white shadow-lg">

            <ListProducerDetails producerDetails={producerDetails} />

            {producerDetails.locations && producerDetails.locations.length > 0 && (
                <div className="m-5">
                    <h3 className="mb-3 text-lg font-semibold">
                        Endereços
                    </h3>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2">
                        {producerDetails.locations.map((location: any) => (
                            <div
                                key={location.id}
                                className="relative rounded-lg border border-gray-300 bg-white p-4 shadow-md transition-colors duration-300 hover:bg-gray-200"
                            >

                                {producerDetails.locations.length > 1 && (
                                    <DeleteLocationButton
                                        producerId={producerDetails.id}
                                        locationId={location.id}
                                        handleDeleteLocation={handleDeleteLocation}
                                    />
                                )}

                                <h4 className="text-md font-bold text-gray-800">
                                    {location.name}
                                </h4>
                                <p className="text-gray-600">
                                    Endereço: {location.address || 'Não informado'}
                                </p>
                                <p className="text-gray-600">
                                    Cidade: {location.city || 'Não informado'}
                                </p>
                                <p className="text-gray-600">
                                    Estado: {location.state || 'Não informado'}
                                </p>
                                <p className="text-gray-600">
                                    CEP: {location.zipCode || 'Não informado'}
                                </p>
                                <p className="text-gray-600">
                                    Latitude: {location.latitude || 'Não informado'}
                                </p>
                                <p className="text-gray-600">
                                    Longitude: {location.longitude || 'Não informado'}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </main>
    );
}