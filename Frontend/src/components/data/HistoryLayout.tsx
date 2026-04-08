import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Button } from "../ui/Button";
import { DataVisualizer } from "./DataVisualizer";
import { useTelemetryFilter } from "../../context/TelemetryFilterContext";

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
        <div className="space-y-6 pb-12 text-gray-900">
            {/* Navigation Tabs */}
            <nav className="bg-gray-100 p-1 rounded-lg flex gap-1 max-w-fit border border-gray-200">
                {navItems.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => navigate(item.path)}
                        className={`py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 
                            ${item.key === activeTab ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{title}</h1>
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            </div>

            {/* Available Tags */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
                    {t("model.availableTags", "Available Tags")}{tagsLoading ? " ⏳" : ""}
                </p>
                <div className="flex flex-wrap gap-2">
                    {tableData.length === 0 && !tagsLoading ? (
                        <p className="text-sm text-gray-500 italic">{t("model.noTags", "No tags found.")}</p>
                    ) : (
                        tableData.map((row) => (
                            <button
                                key={row.tag}
                                onClick={() => handleTagSelect(row.tag)}
                                className={`text-xs px-3 py-1.5 rounded-md border transition-all duration-150 font-mono
                                    ${selectedTags.includes(row.tag)
                                        ? "bg-blue-50 border-blue-200 text-blue-700"
                                        : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                                    }`}
                            >
                                {row.tag}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Children for specific filters (like Interval) */}
            {children}

            {/* Time Range */}
            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
                    {t("model.timeRange", "Time Range")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                        <label className="text-xs text-gray-500">{t("model.startTime", "Start Time")}</label>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs text-gray-500">{t("model.endTime", "End Time")}</label>
                        <input
                            type="datetime-local"
                            value={endTime}
                            onChange={(e) => setEndTime(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>

            {/* Live Values */}
            {selectedTags.length > 0 && (
                <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">Live Values</p>
                        <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full transition-colors ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                            <span className="text-xs text-gray-500">{connected ? "Live" : "Connecting..."}</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        {selectedRows.map(({ tag }) => {
                            const live = liveValues[tag];
                            const initial = latestValues?.find((l) => l.tag === tag);
                            const display: { value: number; quality: number; timestamp: string } | null = live ?? initial ?? null;

                            return (
                                <div key={tag} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                                    <div className="min-w-0 flex-1 mr-4">
                                        <p className="text-xs font-mono text-gray-700 truncate">{tag}</p>
                                        {display?.quality !== undefined && (
                                            <p className={`text-xs mt-0.5 ${display.quality === 1 ? "text-green-600" : "text-yellow-600"}`}>
                                                {display.quality === 1 ? "Good" : "Bad quality"}
                                            </p>
                                        )}
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`text-lg font-semibold ${live ? "text-green-600" : "text-gray-900"}`}>
                                            {display ? String(display.value) : "—"}
                                        </p>
                                        {display?.timestamp && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {new Date(display.timestamp).toLocaleTimeString()}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Fetch Button */}
            <Button
                onClick={onFetch}
                disabled={!isReady || loading}
                className="w-full py-2.5 shadow-sm text-base"
                isLoading={loading}
            >
                {loading ? t("model.fetching", "Fetching...") : fetchButtonLabel}
            </Button>

            {errorMessage && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {errorMessage}
                </div>
            )}

            {/* Result Visualization */}
            {chartData && (
                <DataVisualizer data={chartData} loading={loading} />
            )}
        </div>
    );
};
