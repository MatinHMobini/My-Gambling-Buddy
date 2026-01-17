import { AppShell } from "@/components/layout/AppShell";
import { ChatWindow } from "@/components/chat/ChatWindow";

export default function Home() {
  return (
    <AppShell>
      <ChatWindow />
    </AppShell>
  );
}
