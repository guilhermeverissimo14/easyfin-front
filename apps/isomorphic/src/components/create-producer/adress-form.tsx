'use client';
import React, { useEffect, useState } from 'react';
import { Controller } from 'react-hook-form';
import { toast } from "react-toastify";

import { OptionsSelect } from '@/types';
import { InputField } from '../input/input-field';
import { SelectField } from '../input/select-field';
import Map from '../map';


interface AddressFormProps {
  index: number;
  states: OptionsSelect[];
  cities: OptionsSelect[];
  control: any;
  register: any;
  watch: any;
  errors?: any;
  handlePositionChange: (lat: number, lng: number) => void;
  handleStateChange: (stateSigla: string) => void;
  handleCepChange: (index: number, cep: string) => void;
}

export const AddressForm = ({
  index,
  states,
  cities,
  control,
  register,
  watch,
  errors,
  handlePositionChange,
  handleStateChange,
  handleCepChange,
}: AddressFormProps) => {

  const [currentLatitude, setCurrentLatitude] = useState<number | null>(null);
  const [currentLongitude, setCurrentLongitude] = useState<number | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(true);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentLatitude(position.coords.latitude);
        setCurrentLongitude(position.coords.longitude);
        setLoadingLocation(false); // Finaliza o carregamento
      },
      (error) => {
        console.error("Erro ao obter localização:", error);
        toast.error("Erro ao obter localização");
        setLoadingLocation(false);
      }
    );
  }, []);

  return (
    <>
      <div key={index.toString()} className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <InputField
          label={`Nome do endereço`}
          placeholder="Digite o nome do endereço"
          type="text"
          register={register(`locations.${index}.name`)}
          error={errors?.locations?.[index]?.name?.message}
        />
        <InputField
          label="CEP"
          placeholder="Digite o CEP"
          type="text"
          register={register(`locations.${index}.zipCode`)}
          onChange={(e) => {
            const value = e.target.value;
            const unmaskedValue = value.replace(/\D/g, '');
            handleCepChange(index, unmaskedValue);
          }}
          error={errors?.locations?.[index]?.zipCode?.message}
        />
        <InputField
          label="Endereço"
          placeholder="Digite o endereço"
          type="text"
          register={register(`locations.${index}.address`)}
          error={errors?.locations?.[index]?.address?.message}
        />

      </div>
      <div className="my-4 grid grid-cols-1 gap-4 md:grid-cols-4">
        <InputField
          label="Latitude"
          placeholder="Digite a latitude"
          type="text"
          register={register(`locations.${index}.latitude`)}
        />
        <InputField
          label="Longitude"
          placeholder="Digite a longitude"
          type="text"
          register={register(`locations.${index}.longitude`)}
        />
        <Controller
          control={control}
          name={`locations.${index}.state`}
          render={({ field }) => (
            <SelectField
              label="Estado"
              placeholder="Selecione o estado"
              options={states}
              {...field}
              onChange={(e) => {
                field.onChange(e);
                handleStateChange(e);
              }}
              error={errors?.locations?.[index]?.state?.message}
            />
          )}
        />
        <Controller
          control={control}
          name={`locations.${index}.city`}
          render={({ field }) => (
            <SelectField
              label="Cidade"
              placeholder="Selecione a cidade"
              options={cities}
              {...field}
              error={errors?.locations?.[index]?.city?.message}
            />
          )}
        />
      </div>
      {
        loadingLocation ? (
          <p>Carregando localização...</p>
        ) : (
          <Map
            initialLatitude={Number(watch(`locations.${index}.latitude`)) || currentLatitude || 0}
            initialLongitude={Number(watch(`locations.${index}.longitude`)) || currentLongitude || 0}
            onPositionChange={(lat, lng) => handlePositionChange(lat, lng)}
          />
        )
      }
    </>
  );
};

export default AddressForm;
