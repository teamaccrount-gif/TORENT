import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { fetchTags, type TableRow, type LatestEntry } from "../../ModelsLogic/RawDataModel";
import { useAppDispatch, useAppSelector } from "../../Redux/Store";
import { fetchRawData } from "../../Redux/Slices/rawDataSlice";
import { fetchLatestValues } from "../../Redux/Slices/latestSlice";
import { useTelemetryWatcher } from "../../hooks/useTelemetryWatcher";
import { HistoryLayout } from "../../components/data/HistoryLayout";
import { TelemetryFilterProvider } from "../../context/TelemetryFilterContext";

const Raw: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    const rawResponse = useAppSelector((state) => state.rawDataSlice.data.fetchRawData) as any;
    const rawLoading = useAppSelector((state) => state.rawDataSlice.loading.fetchRawData) === "pending";

    const [tableData, setTableData] = useState<TableRow[]>([]);
    const [tagsLoading, setTagsLoading] = useState<boolean>(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
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
                console.log("[HISTORY][RAW] Loaded tags:", tags);
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
        if (selectedTags.length === 0 || !startTime || !endTime) return;
        setErrorMessage(null);
        console.log("[HISTORY][RAW] Starting fetch with state:", {
            selectedTags,
            startTime,
            endTime,
        });

        const resultAction = await dispatch(fetchRawData({
            method: "POST",
            payload: {
                tags: selectedTags,
                start: new Date(startTime).toISOString(),
                end: new Date(endTime).toISOString(),
            }
        }));

        if (fetchRawData.fulfilled.match(resultAction)) {
            const payload = resultAction.payload as Record<string, unknown> | undefined;
            console.log("[HISTORY][RAW] Redux payload stored for chart:", payload);
        } else {
            console.error("[HISTORY][RAW] Fetch failed:", resultAction.payload);
            setErrorMessage("Raw history request failed. Check the console for backend response details.");
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
                loading: rawLoading,
                chartData: rawResponse,
                errorMessage,
            }}
        >
            <HistoryLayout
                activeTab="raw"
                title={`${t("model.title", "Telemetry Filter")} - Raw`}
                subtitle={t("model.subtitle", "Extrapolate native granular data clusters without transformation.")}
                fetchButtonLabel={t("model.fetchData", "Fetch Raw Data")}
            />
        </TelemetryFilterProvider>
    );
};

export default Raw;
