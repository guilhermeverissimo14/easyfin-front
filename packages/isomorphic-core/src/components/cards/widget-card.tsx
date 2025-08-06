import { Title } from "rizzui/typography";
import cn from "../../utils/class-names";
import { RefObject } from "react";

const widgetCardClasses = {
  base: "relative overflow-hidden border border-gray-200/60 bg-gradient-to-br from-white to-gray-50/30 p-5 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/40 hover:-translate-y-1 dark:from-gray-50 dark:to-gray-100/30 dark:border-gray-300/40 lg:p-7 backdrop-blur-sm",
  rounded: {
    sm: "rounded-sm",
    DEFAULT: "rounded-xl",
    lg: "rounded-2xl",
    xl: "rounded-3xl",
  },
};

type WidgetCardTypes = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  rounded?: keyof typeof widgetCardClasses.rounded;
  headerClassName?: string;
  titleClassName?: string;
  actionClassName?: string;
  descriptionClassName?: string;
  className?: string;
  ref?: React.Ref<HTMLDivElement>;
};

function WidgetCard({
  title,
  action,
  description,
  rounded = "DEFAULT",
  className,
  headerClassName,
  actionClassName,
  titleClassName,
  descriptionClassName,
  children,
  ref,
}: React.PropsWithChildren<WidgetCardTypes>) {
  return (
    <div
      className={cn(
        widgetCardClasses.base,
        widgetCardClasses.rounded[rounded],
        className
      )}
      ref={ref}
    >
      {/* Decorative background elements */}
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-gradient-to-br from-blue-100/15 to-purple-100/15 blur-3xl" />
      <div className="absolute -bottom-8 -left-8 h-28 w-28 rounded-full bg-gradient-to-tr from-green-100/15 to-blue-100/15 blur-2xl" />
      
      <div
        className={cn(
          "relative",
          action && "flex items-start justify-between ",
          headerClassName
        )}
      >
        <div>
          <Title
            as="h3"
            className={cn("text-base font-semibold sm:text-lg whitespace-nowrap", titleClassName)}
          >
            {title}
          </Title>
          {description && (
            <div className={descriptionClassName}>{description}</div>
          )}
        </div>
        {action && <div className={cn("ps-2", actionClassName)}>{action}</div>}
      </div>
      {children}
    </div>
  );
}

export default WidgetCard;
WidgetCard.displayName = "WidgetCard";
