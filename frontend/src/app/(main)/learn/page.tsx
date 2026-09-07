"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchLearningPath } from "@/lib/api";
import { LearningPath } from "@/components/learn/LearningPath";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function LearnPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["learningPath"],
    queryFn: fetchLearningPath,
  });

  if (isLoading) {
    return (
      <div className="w-full max-w-xl mx-auto py-8 space-y-8 animate-pulse px-4">
        <div className="h-32 bg-slate-200 rounded-3xl" />
        <div className="flex flex-col items-center gap-8 py-6">
          <div className="w-20 h-20 bg-slate-200 rounded-full" />
          <div className="w-20 h-20 bg-slate-200 rounded-full translate-x-12" />
          <div className="w-20 h-20 bg-slate-200 rounded-full -translate-x-12" />
          <div className="w-20 h-20 bg-slate-200 rounded-full" />
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-6">
        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center mb-4">
          <AlertCircle size={28} />
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-2">
          Unable to load learning path
        </h3>
        <p className="text-sm font-semibold text-slate-500 max-w-sm mb-6">
          Make sure the backend server is running and the database is accessible.
        </p>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#58cc02] text-white font-black text-sm uppercase tracking-wider shadow-[0_4px_0_#46a302] hover:bg-[#46a302] active:translate-y-1 active:shadow-none transition-all"
        >
          <RefreshCw size={18} />
          <span>TRY AGAIN</span>
        </button>
      </div>
    );
  }

  return <LearningPath units={data.units} />;
}
