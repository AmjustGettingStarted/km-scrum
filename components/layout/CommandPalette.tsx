"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Search, KanbanSquare } from "lucide-react";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    router.push(`/tasks?search=${encodeURIComponent(query.trim())}`);
    setOpen(false);
    setQuery("");
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-inputs border border-ash bg-paper-mist/40 text-xs text-fog hover:text-charcoal hover:border-smoke transition-colors cursor-pointer"
      >
        <Search className="w-3.5 h-3.5 text-fog" />
        <span>Search tasks...</span>
        <kbd className="font-mono text-[10px] bg-canvas-white border border-ash rounded px-1 text-steel">
          Ctrl+K
        </kbd>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md p-3">
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-fog absolute left-3 top-2.5 pointer-events-none" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Type a task code (e.g. KM-101) or keyword..."
                className="pl-9 h-10 text-sm"
                autoFocus
              />
            </div>
            <div className="px-2 text-[11px] text-fog flex items-center justify-between">
              <span>Press Enter to search task board</span>
              <kbd className="font-mono bg-paper-mist px-1.5 py-0.5 rounded border border-ash">
                ESC to close
              </kbd>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
