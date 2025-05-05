'use client';
import { toast } from "react-toastify";
import { useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from 'rizzui/button';

import { AdressType, CustomErrorLogin, OptionsSelect, ProducersType, userType } from '@/types';
import { api } from '@/service/api';
import { useModal } from '../modal-views/use-modal';
import { PiPlusBold } from 'react-icons/pi';
import { Title } from 'rizzui/typography';
import citiesData from '@/helpers/cities.json';
import { PersonalDataForm } from '@/components/create-producer/personal-form';
import AddressForm from '@/components/create-producer/adress-form';
import { id } from "date-fns/locale";

const user = JSON.parse(localStorage.getItem('eas:user') as string) as userType;

const userSchema = z.object({
    cpf: z.string().nonempty('CPF é obrigatório'),
    name: z.string().nonempty('Nome é obrigatório'),
    surname: z.string().optional(),
    email: z.string().email('Email inválido'),
    phone: z.string().nonempty('Telefone é obrigatório'),
    localManagerId: user.role === 'LOCAL_MANAGER'
        ? z.string().optional()
        : z.string().min(1, "Gerente local é obrigatório"),
    locations: z
        .array(
            z.object({
                id: z.string().optional(),
                name: z.string().nonempty('Nome do local é obrigatório'),
                latitude: z.any(),
                longitude: z.any(),
                address: z.string().nonempty('Endereço é obrigatório'),
                city: z.string().nonempty('Cidade é obrigatória'),
                state: z.string().nonempty('Estado é obrigatório'),
                zipCode: z.string().nonempty('CEP é obrigatório'),
            })
        )
        .nonempty('Pelo menos um local é obrigatório'),
});

export function EditProducer({ id, getList }: { id: string; getList: () => void }) {
    const [loading, setLoading] = useState(false);
   const [loadingAddress, setLoadingAddress] = useState(false);
    const [activeTab, setActiveTab] = useState('personalData');
    const [openModalAddress, setOpenModalAddress] = useState(false);
    const [states, setStates] = useState<OptionsSelect[]>([]);
    const [cities, setCities] = useState<OptionsSelect[]>([]);
    const [currentLocationIndex, setCurrentLocationIndex] = useState<number | null>(null);

    const { closeModal } = useModal();

    const {
        register,
        handleSubmit,
        setValue,
        control,
        watch,
        trigger,
        formState: { errors },
    } = useForm<ProducersType>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            cpf: '',
            name: '',
            surname: '',
            email: '',
            phone: '',
            localManagerId: '',
            locations: [{ name: '', latitude: 0, longitude: 0, address: '', city: '', state: '', zipCode: '' }],
        },
    });

    const { fields, remove, append } = useFieldArray({
        control,
        name: 'locations',
        keyName: 'id',
    });

    const [tempAddress, setTempAddress] = useState({
        name: '',
        latitude: 0,
        longitude: 0,
        address: '',
        city: '',
        state: '',
        zipCode: '',
    });

    const handleAddAddress = async (index: number) => {
        const isValid = await trigger([
            `locations.${index}.name`,
            `locations.${index}.zipCode`,
            `locations.${index}.address`,
            `locations.${index}.city`,
            `locations.${index}.state`,
            `locations.${index}.latitude`,
            `locations.${index}.longitude`,
        ]);

        if (!isValid) {
            toast.error('Preencha todos os campos obrigatórios do endereço antes de salvar.');
            return;
        }

        const currentLocations = watch('locations') || [];
        setValue('locations', [...currentLocations]);
        setOpenModalAddress(false);
    };

    const resetAddressFields = (index: number) => {
        setValue(`locations.${index}.name`, '');
        setValue(`locations.${index}.address`, '');
        setValue(`locations.${index}.city`, '');
        setValue(`locations.${index}.state`, '');
        setValue(`locations.${index}.zipCode`, '');
        setValue(`locations.${index}.latitude`, 0);
        setValue(`locations.${index}.longitude`, 0);
    };

    const resetFields = () => {
        const currentLocations = watch('locations');
        if (currentLocations.length > 1) {
            remove(currentLocations.length - 1);
        }
        setOpenModalAddress(false);
    };

    const loadStatesAndCities = () => {
        const stateOptions = citiesData.estados.map((state) => ({
            label: state.nome,
            value: state.sigla,
        }));
        setStates(stateOptions);
    };

    const handleStateChange = (stateSigla: string) => {
        const selectedState = citiesData.estados.find((state) => state.sigla === stateSigla);
        if (selectedState) {
            const cityOptions = selectedState.cidades.map((city) => ({
                label: city,
                value: city,
            }));
            setCities(cityOptions);
        } else {
            setCities([]);
        }
    };

    const hasAtLeastOneAddress = watch('locations')?.some((location) => location.name && location.address);

    async function fetchProducer() {
        setLoadingAddress(true);
        try {
            const response = await api.get<ProducersType>(`/producers/${id}`);
            const producer = response.data;
            setValue("cpf", producer.cpf);
            setValue("name", producer.name);
            setValue("surname", producer.surname);
            setValue("email", producer.email);
            setValue("phone", producer.phone);
            setValue("localManagerId", producer.localManagerId || "");
            setValue("locations", producer.locations.map((loc) => ({
                ...loc,
                id: loc.id,
                latitude: loc.latitude.toString(),
                longitude: loc.longitude.toString(),
            })));
        } catch (error) {
            console.error("Erro ao buscar produtor:", error);
            toast.error("Erro ao carregar dados do produtor");
        }finally{
            setLoadingAddress(false);
        }
    }

    async function onSubmit(data: ProducersType) {
        setLoading(true);
        const requestData = { ...data };

        if (!requestData.localManagerId) {
            delete requestData.localManagerId;
        }

        requestData.locations = requestData.locations.map((location) => ({
            ...location,
            id: location.id,
            latitude: Number(location.latitude) ? Number(location.latitude) : 0,
            longitude: Number(location.longitude) ? Number(location.longitude) : 0,
        }));

        if(user.role === 'LOCAL_MANAGER') {
            requestData.localManagerId = user.id;
         }
   

        requestData.cpf = requestData.cpf.replace(/\D/g, '');
        requestData.phone = requestData.phone.replace(/\D/g, '');

        if (!requestData.localManagerId) {
            delete requestData.localManagerId;
        }

        try {
            await api.put(`/producers/${id}`, requestData);
            getList?.();
            toast.success('Produtor atualizado com sucesso!');
            closeModal();
        } catch (error) {
            console.error('Erro ao atualizar produtor:', error);
            const err = error as CustomErrorLogin;
            toast.error(err.response.data.message);
            setLoading(false);
        } finally {
            setLoading(false);
        }
    }

    const handleCepChange = async (index: number, cep: string) => {
        if (cep.length === 8) {
            try {
                const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
                const data = (await response.json()) as AdressType;
                if (data.erro) {
                    toast.error('CEP não encontrado');
                    return;
                }
                setValue(`locations.${index}.address`, data.logradouro || '');
                setValue(`locations.${index}.city`, data.localidade || '');
                setValue(`locations.${index}.state`, data.uf || '');

                handleStateChange(data.uf);
            } catch (error) {
                console.error('Erro ao buscar CEP:', error);
                toast.error('Erro ao buscar CEP');
            }
        }
    };

    const handlePositionChange = (index: number, lat: number, lng: number) => {
        setValue(`locations.${index}.latitude`, Number(lat?.toFixed(5)) || 0);
        setValue(`locations.${index}.longitude`, Number(lng?.toFixed(5)) || 0);
    };

    const openEditAddressModal = (index: number) => {
        setCurrentLocationIndex(index);
        setOpenModalAddress(true);
    };

    const locations = useWatch({ control, name: "locations" });

    useEffect(() => {
        if (locations?.length > 0) {
            const lastIndex = locations.length - 1;
            const lastLatitude = locations[lastIndex]?.latitude;
            const lastLongitude = locations[lastIndex]?.longitude;

            if (!lastLatitude || !lastLongitude) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;

                        setValue(`locations.${lastIndex}.latitude`, latitude);
                        setValue(`locations.${lastIndex}.longitude`, longitude);
                    },
                    (error) => {
                        console.error("Erro ao obter localização:", error);
                        toast.error("Erro ao obter localização");
                    }
                );
            }
        }
    }, [locations]);

    const handleNextTab = async () => {

        const isValid = await trigger(['cpf', 'name', 'phone', 'localManagerId', 'email']);

        if (!isValid) {
            toast.error('Preencha todos os campos obrigatórios em "Dados Pessoais" antes de continuar.');
            return false;
        } else if (isValid) {
            setActiveTab('addresses');
        }
    };

    useEffect(() => {
        loadStatesAndCities();
        fetchProducer();
    }, [id]);

    if (openModalAddress) {
        const currentLocations = watch('locations');
        const index = currentLocations.length - 1 || currentLocationIndex || 0;
        return (
            <>
                <Title as="h6" className="mb-4 font-semibold">
                    Adicionar Endereço
                </Title>

                <AddressForm
                    index={index}
                    states={states}
                    cities={cities}
                    control={control}
                    watch={watch}
                    register={register}
                    handlePositionChange={(lat, lng) => handlePositionChange(index, lat, lng)}
                    handleStateChange={handleStateChange}
                    handleCepChange={handleCepChange}
                />

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <Button variant="outline" onClick={resetFields} className="mt-4 w-full" color="primary">
                        Cancelar
                    </Button>
                    <Button
                        onClick={() => {
                            handleAddAddress(index);
                        }}
                        className="mt-4 w-full"
                    >
                        Salvar
                    </Button>
                </div>
            </>
        );
    }

    if(loadingAddress){
        return (
            <div className="flex w-full flex-col items-center justify-center">
                <span className="text-gray-500">Carregando...</span>
            </div>
        );
    }

    return (
        <>
            <form className="mx-auto rounded-lg shadow-md" onSubmit={handleSubmit(onSubmit)}>
                <div className="mb-4 flex">
                    <button
                        type="button"
                        className={`py-1 text-gray-700 hover:text-black focus:outline-none ${activeTab === 'personalData' ? 'border-b-2 border-green-500 font-semibold' : ''
                            }`}
                        onClick={() => setActiveTab('personalData')}
                        style={{ display: 'block', textAlign: 'left' }}
                    >
                        Dados Pessoais
                    </button>
                    <button
                        type="button"
                        className={`ml-8 py-1 text-gray-700 hover:text-black focus:outline-none ${activeTab === 'addresses' ? 'border-b-2 border-green-500 font-semibold' : ''
                            }`}
                        onClick={() => handleNextTab()}
                        style={{ display: 'block', textAlign: 'left' }}
                    >
                        Endereços
                    </button>
                </div>

                {activeTab === 'personalData' && (
                    <>
                        <PersonalDataForm
                            register={register}
                            errors={errors}
                            control={control}
                            setValue={setValue}
                        />

                        <div className='w-full flex justify-evenly'>
                            <Button
                                variant="outline"
                                onClick={() => closeModal()}
                                className="mt-6 w-1/3"
                                color="primary"
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={() => handleNextTab()}
                                className="mt-6 w-1/3"
                            >
                                Próximo
                            </Button>
                        </div>
                    </>
                )}

                {activeTab === 'addresses' && (
                    <div className="flex flex-row flex-wrap space-x-4">
                        <div
                            className="flex mt-2 h-48 w-64 cursor-pointer flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-4 text-gray-500"
                            onClick={() => {
                                const currentLocations = watch('locations');
                                const lastIndex = currentLocations.length - 1;
                                if (currentLocations[lastIndex] && currentLocations[lastIndex]?.name && currentLocations[lastIndex]?.address) {
                                    resetAddressFields(lastIndex + 1);
                                }

                                setTempAddress({ name: '', latitude: 0, longitude: 0, address: '', city: '', state: '', zipCode: '' });
                                setOpenModalAddress(true);
                            }}
                        >
                            <PiPlusBold className="me-1.5 h-[24px] w-[24px]" />
                            <span className="text-lg">Adicionar endereço</span>
                        </div>

                        {fields.length > 0 &&
                            fields.map((field, index) => {
                                const location = watch(`locations.${index}`);
                                if (location.name === '' && location.address === '') {
                                    return null;
                                }
                                return (
                                    <div
                                        key={index}
                                        className="flex mt-2 h-48 w-64 flex-col justify-between rounded-lg border border-gray-200 bg-white p-4 text-gray-800 shadow-lg transition-shadow duration-300 hover:shadow-xl"
                                    >
                                        <div>
                                            <h5 className="font-semibold">{location.name}</h5>
                                            <p>{location.address}</p>
                                            <p>
                                                {location.city}, {location.state} {location.zipCode}
                                            </p>
                                        </div>
                                        {/* <div className="mt-4 flex flex-row justify-start space-x-2">
                                            <button
                                                className="text-gray-800 transition duration-200 hover:text-gray-500 hover:underline"
                                                onClick={() => openEditAddressModal(index)}
                                            >
                                                Alterar
                                            </button>
                                            <span>|</span>
                                            <button
                                                className="text-red-800 transition duration-200 hover:text-red-600 hover:underline"
                                                onClick={() => remove(index)}
                                            >
                                                Excluir
                                            </button>
                                        </div> */}
                                    </div>
                                );
                            })}

                        <div className='w-full flex justify-evenly mt-6'>
                            <Button
                                variant="outline"
                                onClick={() => closeModal()}
                                className="w-1/3"
                            >
                                Cancelar
                            </Button>
                            <Button
                                disabled={loading || !hasAtLeastOneAddress}
                                onClick={handleSubmit(onSubmit)}
                                className="w-1/3"
                            >
                                {loading ? 'Carregando...' : 'Salvar'}
                            </Button>
                        </div>
                    </div>
                )}
            </form>
        </>
    );
}