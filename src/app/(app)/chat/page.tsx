import React from "react";
import { requireUser } from "@/lib/auth";
import { getActiveUsers } from "@/lib/actions/chat";
import { db } from "@/db";
import { projects, tasks } from "@/db/schema";
import { ChatLayout } from "@/components/chat/chat-layout";

export const metadata = {
  title: "Chat - WayFind CRM",
  description: "Internal team communication hub",
};

export default async function ChatPage() {
  const user = await requireUser();

  // Fetch active users list for chats
  const activeUsers = await getActiveUsers();

  // Fetch projects list for group linkage
  const projectsList = await db
    .select({
      id: projects.id,
      name: projects.name,
    })
    .from(projects);

  // Fetch tasks list for group linkage
  const tasksList = await db
    .select({
      id: tasks.id,
      title: tasks.title,
    })
    .from(tasks);

  const uploadReady = !!process.env.UPLOADTHING_TOKEN;

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-crm-heading">Internal Chat</h1>
        <p className="text-sm text-crm-muted">
          Connect with team members and collaborate in project groups
        </p>
      </div>

      <ChatLayout
        currentUserId={user.id}
        currentUserRole={user.role}
        uploadReady={uploadReady}
        usersList={activeUsers}
        projectsList={projectsList}
        tasksList={tasksList}
      />
    </div>
  );
}
