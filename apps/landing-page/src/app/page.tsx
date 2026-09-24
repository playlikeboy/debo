import type { Metadata } from "next";
import { Hero } from "@/components/landing/Hero";
import { Problem } from "@/components/landing/Problem";
import { Product } from "@/components/landing/Product";
import { UseCases } from "@/components/landing/UseCases";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { McpCliSection } from "@/components/landing/McpCliSection";
import { Privacy } from "@/components/landing/Privacy";
import { FounderNote } from "@/components/landing/FounderNote";
import { FinalCTA } from "@/components/landing/FinalCTA";

export const metadata: Metadata = {
  title: "Debo | Personal AI Memory & Context",
  description:
    "A personal AI memory layer for journals, voice recordings, documents, and connected-app context, with source-backed retrieval and MCP access.",
  openGraph: {
    title: "Debo: The Memory Context Protocol for Humans",
    description:
      "AI without memory is temporary. Debo provides the permanent context layer that turns your history into a searchable personal intelligence protocol.",
  },
};

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Problem />
      <Product />
      <UseCases />
      <HowItWorks />
      <McpCliSection />
      <Privacy />
      <FounderNote />
      <FinalCTA />
    </>
  );
}
