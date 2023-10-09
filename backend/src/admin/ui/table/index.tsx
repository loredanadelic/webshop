import React from "react";
import clsx from "clsx";
import { useNavigate } from "react-router-dom";

type TableRowProps = React.HTMLAttributes<HTMLTableRowElement> & {
  forceDropdown?: boolean;

  linkTo?: string;
  clickable?: boolean;
};

type TableCellProps = React.TdHTMLAttributes<HTMLTableDataCellElement> & {
  linkTo?: string;
  name?: string;
};

type SortingHeadCellProps = {
  onSortClicked: () => void;
  sortDirection?: "ASC" | "DESC";
  setSortDirection: (string) => void;
} & React.HTMLAttributes<HTMLTableDataCellElement>;

export type TableProps = {
  tableActions?: React.ReactNode;
  enableSearch?: boolean;
  searchClassName?: string;
  immediateSearchFocus?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  containerClassName?: string;
  handleSearch?: (searchTerm: string) => void;
} & React.HTMLAttributes<HTMLTableElement>;

type TableElement<T> = React.ForwardRefExoticComponent<T> &
  React.RefAttributes<unknown>;

type TableType = {
  Head: TableElement<React.HTMLAttributes<HTMLTableSectionElement>>;
  HeadRow: TableElement<React.HTMLAttributes<HTMLTableRowElement>>;
  HeadCell: TableElement<React.ThHTMLAttributes<HTMLTableDataCellElement>>;
  SortingHeadCell: TableElement<SortingHeadCellProps>;
  Body: TableElement<React.HTMLAttributes<HTMLTableSectionElement>>;
  Row: TableElement<TableRowProps>;
  Cell: TableElement<TableCellProps>;
} & TableElement<TableProps>;
type SortingIconProps = {
  ascendingColor?: string;
  descendingColor?: string;
  isSorted?: "asc" | "desc" | false;
  size?: string | number;
  color?: string;
};

const SortingIcon: React.FC<SortingIconProps> = ({
  size = "24",
  color = "currentColor",
  ascendingColor,
  descendingColor,
  isSorted = false,
  ...attributes
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...attributes}
    >
      <path
        d="M4.66602 10L7.99935 13.3333L11.3327 10"
        className={clsx({
          "stroke-grey-40": isSorted !== "desc",
          "stroke-current": isSorted === "desc",
        })}
        stroke={descendingColor || color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4.66602 6.00008L7.99935 2.66675L11.3327 6.00008"
        stroke={ascendingColor || color}
        className={clsx({
          "stroke-grey-40": isSorted !== "asc",
          "stroke-current": isSorted === "asc",
        })}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
const Table = React.forwardRef<HTMLTableElement, TableProps>(
  (
    {
      className,
      children,
      tableActions,
      enableSearch,
      searchClassName,
      immediateSearchFocus,
      searchPlaceholder,
      searchValue,
      handleSearch,
      containerClassName,
      ...props
    },
    ref
  ) => {
    if (enableSearch && !handleSearch) {
      throw new Error("Table cannot enable search without a search handler");
    }

    return (
      <div className={`flex flex-col ${containerClassName}`}>
        <div className="mb-2 flex w-full justify-between">
          <div className="gap-x-xsmall flex items-center">
            {tableActions && <div>{tableActions}</div>}
          </div>
        </div>
        <div className="relative">
          <table
            ref={ref}
            className={clsx("w-full table-auto", className)}
            {...props}
          >
            {children}
          </table>
        </div>
      </div>
    );
  }
) as TableType;

Table.Head = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, children, ...props }, ref) => (
  <thead
    ref={ref}
    className={clsx(
      "inter-small-semibold text-grey-50 border-grey-20 whitespace-nowrap border-t border-b",
      className
    )}
    {...props}
  >
    {children}
  </thead>
));

Table.HeadRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, children, ...props }, ref) => (
  <tr ref={ref} className={clsx(className)} {...props}>
    {children}
  </tr>
));

Table.HeadCell = React.forwardRef<
  HTMLTableDataCellElement,
  React.HTMLAttributes<HTMLTableDataCellElement>
>(({ className, children, ...props }, ref) => (
  <th ref={ref} className={clsx("h-[40px] text-left", className)} {...props}>
    {children}
  </th>
));

Table.SortingHeadCell = React.forwardRef<
  HTMLTableDataCellElement,
  SortingHeadCellProps
>(
  (
    {
      onSortClicked,
      sortDirection,
      setSortDirection,
      className,
      children,
      ...props
    }: SortingHeadCellProps,
    ref
  ) => {
    return (
      <th ref={ref} className={clsx("py-2.5 text-left", className)} {...props}>
        <div
          className="flex cursor-pointer select-none items-center"
          onClick={(e) => {
            e.preventDefault();
            if (!sortDirection) {
              setSortDirection("ASC");
            } else {
              if (sortDirection === "ASC") {
                setSortDirection("DESC");
              } else {
                setSortDirection(undefined);
              }
            }
            onSortClicked();
          }}
        >
          {children}
          <SortingIcon
            size={16}
            ascendingColor={sortDirection === "ASC" ? "#111827" : undefined}
            descendingColor={sortDirection === "DESC" ? "#111827" : undefined}
          />
        </div>
      </th>
    );
  }
);

Table.Body = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, children, ...props }, ref) => (
  <tbody ref={ref} className={clsx(className)} {...props}>
    {children}
  </tbody>
));

Table.Cell = React.forwardRef<HTMLTableDataCellElement, TableCellProps>(
  ({ className, linkTo, children, ...props }, ref) => {
    const navigate = useNavigate();
    return (
      <td
        ref={ref}
        className={clsx("inter-small-regular h-[40px]", className)}
        {...props}
        {...(linkTo && {
          onClick: (e) => {
            navigate(linkTo);
            e.stopPropagation();
          },
        })}
      >
        {children}
      </td>
    );
  }
);

Table.Row = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  (
    { className, children, linkTo, forceDropdown, clickable, ...props },
    ref
  ) => {
    const navigate = useNavigate();
    return (
      <tr
        ref={ref}
        className={clsx(
          "inter-small-regular border-grey-20 text-grey-90 border-t border-b",
          className,
          {
            "hover:bg-grey-5 cursor-pointer": linkTo !== undefined || clickable,
          }
        )}
        {...props}
        {...(linkTo && {
          onClick: () => {
            navigate(linkTo);
          },
        })}
      >
        {children}
      </tr>
    );
  }
);

export default Table;
