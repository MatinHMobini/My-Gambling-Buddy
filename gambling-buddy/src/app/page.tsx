// src/app/page.tsx
import Image from "next/image";
import Logo from "./Logo.png";

import { AppShell } from "@/components/layout/AppShell";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  return (
    <AppShell>
      <div className="space-y-4">
        {/* Header stays BROWN (theme background) */}
        <div className="rounded-2xl bg-background p-6">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-5">
              <Image
                src={Logo}
                alt="Gambling Buddy Logo"
                priority
                className="h-28 w-28 rounded-2xl object-contain shadow-sm sm:h-36 sm:w-36"
              />

              <div>
                <div className="text-3xl font-semibold leading-tight sm:text-4xl">
                  Gambling Buddy
                </div>
                <div className="mt-1 text-sm text-muted-foreground sm:text-base">
                  Ask about schedules, projections, matchups, and parlay ideas.
                  <span className="ml-2 font-medium">Entertainment only.</span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge className="bg-black/20 text-white hover:bg-black/25">
                    NBA
                  </Badge>
                  <Badge className="bg-black/20 text-white hover:bg-black/25">
                    Hackathon Build
                  </Badge>
                  <Badge className="bg-black/20 text-white hover:bg-black/25">
                    Chat UI
                  </Badge>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Chat area: brown background, white panels inside */}
        <div className="chat-surface overflow-hidden rounded-3xl bg-[#a17945] shadow-sm ring-1 ring-black/10">
          <ChatWindow />
        </div>



      </div>
    </AppShell>
  );
}
