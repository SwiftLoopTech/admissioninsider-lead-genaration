import React, { useState } from "react";
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Application, ApplicationStatus } from "@/types/application";
import App from "next/app";

interface ApplicationDataTableProps {
  userType: "admin" | "agent" | "counselor" | "client";
  applicationData: Application[];
}

const ApplicationDataTable: React.FC<ApplicationDataTableProps> = ({
  userType = "admin",
  applicationData = [],
}) => {
  const [globalFilter, setGlobalFilter] = useState("");

  // Define column helper
  const columnHelper = createColumnHelper<Application>();

  // Function to format date strings
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Function to format array to comma-separated string
  const formatArray = (arr: string[] | null) => {
    if (!arr) return "None";
    return arr.join(", ");
  };

  // Define columns based on user type
  const getColumns = () => {
    // Common columns for all user types
    const commonColumns = [
      columnHelper.accessor("client_name", {
        header: "Client Name",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("application_status", {
        header: "Status",
        cell: (info) => (
          <Badge
            className={
              info.getValue() === "pending"
                ? "bg-yellow-500"
                : info.getValue() === ApplicationStatus.ACCEPTED
                ? "bg-green-500"
                : info.getValue() === ApplicationStatus.REVIEW
                ? "bg-blue-500"
                : "bg-gray-500"
            }
          >
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("created_at", {
        header: "Created",
        cell: (info) => formatDate(info.getValue()),
      }),
    ];

    // Admin sees everything
    if (userType === "admin") {
      return [
        columnHelper.accessor("application_id", {
          header: "ID",
          cell: (info) => (
            <span className="text-xs text-gray-500">
              {info.getValue()?.substring(0, 8) ?? "N/A"}...
            </span>
          ),
        }),
        ...commonColumns,
        columnHelper.accessor("client_email", {
          header: "Email",
          cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("phone_number", {
          header: "Phone",
          cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("preferred_locations", {
          header: "Locations",
          cell: (info) => formatArray(info.getValue()),
        }),
        columnHelper.accessor("preferred_colleges", {
          header: "Colleges",
          cell: (info) => formatArray(info.getValue()),
        }),
        columnHelper.accessor("agent_id", {
          header: "Agent",
          cell: (info) => (
            <span className="text-xs">
              {info.getValue()?.substring(0, 8) ?? "N/A"}...
            </span>
          ),
        }),
        columnHelper.accessor("counselor_id", {
          header: "Counselor",
          cell: (info) =>
            info.getValue() ? (
              <span className="text-xs">
                {info.getValue()?.substring(0, 8) ?? "N/A"}...
              </span>
            ) : (
              <Button>Assign</Button>
            ),
        }),
        columnHelper.accessor("updated_at", {
          header: "Last Updated",
          cell: (info) => formatDate(info.getValue()),
        }),
      ];
    }

    // Agent view
    else if (userType === "agent") {
      return [
        ...commonColumns,
        columnHelper.accessor("client_email", {
          header: "Email",
          cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("phone_number", {
          header: "Phone",
          cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("preferred_locations", {
          header: "Locations",
          cell: (info) => formatArray(info.getValue()),
        }),
      ];
    }

    // Counselor view
    else if (userType === "counselor") {
      return [
        ...commonColumns,
        columnHelper.accessor("completed_course", {
          header: "Completed Course",
          cell: (info) => info.getValue(),
        }),
        columnHelper.accessor("planned_courses", {
          header: "Planned Courses",
          cell: (info) => formatArray(info.getValue()),
        }),
        columnHelper.accessor("preferred_locations", {
          header: "Locations",
          cell: (info) => formatArray(info.getValue()),
        }),
        columnHelper.accessor("preferred_colleges", {
          header: "Colleges",
          cell: (info) => formatArray(info.getValue()),
        }),
      ];
    }

    // Client view (limited)
    else if (userType === "client") {
      return [
        columnHelper.accessor("application_id", {
          header: "Application ID",
          cell: (info) => (
            <span className="text-xs">
              {info.getValue().substring(0, 8)}...
            </span>
          ),
        }),
        ...commonColumns,
        columnHelper.accessor("planned_courses", {
          header: "Planned Courses",
          cell: (info) => formatArray(info.getValue()),
        }),
        columnHelper.accessor("preferred_locations", {
          header: "Locations",
          cell: (info) => formatArray(info.getValue()),
        }),
        columnHelper.accessor("preferred_colleges", {
          header: "Selected Colleges",
          cell: (info) => formatArray(info.getValue()),
        }),
      ];
    }

    // Default fallback
    return commonColumns;
  };

  const columns = getColumns();

  const table = useReactTable({
    data: applicationData,
    columns,
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  // Generate user type options for demo
  const userTypes = ["admin", "agent", "counselor", "client"];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row justify-between items-center">
        <CardTitle>Application Data</CardTitle>
        <div className="flex gap-4">
          <Input
            placeholder="Search all columns..."
            value={globalFilter ?? ""}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="w-64"
          />
          {/* This select is just for demo purposes */}
          <Select value={userType} disabled>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="User Type" />
            </SelectTrigger>
            <SelectContent>
              {userTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded border">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-gray-100">
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="p-2 text-left font-medium text-sm"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
              {table.getRowModel().rows.length === 0 && (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="p-4 text-center text-gray-500"
                  >
                    No results found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApplicationDataTable;
