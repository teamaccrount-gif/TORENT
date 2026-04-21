import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
<<<<<<< HEAD
import { Button } from "../ui/button";
=======
import { Button } from "../ui/Button";
>>>>>>> 3cd2829 (Revert "feat: implement telemetry visualization component and initialize interactive map module")
import { DataVisualizer } from "./DataVisualizer";
import { useTelemetryFilter } from "../../context/TelemetryFilterContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/Input";
import { Loader2, AlertCircle, Clock, Tag, Activity } from "lucide-react";

interface HistoryLayoutProps {
    activeTab: "raw" | "aggregated" | "delta";
    title: string;
    subtitle: string;
    fetchButtonLabel: string;
    children?: React.ReactNode;
}

export const HistoryLayout: React.FC<HistoryLayoutProps> = ({
    activeTab,
    title,
    subtitle,
    fetchButtonLabel,
    children,
}) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const {
        tableData,
        tagsLoading,
        selectedTags,
        handleTagSelect,
        startTime,
        setStartTime,
        endTime,
        setEndTime,
        liveValues,
        connected,
        latestValues,
        selectedRows,
        onFetch,
        loading,
        chartData,
        errorMessage,
    } = useTelemetryFilter();

    const navItems = [
        { key: "raw", label: t("nav.rawData", "Raw Data"), path: "/filters/raw" },
        { key: "aggregated", label: t("nav.aggregatedData", "Aggregated Data"), path: "/filters/aggregated" },
        { key: "delta", label: t("nav.deltaData", "Delta Data"), path: "/filters/delta" },
    ];

    const isReady = selectedTags.length > 0 && startTime && endTime;

    return (
        <div className="space-y-6 pb-12 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Navigation Tabs */}
            <div className="flex flex-col gap-4">
                <Tabs value={activeTab} onValueChange={(v) => {
                    const item = navItems.find(i => i.key === v);
                    if (item) navigate(item.path);
                }}>
                    <TabsList className="bg-gray-100 border border-gray-200 shadow-sm p-1">
                        {navItems.map((item) => (
                            <TabsTrigger 
                                key={item.key} 
                                value={item.key}
                                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm px-6"
                            >
                                {item.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                </Tabs>
            </div>

            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">{title}</h1>
                <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>

            {/* Available Tags */}
            <Card className="border-gray-200 shadow-sm overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-3">
                    <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Tag className="h-3.5 w-3.5" />
                        {t("model.availableTags", "Available Tags")}
                        {tagsLoading && <Loader2 className="h-3 w-3 animate-spin inline ml-1" />}
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                    <div className="flex flex-wrap gap-2">
                        {tableData.length === 0 && !tagsLoading ? (
                            <p className="text-sm text-muted-foreground italic">{t("model.noTags", "No tags found.")}</p>
                        ) : (
                            tableData.map((row) => (
                                <button
                                    key={row.tag}
                                    onClick={() => handleTagSelect(row.tag)}
                                    className={`text-[11px] px-3 py-1.5 rounded-md border transition-all duration-150 font-mono shadow-sm
                                        ${selectedTags.includes(row.tag)
                                            ? "bg-blue-600 border-blue-600 text-white"
                                            : "bg-white border-gray-200 text-gray-600 hover:border-blue-400 hover:text-blue-600"
                                        }`}
                                >
                                    {row.tag}
                                </button>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Children for specific filters */}
            {children}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Time Range */}
                <Card className="border-gray-200 shadow-sm h-fit">
                    <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-3">
                        <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5" />
                            {t("model.timeRange", "Time Range")}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-600">{t("model.startTime", "Start Time")}</label>
                            <Input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="h-9 text-xs"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-gray-600">{t("model.endTime", "End Time")}</label>
                            <Input
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="h-9 text-xs"
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Live Values */}
                {selectedTags.length > 0 && (
                    <Card className="border-gray-200 shadow-sm">
                        <CardHeader className="bg-gray-50/50 border-b border-gray-100 py-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                <Activity className="h-3.5 w-3.5" />
                                Live Monitor
                            </CardTitle>
                            <div className="flex items-center gap-1.5">
                                <div className={`w-2 h-2 rounded-full ${connected ? "bg-green-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "bg-red-500"}`} />
                                <span className="text-[10px] font-semibold uppercase text-gray-500 tracking-wider">
                                    {connected ? "Active" : "Connecting"}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 max-h-[300px] overflow-y-auto custom-scrollbar">
                            <div className="space-y-3">
                                {selectedRows.map(({ tag }) => {
                                    const live = liveValues[tag];
                                    const initial = latestValues?.find((l) => l.tag === tag);
                                    const display: { value: number; quality: number; timestamp: string } | null = live ?? initial ?? null;

                                    return (
                                        <div key={tag} className="flex items-center justify-between bg-gray-50 border border-gray-100 rounded-lg px-4 py-2.5 transition-all hover:bg-white hover:border-blue-100 hover:shadow-sm">
                                            <div className="min-w-0 flex-1 mr-4">
                                                <p className="text-xs font-mono font-medium text-gray-700 truncate">{tag}</p>
                                                {display?.quality !== undefined && (
                                                    <p className={`text-[10px] font-bold uppercase tracking-tight mt-0.5 ${display.quality === 1 ? "text-green-600" : "text-yellow-600"}`}>
                                                        {display.quality === 1 ? "Good" : "Degraded"}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className={`text-base font-bold tracking-tight ${live ? "text-blue-600 animate-in fade-in duration-300" : "text-gray-900"}`}>
                                                    {display ? display.value.toFixed(2) : "—"}
                                                </p>
                                                {display?.timestamp && (
                                                    <p className="text-[10px] text-muted-foreground mt-0.5">
                                                        {new Date(display.timestamp).toLocaleTimeString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Fetch Button */}
            <Button
                onClick={onFetch}
                disabled={!isReady || loading}
                className="w-full h-12 text-base font-semibold shadow-md transition-all active:scale-[0.98]"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t("model.fetching", "Synchronizing...")}
                    </>
                ) : fetchButtonLabel}
            </Button>

            {errorMessage && (
                <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800 animate-in shake duration-500">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                </Alert>
            )}

            {/* Result Visualization */}
            {chartData && (
                <div className="animate-in fade-in slide-in-from-top-4 duration-700 pt-4">
                    <DataVisualizer data={chartData} loading={loading} />
                </div>
            )}
        </div>
    );
};
