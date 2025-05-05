"use client";

import { z } from "zod";
import { Button } from "rizzui";
import { Fragment, useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { PiPlusCircle } from "react-icons/pi";
import { DragEndEvent } from "@dnd-kit/core";
import { createId } from "@paralleldrive/cuid2";
import { toast } from "react-toastify";

import { SortableList } from "./dnd-sortable-list";
import cn from "@core/utils/class-names";
import { PayrollInput } from "@/components/input/payroll-input";
import { LauchType, OptionsSelect, RecordsType } from "@/types";
import { api } from "@/service/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { PayrollSelect } from "@/components/input/payroll-select";
import { formatMoney, moneyMask } from "@/utils/format";
import TrashIcon from "@core/components/icons/trash";

const userSchema = z.object({
  launchRecords: z
    .array(
      z.object({
        typeId: z.string().optional(),
        label: z.string().optional(),
        amount: z.number().optional(),
        type: z.string().optional(),
      })
    )
    .optional(),
});

type TableBlockProps = {
  onTotalsChange: (totals: { provent: number; discount: number }) => void;
  onRecordsChange: (records: RecordsType[]) => void;
  isEdit?: boolean;
  isClone?: boolean;
  launchRecord?: RecordsType[];
  totalCommission?: number;
};


export default function TableBlock({ onTotalsChange, onRecordsChange, launchRecord, isEdit, isClone, totalCommission }: TableBlockProps) {
  const [launchTypes, setLaunchTypes] = useState<OptionsSelect[]>([]);
  const [lauchs, setLaunchs] = useState<LauchType[]>([]);

  const { register, setValue, getValues, control, watch } = useForm({
    resolver: zodResolver(userSchema),
  });

  const { fields, append, move, replace } = useFieldArray({
    control,
    name: "launchRecords",
  });


  function handleChange(event: DragEndEvent) {
    const { active, over } = event;
    if (!active || !over) return;
    const oldIndex = fields.findIndex((item) => item.id === active.id);
    const newIndex = fields.findIndex((item) => item.id === over.id);
    move(oldIndex, newIndex);
  }

  async function fetchLaunchTypes() {
    try {
      const response = await api.get<LauchType[]>("/launch-types");

      const options = response.data.map((type) => ({
        label: type.description,
        value: type.id,
      }));
      setLaunchTypes(options);
      setLaunchs(response.data);

      if ((isEdit || isClone) && launchRecord) {
        const updatedLaunchRecords = launchRecord.map((item) => ({
          type: item.type,
          label: item.label,
          typeId: item.typeId,
          amount: formatMoney(Number(item.amount)),
        }));
        replace(updatedLaunchRecords);

      } else {
        const initialLaunches = response.data
          .filter((item) => item.description === "Salário Base" || item.description === "Comissão")
          .map((item) => ({
            id: createId(),
            type: item.type,
            label: item.description,
            typeId: item.id,
            amount: formatMoney(0),
          }));
        replace(initialLaunches);
      }
    } catch (error) {
      console.error("Erro ao buscar tipos de lançamento:", error);
    }
  }

  const launchRecords: RecordsType[] = watch("launchRecords") || [];



  function sumRecords() {

    let provent = launchRecords
      .filter((record: { type?: string; amount?: string }) => record.type == "PROVENTO")
      .reduce((sum: number, record: { amount?: string }) => {
        const rawValue: string = record.amount || "0";

        const numericValue: number = Number(
          rawValue.replace(/[^\d,.-]/g, "")
            .replace(/\./g, "")
            .replace(",", ".")
        );

        return sum + (isNaN(numericValue) ? 0 : numericValue);
      }, 0);

    let discount = launchRecords
      .filter((record: { type?: string; amount?: string }) => record.type === "DESCONTO")
      .reduce((sum: number, record: { amount?: string }) => {
        const rawValue: string = record.amount || "0";

        const numericValue: number = Number(
          rawValue.replace(/[^\d,.-]/g, "")
            .replace(/\./g, "")
            .replace(",", ".")
        );

        return sum + (isNaN(numericValue) ? 0 : numericValue);
      }, 0);

    onTotalsChange({ provent, discount });
  }

  function addItem() {
    const lastItem = launchRecords[launchRecords.length - 1] as RecordsType;

    if (
      !lastItem ||
      !lastItem.typeId ||
      !lastItem.label ||
      !lastItem.amount ||
      lastItem.amount === formatMoney(0)
    ) {
      toast.error("Preencha todos os campos antes de adicionar um novo item.");
      return;
    }

    append({
      type: "",
      label: "",
      typeId: "",
      amount: formatMoney(0),
    });
  }

  function removeItem(index: number) {
    const updatedRecords = [...launchRecords];
    updatedRecords.splice(index, 1);
    replace(updatedRecords);

    sumRecords();
    onRecordsChange(updatedRecords);
  }


  useEffect(() => {
    if (!launchRecords) return;

    const commissionIndex = launchRecords.findIndex(
      (record) => record.label === "Comissão"
    );

    if (commissionIndex !== -1) {
      setValue(
        `launchRecords.${commissionIndex}.amount`,
        formatMoney(totalCommission || 0)
      );
    }

    const records = launchRecords.map((record) => ({
      typeId: record.typeId || "",
      label: record.label || "",
      amount: record.amount || "",
      type: record.type || "",
    }));

    sumRecords();
    onRecordsChange(records);

  }, [JSON.stringify(launchRecords), totalCommission]);

  useEffect(() => {
    fetchLaunchTypes();
  }, []);

  return (
    <div className="relative mt-12 mb-16 md:0">
      <div className="hidden md:flex justify-evenly gap-2 rounded-t-md bg-gray-100 p-2 dark:bg-gray-900">
        <TableHeaderCell className="col-span-4 ps-2 w-1/3">
          <PayrollInput
            value="Descrição"
            readOnly
          />
        </TableHeaderCell>
        <TableHeaderCell className="col-span-4 flex w-1/3 justify-center items-center">
          <PayrollInput
            className="w-full"
            value="Tipo"
            readOnly
          />
        </TableHeaderCell>
        <TableHeaderCell className="col-span-4 flex w-1/3 justify-end items-center">
          <PayrollInput
            className="w-full"
            value="Valor"
            readOnly
          />
        </TableHeaderCell>
      </div>

      {/* desktop */}
      <ul className="hidden md:block">
        <SortableList
          items={fields}
          onChange={handleChange}
        >
          {fields?.map((field, index) => {
            const selectedDescription = fields
              .map((_, i) => getValues(`launchRecords.${i}.typeId`))

            const filteredOptions = launchTypes
              .filter((option) => !selectedDescription.includes(option.value) || option.value === getValues(`launchRecords.${index}.typeId`));

            return (
              <Fragment key={field.id}>
                <SortableList.Item id={field.id}>
                  <div className="flex justify-evenly gap-2 border-b border-muted dark:border-muted/20">
                    <div className="col-span-4 p-2 flex justify-end w-1/3">
                      <Controller
                        control={control}
                        name={`launchRecords.${index}.typeId`}
                        render={({ field: { value, onChange } }) => (
                          <PayrollSelect
                            options={filteredOptions}
                            onChange={(selected) => {
                              onChange(selected);

                              const selectedItem = lauchs.find((item) => item.id === selected);
                              if (selectedItem) {
                                setValue(`launchRecords.${index}.type`, selectedItem.type);
                                setValue(`launchRecords.${index}.label`, selectedItem.description);
                              }
                            }}
                            value={value || ""}
                          />
                        )}
                      />
                    </div>
                    <div className="col-span-4 flex justify-end items-center w-1/3">
                      <PayrollInput
                        className="w-full"
                        {...register(`launchRecords.${index}.type`)}
                      />
                    </div>
                    <div className="col-span-4 flex justify-end items-center w-1/3">
                      <PayrollInput
                        className="w-full"
                        type="text"
                        {...register(`launchRecords.${index}.amount`)}
                        readOnly={launchRecords[index]?.label === "Comissão"}
                        onChange={(e) => {
                          const value = e.target.value;
                          setValue(`launchRecords.${index}.amount`, moneyMask(value));
                        }}
                      />
                    </div>
                  </div>
                </SortableList.Item>
              </Fragment>
            );
          })}
        </SortableList>
      </ul>

      {/* Responsivo  */}
      <ul className="md:hidden pb-2">
        {fields?.map((field, index) => {

          const selectedDescription = fields
            .map((_, i) => getValues(`launchRecords.${i}.typeId`))

          const filteredOptions = launchTypes
            .filter((option) => !selectedDescription.includes(option.value) || option.value === getValues(`launchRecords.${index}.typeId`));

          return (
            <li key={field.id} className="rounded-lg border border-gray-300 bg-white shadow-lg p-4 mb-4 dark:bg-gray-900">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <Controller
                  control={control}
                  name={`launchRecords.${index}.typeId`}
                  render={({ field: { value, onChange } }) => (
                    <PayrollSelect
                      inputClassName="ml-0 pl-0"
                      options={filteredOptions}
                      onChange={(selected) => {
                        onChange(selected);

                        const selectedItem = lauchs.find((item) => item.id === selected);
                        if (selectedItem) {
                          setValue(`launchRecords.${index}.type`, selectedItem.type);
                          setValue(`launchRecords.${index}.label`, selectedItem.description);
                        }
                      }}
                      value={value || ""}
                    />
                  )}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
                <PayrollInput
                  inputClassName="border-r border-gray-200 p-1"
                  className="w-full"
                  {...register(`launchRecords.${index}.type`)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                <PayrollInput
                  inputClassName="border-r border-gray-200 p-1"
                  className="w-full"
                  type="text"
                  {...register(`launchRecords.${index}.amount`)}
                  onChange={(e) => {
                    const value = e.target.value;
                    setValue(`launchRecords.${index}.amount`, moneyMask(value));
                  }}
                />
              </div>
            </li>
          )
        })}
      </ul>

      <Button
        type="button"
        variant="text"
        className="absolute bottom-0 start-0 translate-y-full gap-2 ps-0 active:enabled:translate-y-full dark:text-gray-400"
        onClick={() => addItem()}
      >
        <PiPlusCircle className="size-5" />
        Adicionar Item
      </Button>
      {
        fields.length > 2 && (
          <Button
            type="button"
            variant="text"
            className="absolute bottom-0 right-0 translate-y-full gap-2 ps-0 active:enabled:translate-y-full dark:text-gray-400"
            onClick={() => removeItem(launchRecords.length - 1)}
          >
            <TrashIcon className="size-5" />
            Remover Item
          </Button>
        )
      }
    </div>
  );
}

function TableHeaderCell({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "font-semibold [&_input]:uppercase [&_input]:text-gray-500 dark:[&_input]:text-gray-400",
        className
      )}
    >
      {children}
    </div>
  );
}
