"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

interface StatusChartProps {
  statusCounts: {
    TO_DO: number;
    IN_PROGRESS: number;
    PENDING: number;
    TESTING: number;
    RELEASED: number;
    COMPLETED: number;
  };
}

const COLORS = [
  "#64748b", // To Do
  "#2563eb", // In Progress
  "#f59e0b", // Pending
  "#8b5cf6", // Testing
  "#6366f1", // Released
  "#10b981", // Completed
];

export function StatusDistributionChart({ statusCounts }: StatusChartProps) {
  const data = [
    { name: "To Do", value: statusCounts.TO_DO },
    { name: "In Progress", value: statusCounts.IN_PROGRESS },
    { name: "Pending", value: statusCounts.PENDING },
    { name: "Testing", value: statusCounts.TESTING },
    { name: "Released", value: statusCounts.RELEASED },
    { name: "Completed", value: statusCounts.COMPLETED },
  ].filter((d) => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="h-44 flex items-center justify-center text-xs text-fog italic">
        No task data to display
      </div>
    );
  }

  return (
    <div className="h-44 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={65}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e5e5",
              borderRadius: "8px",
              fontSize: "12px",
            }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
