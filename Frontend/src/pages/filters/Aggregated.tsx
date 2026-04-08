import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { fetchTags, type TableRow, type LatestEntry } from "../../ModelsLogic/RawDataModel";
import { fetchAggregatedData, INTERVAL_OPTIONS } from "../../ModelsLogic/AggregatedDataModel";
import { useAppDispatch, useAppSelector } from "../../Redux/Store";
import { fetchLatestValues } from "../../Redux/Slices/latestSlice";
import { useTelemetryWatcher } from "../../hooks/useTelemetryWatcher";
import { HistoryLayout } from "../../components/data/HistoryLayout";
import { TelemetryFilterProvider } from "../../context/TelemetryFilterContext";

const Aggregated: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const [tableData, setTableData] = useState<TableRow[]>([]);
    const [tagsLoading, setTagsLoading] = useState<boolean>(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [chartData, setChartData] = useState<any | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedIntervalIndex, setSelectedIntervalIndex] = useState<number>(0);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const latestValues = useAppSelector((state) => state.latestSlice.data.fetchLatestValues) as LatestEntry[] | null;

    const selectedRows = useMemo(() => {
        return tableData.filter((row) => selectedTags.includes(row.tag)).map((row) => ({ tag: row.tag, id: row.id }));
    }, [tableData, selectedTags]);

    const { liveValues, connected } = useTelemetryWatcher(selectedRows);

    useEffect(() => {
        const loadTags = async () => {
            try {
                setTagsLoading(true);
                const tags = await fetchTags();
                console.log("[HISTORY][AGGREGATED] Loaded tags:", tags);
                setTableData(tags);
            } catch (error) {
                console.error("Failed to fetch table data:", error);
                setErrorMessage("Failed to load tags for history view.");
            } finally {
                setTagsLoading(false);
            }
        };
        loadTags();
    }, []);

    useEffect(() => {
        if (selectedTags.length === 0) return;
        dispatch(fetchLatestValues({ tags: selectedTags }));
    }, [selectedTags, dispatch]);

    const fetchChartData = async (): Promise<void> => {
        if (selectedTags.length === 0 || !startTime || !endTime || selectedIntervalIndex < 0) return;
        try {
            setErrorMessage(null);
            setLoading(true);
            const selected = INTERVAL_OPTIONS[selectedIntervalIndex];
            console.log("[HISTORY][AGGREGATED] Starting fetch with state:", {
                selectedTags,
                startTime,
                endTime,
                interval: selected,
            });
            const data = await fetchAggregatedData({
                tags: selectedTags,
                startTime,
                endTime,
                intervalValue: selected.value,
                intervalUnit: selected.unit,
            });
            console.log("[HISTORY][AGGREGATED] Chart data assigned:", data);
            setChartData(data);
        } catch (error) {
            console.error("Failed to fetch chart data:", error);
            setErrorMessage("Aggregated history request failed. Check the console for backend response details.");
        } finally {
            setLoading(false);
        }
    };

    const handleTagSelect = (tag: string): void => {
        setSelectedTags((prev) => prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]);
    };

    return (
        <TelemetryFilterProvider
            value={{
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
                onFetch: fetchChartData,
                loading,
                chartData,
                errorMessage,
            }}
        >
            <HistoryLayout
                activeTab="aggregated"
                title={`${t("model.title", "Telemetry Filter")} - Aggregated`}
                subtitle={t("model.subtitle", "Consolidate telemetry streams through interval grouping.")}
                fetchButtonLabel={t("model.fetchData", "Fetch Aggregated Data")}
            >
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
            </HistoryLayout>
        </TelemetryFilterProvider>
    );
};

export default Aggregated;
