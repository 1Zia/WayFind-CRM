"use client";

import {
  ChevronDown,
  Filter,
  Group,
  Search,
  SlidersHorizontal,
  SortAsc,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { createSprint } from "@/lib/actions/sprints";
import type { TaskColumnKey } from "@/components/tasks/task-group-table";
import { Button, LiquidButton } from "@/components/ui/button";

type Option = {
  id: string;
  name: string;
};

type SprintOption = Option & {
  status: string;
};

export type TaskSortOption =
  | "newest"
  | "oldest"
  | "due_asc"
  | "due_desc"
  | "priority_desc"
  | "priority_asc"
  | "status"
  | "assignee"
  | "project";

export type TaskGroupOption =
  | "sprint"
  | "status"
  | "assignee"
  | "project"
  | "none";

type TaskBoardToolbarProps = {
  canCreateSprint: boolean;
  canCreateTask: boolean;
  projects: Option[];
  sprints: SprintOption[];
  users: Option[];
  visibleColumns: TaskColumnKey[];
  onResetColumns: () => void;
  onToggleColumn: (column: TaskColumnKey) => void;
};

const columnOptions: Array<{ key: TaskColumnKey; label: string }> = [
  { key: "taskId", label: "Task ID" },
  { key: "type", label: "Type" },
  { key: "assignee", label: "Assignee" },
  { key: "status", label: "Status" },
  { key: "priority", label: "Priority" },
  { key: "project", label: "Project" },
  { key: "sprint", label: "Sprint" },
  { key: "dueDate", label: "Due Date" },
  { key: "estimate", label: "Estimate" },
  { key: "actions", label: "Actions" },
];

const filterParamKeys = [
  "status",
  "priority",
  "assigneeId",
  "projectId",
  "sprintId",
  "type",
  "overdue",
  "mine",
];

export function TaskBoardToolbar({
  canCreateSprint,
  canCreateTask,
  projects,
  sprints,
  users,
  visibleColumns,
  onResetColumns,
  onToggleColumn,
}: TaskBoardToolbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [creatingSprint, setCreatingSprint] = useState(false);
  const [columnsOpen, setColumnsOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const activeFilterCount = filterParamKeys.filter((key) =>
    searchParams.get(key),
  ).length;

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`${pathname}?${params.toString()}`);
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    filterParamKeys.forEach((key) => params.delete(key));
    router.push(`${pathname}?${params.toString()}`);
  }

  async function handleCreateSprint() {
    const name = window.prompt("Sprint name");

    if (!name?.trim()) {
      return;
    }

    try {
      setCreatingSprint(true);
      await createSprint({
        name,
        description: "",
        startDate: "",
        endDate: "",
        status: "planned",
      });
      toast.success("Sprint created");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setCreatingSprint(false);
    }
  }

  return (
    <div className="crm-card mb-6 flex flex-wrap items-center gap-3 p-4">
      {canCreateTask ? (
        <Button asChild variant="cool">
          <Link href="/tasks/new">
            New task
          </Link>
        </Button>
      ) : null}

      {canCreateSprint ? (
        <LiquidButton
          type="button"
          disabled={creatingSprint}
          onClick={handleCreateSprint}
          size="default"
          className="disabled:opacity-60 font-semibold"
        >
          {creatingSprint ? "Creating..." : "Create sprint"}
        </LiquidButton>
      ) : null}

      <label className="flex min-w-56 items-center gap-2 rounded-lg border border-crm-border bg-crm-surface px-3 py-2 text-sm text-crm-muted">
        <Search className="h-4 w-4" />
        <input
          defaultValue={searchParams.get("search") ?? ""}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              updateParam("search", event.currentTarget.value);
            }
          }}
          placeholder="Search"
          className="w-full bg-transparent outline-none"
        />
      </label>

      <select
        value={searchParams.get("sort") ?? "newest"}
        onChange={(event) => updateParam("sort", event.target.value)}
        className="crm-input mt-0 w-auto py-2"
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
        <option value="due_asc">Due date ascending</option>
        <option value="due_desc">Due date descending</option>
        <option value="priority_desc">Priority high to low</option>
        <option value="priority_asc">Priority low to high</option>
        <option value="status">Status</option>
        <option value="assignee">Assignee</option>
        <option value="project">Project</option>
      </select>

      <select
        value={searchParams.get("group") ?? "sprint"}
        onChange={(event) => updateParam("group", event.target.value)}
        className="crm-input mt-0 w-auto py-2"
      >
        <option value="sprint">Group by sprint</option>
        <option value="status">Group by status</option>
        <option value="assignee">Group by assignee</option>
        <option value="project">Group by project</option>
        <option value="none">No grouping</option>
      </select>

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setColumnsOpen((current) => !current);
            setFiltersOpen(false);
          }}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Hide columns
          <ChevronDown className="h-4 w-4" />
        </button>

        {columnsOpen ? (
          <div className="absolute left-0 top-full z-30 mt-2 w-56 rounded-xl border bg-white p-3 shadow-lg">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-950">Columns</p>
              <button
                type="button"
                onClick={onResetColumns}
                className="text-xs font-medium text-purple-600 hover:underline"
              >
                Reset
              </button>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-zinc-500">
                <input type="checkbox" checked disabled />
                Task title
              </label>
              {columnOptions.map((column) => (
                <label
                  key={column.key}
                  className="flex items-center gap-2 text-sm text-zinc-700"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumns.includes(column.key)}
                    onChange={() => onToggleColumn(column.key)}
                  />
                  {column.label}
                </label>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="relative">
        <button
          type="button"
          onClick={() => {
            setFiltersOpen((current) => !current);
            setColumnsOpen(false);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:bg-blue-100"
        >
          <Filter className="h-4 w-4" />
          Board filters{activeFilterCount > 0 ? ` (${activeFilterCount})` : ""}
          <ChevronDown className="h-4 w-4" />
        </button>

        {filtersOpen ? (
          <div className="absolute left-0 top-full z-30 mt-2 w-80 rounded-xl border bg-white p-4 shadow-lg">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-medium text-zinc-950">Board filters</p>
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 hover:underline"
              >
                <X className="h-3 w-3" />
                Clear filters
              </button>
            </div>

            <div className="grid gap-3">
              <FilterSelect
                label="Status"
                value={searchParams.get("status") ?? ""}
                onChange={(value) => updateParam("status", value)}
                options={[
                  ["todo", "Todo"],
                  ["in_progress", "In Progress"],
                  ["testing", "Testing"],
                  ["done", "Done"],
                ]}
              />
              <FilterSelect
                label="Priority"
                value={searchParams.get("priority") ?? ""}
                onChange={(value) => updateParam("priority", value)}
                options={[
                  ["low", "Low"],
                  ["medium", "Medium"],
                  ["high", "High"],
                  ["urgent", "Urgent"],
                ]}
              />
              <FilterSelect
                label="Assignee"
                value={searchParams.get("assigneeId") ?? ""}
                onChange={(value) => updateParam("assigneeId", value)}
                options={users.map((user) => [user.id, user.name])}
              />
              <FilterSelect
                label="Project"
                value={searchParams.get("projectId") ?? ""}
                onChange={(value) => updateParam("projectId", value)}
                options={projects.map((project) => [project.id, project.name])}
              />
              <FilterSelect
                label="Sprint"
                value={searchParams.get("sprintId") ?? ""}
                onChange={(value) => updateParam("sprintId", value)}
                options={[
                  ["backlog", "Backlog / No Sprint"],
                  ...sprints.map((sprint) => [sprint.id, sprint.name] as [string, string]),
                ]}
              />
              <FilterSelect
                label="Type"
                value={searchParams.get("type") ?? ""}
                onChange={(value) => updateParam("type", value)}
                options={[
                  ["feature", "Feature"],
                  ["bug", "Bug"],
                  ["improvement", "Improvement"],
                  ["research", "Research"],
                  ["testing", "Testing"],
                  ["other", "Other"],
                ]}
              />
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  checked={searchParams.get("overdue") === "1"}
                  onChange={(event) =>
                    updateParam("overdue", event.target.checked ? "1" : "")
                  }
                />
                Overdue only
              </label>
              <label className="flex items-center gap-2 text-sm text-zinc-700">
                <input
                  type="checkbox"
                  checked={searchParams.get("mine") === "1"}
                  onChange={(event) =>
                    updateParam("mine", event.target.checked ? "1" : "")
                  }
                />
                My tasks only
              </label>
            </div>
          </div>
        ) : null}
      </div>

      <div className="hidden items-center gap-2 text-xs text-zinc-500 xl:flex">
        <SortAsc className="h-4 w-4" />
        <span>Sort, group, filters, and columns apply together.</span>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<[string, string]>;
  value: string;
}) {
  return (
    <label className="grid gap-1 text-xs font-medium text-zinc-500">
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="rounded-lg border px-3 py-2 text-sm font-normal text-zinc-700"
      >
        <option value="">Any</option>
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} value={optionValue}>
            {optionLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
