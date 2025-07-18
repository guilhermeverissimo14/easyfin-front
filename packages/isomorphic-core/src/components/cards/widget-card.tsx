import { Title } from "rizzui/typography";
import cn from "../../utils/class-names";
import { RefObject } from "react";

const widgetCardClasses = {
  base: "border border-muted bg-gray-0 p-5 dark:bg-gray-50 lg:p-7",
  rounded: {
    sm: "rounded-sm",
    DEFAULT: "rounded-lg",
    lg: "rounded-xl",
    xl: "rounded-2xl",
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
      <div
        className={cn(
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
