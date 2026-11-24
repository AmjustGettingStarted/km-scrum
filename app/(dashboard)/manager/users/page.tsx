import { Suspense } from "react";
import { getUsersAction } from "@/services/user.service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateUserModal } from "@/components/auth/CreateUserModal";
import { UserActionsDropdown } from "@/components/auth/UserActionsDropdown";
import { Users as UsersIcon } from "lucide-react";
import { formatDate } from "@/lib/utils";

async function UserTableList() {
  const users = await getUsersAction().catch(() => []);

  if (users.length === 0) {
    return (
      <tr>
        <td colSpan={7} className="py-8 text-center text-sm text-fog">
          No users found. Click &quot;Create User&quot; above to add team members.
        </td>
      </tr>
    );
  }

  return (
    <>
      {users.map((u) => {
        const roleVariant =
          u.role === "MANAGER" ? "purple" : u.role === "SCRUM_MASTER" ? "blue" : "default";

        return (
          <tr key={u.id} className="hover:bg-paper-mist/40 transition-colors">
            <td className="py-3.5 px-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full bg-paper-mist border border-ash flex items-center justify-center text-xs font-semibold text-charcoal">
                  {u.full_name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span className="font-medium text-charcoal block leading-tight">
                    {u.full_name}
                  </span>
                  {u.email && (
                    <span className="text-xs text-fog block leading-tight">{u.email}</span>
                  )}
                </div>
              </div>
            </td>
            <td className="py-3.5 px-4 font-mono text-xs text-graphite">{u.username}</td>
            <td className="py-3.5 px-4">
              <Badge variant={roleVariant}>{u.role.replace("_", " ")}</Badge>
            </td>
            <td className="py-3.5 px-4">
              {u.is_active ? (
                <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-red-600 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span> Inactive
                </span>
              )}
            </td>
            <td className="py-3.5 px-4 text-xs text-steel">{formatDate(u.created_at)}</td>
            <td className="py-3.5 px-4 text-right">
              <UserActionsDropdown user={u} />
            </td>
          </tr>
        );
      })}
    </>
  );
}

function TableSkeleton() {
  return (
    <tr>
      <td colSpan={6} className="py-8 text-center text-sm text-steel">
        Loading user directory...
      </td>
    </tr>
  );
}

export default function UsersManagementPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-0.5 rounded-tags mb-2 font-medium">
            <UsersIcon className="w-3.5 h-3.5" />
            Manager Console
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-charcoal">User Administration</h1>
          <p className="text-sm text-steel mt-1">
            Provision team accounts, assign roles, and manage credentials.
          </p>
        </div>

        <CreateUserModal />
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-ash bg-paper-mist/60 text-xs font-medium text-steel">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Username</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ash">
              <Suspense fallback={<TableSkeleton />}>
                <UserTableList />
              </Suspense>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
