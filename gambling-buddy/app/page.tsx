"use client";

import Image from "next/image";
import { useState } from "react";
import Logo from "./Logo.png";

import { AppShell } from "@/components/layout/AppShell";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { SportTabs, type Sport } from "@/components/sport/SportTabs";

export default function Home() {
  const [sport, setSport] = useState<Sport>("NBA");

  return (
    <AppShell sport={sport}>
      <div className="space-y-0">
        {/* Header stays BROWN (theme background) */}
        <div className="rounded-2xl bg-background px-6 pt-6 pb-2">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:justify-between">
            {/* Logo only */}
            <div className="flex items-center justify-center sm:justify-start">
              <Image
                src={Logo}
                alt="Gambling Buddy Logo"
                priority
                className="h-28 w-28 rounded-2xl object-contain shadow-sm sm:h-36 sm:w-36"
              />
            </div>

            {/* High-tech sport selector */}
            <SportTabs value={sport} onChange={setSport} />
          </div>
        </div>

        {/* Chat area: brown background, white panels inside */}
        <div className="chat-surface overflow-hidden rounded-3xl bg-[#a17945] shadow-sm ring-1 ring-black/10">
          <ChatWindow sport={sport} />
        </div>
      </div>
    </AppShell>
  );
}
