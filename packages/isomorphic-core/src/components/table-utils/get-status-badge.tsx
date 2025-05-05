"use client";

import cn from "@core/utils/class-names";
import { Flex, Text } from "rizzui";

const statusColors = {
  true: ["text-green-dark", "bg-green-dark", "bg-green-100"],
  false: ["text-red-dark", "bg-red-dark", "bg-red-100"],
};

export function getStatusBadge(status: boolean, label: string) {
  const statusKey = status ? 'true' : 'false';
  return (
    <Flex
      align="center"
      gap="2"
      className={cn("w-24 p-1 rounded-full flex items-center justify-center", statusColors[statusKey][2])}
    >
      <Text
        className={cn("font-medium capitalize", statusColors[statusKey][0])}
      >
        {label}
      </Text>
    </Flex>
  );
}