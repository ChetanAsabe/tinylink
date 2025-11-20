"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface URL {
    id: number;
    slug: string;
    original_url: string;
    tracks: number;
    created_at: Date | string;
    shorten_url: string;
}

interface TableState {
    data: URL[];
    loading: boolean;
    error: string | null;
    deletingSlug: string | null;
    selectedForDelete: string | null;
}

export function TableComponent() {
    const [state, setState] = useState<TableState>({
        data: [],
        loading: true,
        error: null,
        deletingSlug: null,
        selectedForDelete: null,
    });


    const fetchData = useCallback(async () => {
        setState((prev) => ({ ...prev, loading: true, error: null }));
        try {
            const response = await fetch("/api/links", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch links (${response.status})`);
            }

            const urls: URL[] = await response.json();
            setState((prev) => ({ ...prev, data: urls, loading: false }));
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Failed to load URLs";
            setState((prev) => ({
                ...prev,
                loading: false,
                error: errorMessage,
            }));
            toast.error(errorMessage)
        }
    }, [toast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSelectURL = useCallback((slug: string) => {
        window.location.href = `/code/${slug}`;
    }, []);

    const handleDeleteClick = useCallback((slug: string) => {
        setState((prev) => ({ ...prev, selectedForDelete: slug }));
    }, []);

    const handleConfirmDelete = useCallback(
        async (slug: string) => {
            setState((prev) => ({ ...prev, deletingSlug: slug }));

            try {
                const response = await fetch(`/api/links/${slug}`, {
                    method: "DELETE",
                    headers: { "Content-Type": "application/json" },
                });

                if (!response.ok) {
                    throw new Error(`Failed to delete URL (${response.status})`);
                }

                setState((prev) => ({
                    ...prev,
                    data: prev.data.filter((url) => url.slug !== slug),
                    deletingSlug: null,
                    selectedForDelete: null,
                }));

                toast.success("URL deleted successfully");
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "Failed to delete URL";

                setState((prev) => ({
                    ...prev,
                    deletingSlug: null,
                    selectedForDelete: null,
                }));

                toast.error(errorMessage)
            }
        },
        [toast]
    );

    const handleCancelDelete = useCallback(() => {
        setState((prev) => ({ ...prev, selectedForDelete: null }));
    }, []);

    const handleRetry = useCallback(() => {
        fetchData();
    }, [fetchData]);

    return (
        <>
            {state.error && !state.loading && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
                    <p className="text-sm text-red-700 mb-2">{state.error}</p>
                    <Button
                        onClick={handleRetry}
                        variant="outline"
                        size="sm"
                        className="text-red-700 border-red-200 hover:bg-red-100"
                    >
                        Retry
                    </Button>
                </div>
            )}

            <div
                className="max-h-full overflow-auto scroll-smooth"
                style={{ scrollbarWidth: "thin" }}
            >
                <Table className="w-full" style={{ tableLayout: "fixed" }}>
                    <TableHeader>
                        <TableRow>
                            <TableHead style={{ width: "6%" }}>ID</TableHead>
                            <TableHead style={{ width: "20%" }}>Short URL</TableHead>
                            <TableHead style={{ width: "30%" }}>Original URL</TableHead>
                            <TableHead style={{ width: "10%" }}>Tracks</TableHead>
                            <TableHead style={{ width: "20%" }}>Created At</TableHead>
                            <TableHead style={{ width: "14%" }}>Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {state.loading
                            ? Array.from({ length: 5 }).map((_, i) => (
                                <TableRow key={`skeleton-${i}`}>
                                    <TableCell>
                                        <div className="h-4 w-10 rounded bg-gray-200 animate-pulse" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-4 w-32 rounded bg-gray-200 animate-pulse" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-4 w-8 rounded bg-gray-200 animate-pulse" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-4 w-40 rounded bg-gray-200 animate-pulse" />
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-4 w-20 rounded bg-gray-200 animate-pulse" />
                                    </TableCell>
                                </TableRow>
                            ))
                            : state.data.length === 0
                                ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center py-8">
                                            <p className="text-gray-500">No URLs yet. Create one to get started!</p>
                                        </TableCell>
                                    </TableRow>
                                )
                                : state.data.map((url: URL) => (
                                    <TableRow key={url.id}>
                                        <TableCell className="truncate text-sm">
                                            {url.id}
                                        </TableCell>
                                        <TableCell className="truncate text-sm font-mono">
                                            {url.shorten_url}
                                        </TableCell>
                                        <TableCell className="truncate text-sm">
                                            {url.original_url}
                                        </TableCell>
                                        <TableCell className="text-sm">{url.tracks ?? 0}</TableCell>
                                        <TableCell className="truncate text-sm">
                                            {formatDate(url.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="cursor-pointer hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300"
                                                    onClick={() => handleSelectURL(url.slug)}
                                                    title="View analytics"
                                                    aria-label={`View analytics for ${url.shorten_url}`}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="cursor-pointer hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                                                    onClick={() => handleDeleteClick(url.slug)}
                                                    disabled={state.deletingSlug === url.slug}
                                                    title="Delete URL"
                                                    aria-label={`Delete ${url.shorten_url}`}
                                                >
                                                    {state.deletingSlug === url.slug ? (
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="h-4 w-4" />
                                                    )}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                    </TableBody>
                </Table>
            </div>

            <AlertDialog
                open={state.selectedForDelete !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        handleCancelDelete();
                    }
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete URL</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this shortened URL? This action cannot be
                            undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="bg-gray-50 p-3 rounded text-sm font-mono break-all">
                        {state.selectedForDelete}
                    </div>
                    <div className="flex gap-3 justify-end">
                        <AlertDialogCancel disabled={state.deletingSlug !== null}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() =>
                                state.selectedForDelete &&
                                handleConfirmDelete(state.selectedForDelete)
                            }
                            disabled={state.deletingSlug !== null}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {state.deletingSlug ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                    Deleting...
                                </>
                            ) : (
                                "Delete"
                            )}
                        </AlertDialogAction>
                    </div>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

function formatDate(d: Date | string): string {
    const date = d instanceof Date ? d : new Date(d);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleString();
}