import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { Button } from "rizzui/button";

interface DeleteLocationButtonProps {
    producerId: string;
    locationId: string;
    handleDeleteLocation: (producerId: string, locationId: string) => void;
}

export default function DeleteLocationButton({ producerId, locationId, handleDeleteLocation }: DeleteLocationButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    const confirmDelete = () => {
        handleDeleteLocation(producerId, locationId);
        setIsOpen(false);
    };

    return (
        <>
            <button
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                onClick={() => setIsOpen(true)}
            >
                <FaTrash />
            </button>
            {isOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <p className="text-lg font-semibold">Tem certeza que deseja excluir este endereço?</p>
                        <div className="flex justify-end mt-4">
                            <Button
                                className="px-4 py-2 mr-2 bg-gray-400 rounded hover:bg-gray-300"
                                onClick={() => setIsOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-700"
                                onClick={confirmDelete}
                            >
                                Confirmar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
