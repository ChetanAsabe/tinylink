"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function CodeDetailsPage() {
    const { code } = useParams();
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!code) return;

        const fetchDetails = async () => {
            try {
                const res = await fetch(`/api/links/${code}`);
                const json = await res.json();
                setData(json[0]);
            } catch (err) {
                console.error("Error fetching details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [code]);

    if (loading)
        return (
            <div className="p-6 max-w-xl mx-auto">
                <Card className="shadow-md border border-gray-200 p-4">
                    <CardHeader>
                        <CardTitle className="text-xl">Loading details...</CardTitle>
                    </CardHeader>

                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-3/5" />
                    </CardContent>
                </Card>
            </div>
        );

    return (
        <div className="p-6 max-w-xl mx-auto">
            <Card className="shadow-md border border-gray-200">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold">
                        URL Details
                    </CardTitle>
                    <p className="text-sm text-gray-500">Code: {code}</p>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div>
                        <p className="text-sm font-semibold text-gray-600">Original URL</p>
                        <p className="text-base break-words">{data.original_url}</p>
                    </div>

                    <Separator />

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-gray-600">Short URL</p>
                            <p className="text-base">{data.shorten_url}</p>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                size="sm"
                                variant="outline"
                                onClick={() => navigator.clipboard.writeText(data.shorten_url)}
                            >
                                <Copy size={16} />
                            </Button>
                        </div>
                    </div>

                    <Separator />
                    <div>
                        <p className="text-sm font-semibold text-gray-600">Clicks</p>
                        <p className="text-lg font-bold">{data.track}</p>
                    </div>

                    <Separator />
                    <div>
                        <p className="text-sm font-semibold text-gray-600">Created At</p>
                        <p>{new Date(data.created_at).toLocaleString()}</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
