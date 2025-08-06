'use client';

import { Text } from 'rizzui';
import cn from '../../utils/class-names';

const metricCardClasses = {
  base: 'relative overflow-hidden border border-gray-200/60 bg-gradient-to-br from-white to-gray-50/30 p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/40 hover:-translate-y-1 dark:from-gray-50 dark:to-gray-100/30 dark:border-gray-300/40 lg:p-6 backdrop-blur-sm',
  rounded: {
    sm: 'rounded-sm',
    DEFAULT: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
  },
};

type MetricCardTypes = {
  title: string;
  metric: React.ReactNode;
  icon?: React.ReactNode;
  iconClassName?: string;
  contentClassName?: string;
  chart?: React.ReactNode;
  info?: React.ReactNode;
  rounded?: keyof typeof metricCardClasses.rounded;
  titleClassName?: string;
  metricClassName?: string;
  chartClassName?: string;
  className?: string;
};

export default function MetricCard({
  title,
  metric,
  icon,
  chart,
  info,
  rounded = 'DEFAULT',
  className,
  iconClassName,
  contentClassName,
  titleClassName,
  metricClassName,
  chartClassName,
  children,
}: React.PropsWithChildren<MetricCardTypes>) {
  return (
    <div
      className={cn(
        metricCardClasses.base,
        metricCardClasses.rounded[rounded],
        className
      )}
    >
      {/* Decorative background element */}
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-100/20 to-purple-100/20 blur-2xl" />
      <div className="absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-gradient-to-tr from-green-100/20 to-blue-100/20 blur-xl" />
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center">
          {icon ? (
            <div
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-white to-gray-50 shadow-sm border border-gray-200/50 transition-all duration-300 hover:shadow-md hover:scale-105 lg:h-12 lg:w-12',
                iconClassName
              )}
            >
              {icon}
            </div>
          ) : null}

          <div className={cn(icon && 'ps-3', contentClassName)}>
            <Text className={cn('mb-0.5 text-gray-500', titleClassName)}>
              {title}
            </Text>
            <Text
              className={cn(
                'font-lexend text-lg font-semibold text-gray-900 2xl:xl:text-xl dark:text-gray-700',
                metricClassName
              )}
            >
              {metric}
            </Text>

            {info ? info : null}
          </div>
        </div>

        {chart ? (
          <div className={cn('h-12 w-20', chartClassName)}>{chart}</div>
        ) : null}
      </div>

      {children}
    </div>
  );
}
