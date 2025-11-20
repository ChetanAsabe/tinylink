"use client";

import * as React from "react";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TableComponent } from "./components/table";
import { toast } from "sonner";

interface FormState {
  isSubmitting: boolean;
  error: string | null;
}

export default function Home() {
  const [open, setOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    isSubmitting: false,
    error: null,
  });
  const [tableKey, setTableKey] = useState(0);

  const validateUrl = (urlString: string): boolean => {
    try {
      const url = new URL(urlString.startsWith("http") ? urlString : `https://${urlString}`);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleAddURL = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const form = e.currentTarget;
      const formData = new FormData(form);
      const urlInput = (formData.get("url") as string)?.trim() || "";

      setFormState({ isSubmitting: true, error: null });

      if (!urlInput) {
        setFormState({
          isSubmitting: false,
          error: "URL is required",
        });
        return;
      }

      if (!validateUrl(urlInput)) {
        setFormState({
          isSubmitting: false,
          error: "Please enter a valid URL (e.g., example.com or https://example.com)",
        });
        return;
      }

      if (urlInput.length > 2048) {
        setFormState({
          isSubmitting: false,
          error: "URL is too long (max 2048 characters)",
        });
        return;
      }

      try {
        const response = await fetch("/api/links", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url: urlInput }),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.message || `Failed to add URL (${response.status})`);
        }

        await response.json();

        setOpen(false);
        setFormState({ isSubmitting: false, error: null });
        form.reset();
        setTableKey((prev) => prev + 1);

        toast.success("URL shortened successfully");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "An unexpected error occurred";

        setFormState({
          isSubmitting: false,
          error: errorMessage,
        });

        toast.error(errorMessage);
      }
    },
    []
  );

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setFormState({ isSubmitting: false, error: null });
    }
  };

  return (
    <div className="p-4 w-full flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-5xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">URL Dashboard</h1>
          <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
              <Button className="cursor-pointer">Add New URL</Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New URL</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddURL} className="grid gap-4 mt-2">
                <div className="grid gap-3">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    name="url"
                    placeholder="example.com"
                    type="text"
                    required
                    disabled={formState.isSubmitting}
                    maxLength={2048}
                    autoComplete="off"
                  />
                </div>

                {formState.error && (
                  <div
                    className="bg-red-50 border border-red-200 rounded p-3 text-sm text-red-700"
                    role="alert"
                  >
                    {formState.error}
                  </div>
                )}

                <DialogFooter className="mt-4">
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={formState.isSubmitting}
                    >
                      Cancel
                    </Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    className="cursor-pointer"
                    disabled={formState.isSubmitting}
                  >
                    {formState.isSubmitting ? "Adding..." : "Add URL"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <TableComponent key={tableKey} />
        </div>
      </div>
    </div>
  );
}