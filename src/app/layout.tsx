import type { Metadata } from "next";
import { auth } from "@/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ChatBubble from "@/components/ChatBubble";
import "./globals.css";

export const metadata: Metadata = {
  title: "Goodturn — Freelancers, Businesses and Industry Experts",
  description:
    "Goodturn connects freelancers, businesses and industry experts through Goodturn Jobs, Goodturn Connect and Goodturn Learn.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex min-h-screen flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html:
              '(function(){try{var t=localStorage.getItem("theme");var d=t?t==="dark":matchMedia("(prefers-color-scheme: dark)").matches;if(d)document.documentElement.classList.add("dark")}catch(e){}})()',
          }}
        />
        <Navbar userName={session?.user?.name ?? null} />
        <main className="flex-1">{children}</main>
        <Footer />
        <ChatBubble />
      </body>
    </html>
  );
}
