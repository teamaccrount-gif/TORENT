import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchTags, type TableRow, type LatestEntry } from "../../ModelsLogic/RawDataModel";
import { fetchDeltaData } from "../../ModelsLogic/DeltaDataModel";
import { INTERVAL_OPTIONS } from "../../ModelsLogic/AggregatedDataModel";
import { useAppDispatch, useAppSelector } from "../../Redux/Store";
import { fetchLatestValues } from "../../Redux/Slices/latestSlice";
import { useTelemetryWatcher } from "../../hooks/useTelemetryWatcher";
import { Button } from "../../components/ui/Button";
import { DataVisualizer } from "../../components/data/DataVisualizer";

const Delta: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const [tableData, setTableData] = useState<TableRow[]>([]);
    const [tagsLoading, setTagsLoading] = useState<boolean>(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [chartData, setChartData] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedIntervalIndex, setSelectedIntervalIndex] = useState<number>(0);

    const latestValues = useAppSelector((state) => state.latestSlice.data.fetchLatestValues) as LatestEntry[] | null;

    const selectedRows = useMemo(() => {
        return tableData.filter((row) => selectedTags.includes(row.tag)).map((row) => ({ tag: row.tag, id: row.id }));
    }, [tableData, selectedTags]);

    const { liveValues, connected } = useTelemetryWatcher(selectedRows);
    const isReady = selectedTags.length > 0 && startTime && endTime && selectedIntervalIndex >= 0;

    useEffect(() => {
        const loadTags = async () => {
            try {
                setTagsLoading(true);
                const tags = await fetchTags();
                setTableData(tags);
            } catch (error) {
                console.error("Failed to fetch table data:", error);
            } finally {
                setTagsLoading(false);
            }
        };
        loadTags();
    }, []);

    useEffect(() => {
        if (selectedTags.length === 0) return;
        dispatch(fetchLatestValues({ tags: selectedTags }));
    }, [selectedTags, dispatch, selectedRows]);

    const fetchChartData = async (): Promise<void> => {
        if (!isReady) return;
        try {
            setLoading(true);
            const selected = INTERVAL_OPTIONS[selectedIntervalIndex];
            const data = await fetchDeltaData({
                tags: selectedTags,
                startTime,
                endTime,
                intervalValue: selected.value,
                intervalUnit: selected.unit,
            });
            setChartData(data);
        } catch (error) {
            console.error("Failed to fetch chart data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTagSelect = (tag: string): void => {
        setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
    };

    const navItems = [
        { key: "raw", label: t("nav.rawData", "Raw Data"), path: "/filters/raw" },
        { key: "aggregated", label: t("nav.aggregatedData", "Aggregated Data"), path: "/filters/aggregated" },
        { key: "delta", label: t("nav.deltaData", "Delta Data"), path: "/filters/delta" },
    ];

    return (
        <div className="space-y-6 pb-12 text-gray-900">
            <nav className="bg-gray-100 p-1 rounded-lg flex gap-1 max-w-fit border border-gray-200">
                {navItems.map((item) => (
                    <button
                        key={item.key}
                        onClick={() => navigate(item.path)}
                        className={`py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 
                            ${item.key === "delta" ? "bg-white text-blue-600 shadow-sm" : "text-gray-600 hover:text-gray-900"}`}
                    >
                        {item.label}
                    </button>
                ))}
            </nav>

            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">{t("model.title", "Telemetry Filter")} - Delta</h1>
                <p className="text-sm text-gray-500 mt-1">{t("model.subtitle", "Track absolute value changes traversing time spans.")}</p>
            </div>

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

            <div className="bg-white border border-gray-200 shadow-sm rounded-xl p-6">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-4">
                    {t("model.interval", "Data Interval")}
                </p>
                <select
                    value={selectedIntervalIndex}
                    onChange={(e) => setSelectedIntervalIndex(Number(e.target.value))}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 cursor-pointer"
                >
                    {INTERVAL_OPTIONS.map((opt, idx) => (
                        <option key={idx} value={idx}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

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
                            const display = live ?? initial ?? null;

                            return (
                                <div key={tag} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                                    <div className="min-w-0 flex-1 mr-4">
                                        <p className="text-xs font-mono text-gray-700 truncate">{tag}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className={`text-lg font-semibold ${live ? "text-green-600" : "text-gray-900"}`}>
                                            {display ? String(display.value) : "—"}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            <Button
                onClick={fetchChartData}
                disabled={!isReady || loading}
                className="w-full py-2.5 shadow-sm text-base"
                isLoading={loading}
            >
                {loading ? t("model.fetching", "Fetching...") : t("model.fetchData", "Fetch Delta Data")}
            </Button>

            {chartData && (
                <DataVisualizer data={chartData} loading={loading} />
            )}
        </div>
    );
};

export default Delta;
