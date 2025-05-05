"use client";

import Image from "next/image";
import prettyBytes from "pretty-bytes";
import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "@uploadthing/react";
import { PiCheckBold, PiTrashBold } from "react-icons/pi";
import { Button, Text, FieldError } from "rizzui";
import cn from "../../utils/class-names";
import UploadIcon from "../../components/shape/upload";
import { endsWith } from "lodash";
import { FileWithPath } from "react-dropzone";

interface UploadZoneProps {
  label?: string;
  name: string;
  getValues: any;
  setValue: any;
  className?: string;
  error?: string;
}

interface FileType {
  name: string;
  url: string;
  size: number;
  preview: string;
}

export default function UploadZone({
  label,
  name,
  className,
  getValues,
  setValue,
  error,
}: UploadZoneProps) {
  interface ExtendedFile extends File {
    preview: string;
  }

  const [file, setFile] = useState<ExtendedFile | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      const newFile = acceptedFiles[0];
      const preview = URL.createObjectURL(newFile);
      setFile(Object.assign(newFile, { preview }));
      
      setValue(name, {path:newFile.path, name: newFile.name, size: newFile.size, url: preview });
    },
    [setValue, name]
  );

  function handleRemoveFile() {
    setFile(null);
    setValue(name, null);
  }

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp', '.tiff'],
    },
    maxFiles: 1,
  });

  return (
    <div className={cn("grid @container overflow-auto ", className)}>
      {label && <span className="mb-1.5 block font-semibold text-gray-900">{label}</span>}
      <div
        className={cn(
          "rounded-md border-[1.8px] flex-col md:flex-row",
          file && "flex items-center justify-between @xl:pr-6"
        )}
      >
        <div
          {...getRootProps()}
          className={cn(
            "flex cursor-pointer items-center gap-4 px-6 py-5 transition-all duration-300",
            !file ? "justify-center" : "flex-grow justify-center @xl:justify-start"
          )}
        >
          <input {...getInputProps()} />
          <UploadIcon className="h-12 w-12" />
          <Text className="text-sm md:text-base font-medium">Selecione um comprovante</Text>
        </div>

        {file && (
          <div className="flex items-center gap-4 px-6 py-5 w-full md:w-auto">
            <Button
              variant="outline"
              className="gap-2 w-full md:w-auto"
              onClick={handleRemoveFile}
            >
              <PiTrashBold />
              Remover
            </Button>
          </div>
        )}
      </div>

      {file && (
        <div className="mt-5 grid grid-cols-1 gap-4">
          <div className={cn("relative")}>
            <figure className="group relative h-40 rounded-md bg-gray-50">
              <MediaPreview
                name={file.name}
                url={file.preview}
              />
              <button
                type="button"
                className="absolute right-0 top-0 rounded-full bg-gray-700 p-1.5 transition duration-300"
              >
                <PiCheckBold className="text-white" />
              </button>
            </figure>
            <MediaCaption
              name={file.name}
              size={file.size}
            />
          </div>
        </div>
      )}

      {error && <FieldError error={error} />}
    </div>
  );
}

function MediaPreview({ name, url }: { name: string; url: string }) {
  return endsWith(name, ".pdf") ? (
    <object
      data={url}
      type="application/pdf"
      width="100%"
      height="100%"
    >
      <p>
        Alternative text - include a link <a href={url}>to the PDF!</a>
      </p>
    </object>
  ) : (
    <Image
      fill
      src={url}
      alt={name}
      className="transform rounded-md object-contain"
    />
  );
}

function MediaCaption({ name, size }: { name: string; size: number }) {
  return (
    <div className="mt-1 text-xs">
      <p className="break-words font-medium text-gray-700">{name}</p>
      <p className="mt-1 font-mono">{prettyBytes(size)}</p>
    </div>
  );
}