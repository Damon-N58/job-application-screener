import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { ProfileProvider } from "@/hooks/useProfile";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nineteen58 Recruiter | AI-Powered Hiring Platform",
  description: "Automate your hiring process with AI-powered resume screening and candidate evaluation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.variable} antialiased font-sans`}>
          <ProfileProvider>
            {children}
          </ProfileProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
