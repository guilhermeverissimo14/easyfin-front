
'use client';
import { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import cn from "@core/utils/class-names";
import { useIsMounted } from "@core/hooks/use-is-mounted";

export default function ProofDetails({imgUrl}: {imgUrl: string}) {
  const mounted = useIsMounted();
 
  const [isOpen, setIsOpen] = useState(false);
  const imageUrl = `${process.env.NEXT_PUBLIC_GCS_BASE_URL}${imgUrl}`;
  return (
    <div
      className={cn(
        "w-full h-[calc(100vh-128px)] relative grid gap-0",
        isOpen && "@sm:grid-cols-[1fr_380px] grid-cols-[1fr_340px]"
      )}
    >
      <TransformWrapper
        minScale={0.1}
        centerOnInit={true}
        limitToBounds={false}
      >
        <TransformComponent wrapperClass="!w-full !h-full cursor-grab border border-muted">
          {mounted ? (
            <>
              <img src={imageUrl} alt="Comprovante de Hospedagem"  />
            </>
          ) : null}
        </TransformComponent>
      </TransformWrapper>
      
    </div>
  );
}
