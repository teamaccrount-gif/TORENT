import { useState, useEffect, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchTags, type TableRow, type ChartDataResponse, type LatestEntry } from "../ModelsLogic/RawDataModel";
import {
    fetchAggregatedData,
    INTERVAL_OPTIONS,
    toSeconds,
    type ChartDataResponse as AggChartDataResponse,
} from "../ModelsLogic/AggregatedDataModel";
import { fetchDeltaData } from "../ModelsLogic/DeltaDataModel";
import { useAppDispatch, useAppSelector } from "../Redux/Store";
import { fetchRawData } from "../Redux/Slices/rawDataSlice";
import { fetchLatestValues } from "../Redux/Slices/latestSlice";
import { useTelemetryWatcher } from "../hooks/useTelemetryWatcher";

type ModelMode = "raw" | "aggregated" | "delta";

const Model = () => {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();

    const currentMode: ModelMode = location.pathname === "/aggregated" ? "aggregated" : location.pathname === "/delta" ? "delta" : "raw";

    const dispatch = useAppDispatch();

    // Raw data from Redux
    const rawChartData = useAppSelector((state) => state.rawDataSlice.data.fetchRawData) as ChartDataResponse | null;
    const rawLoading = useAppSelector((state) => state.rawDataSlice.loading.fetchRawData) === "pending";

    const [tableData, setTableData] = useState<TableRow[]>([]);
    const [tagsLoading, setTagsLoading] = useState<boolean>(false);
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [startTime, setStartTime] = useState<string>("");
    const [endTime, setEndTime] = useState<string>("");
    const [chartData, setChartData] = useState<ChartDataResponse | AggChartDataResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedIntervalIndex, setSelectedIntervalIndex] = useState<number>(0);

    // Latest values from Redux
    const latestValues = useAppSelector(
        (state) => state.latestSlice.data.fetchLatestValues
    ) as LatestEntry[] | null;

    console.log("latestValues: ", latestValues);



    // Build selectedRows — needs both tag string and id
    // tableData already has both since /tag endpoint returns them
    const selectedRows = useMemo(() => {
        return tableData
            .filter((row) => selectedTags.includes(row.tag))
            .map((row) => ({ tag: row.tag, id: row.id }));
    }, [tableData, selectedTags]);

    // Socket hook — handles subscribe/unsubscribe automatically
    const { liveValues, connected } = useTelemetryWatcher(selectedRows);

    const isReady =
        selectedTags.length > 0 &&
        startTime &&
        endTime &&
        (currentMode === "raw" || selectedIntervalIndex >= 0);

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

    // Clear chart data when switching modes
    useEffect(() => {
        setChartData(null);
    }, [currentMode]);

    // Fetch latest values whenever selected tags change
    useEffect(() => {
        if (selectedTags.length === 0) return;

        // The endpoint expects a list of ids, not string tags
        const telemetryIds = selectedRows.map((r: { tag: string; id: number }) => r.id);
        
        console.log("[MODEL] sending tags to /latest:", selectedTags);

        // I am passing it inside { tags: [...] } but if your backend literally expects the payload as the raw array `[...]`,
        // or specifically `{ id: [...] }`, you can adjust the key below!
        console.log("[MODEL] selectedRows:", selectedRows);
        console.log("[MODEL] ids being sent to /latest:", telemetryIds);
        console.log("[MODEL] payload being dispatched:", { tags: telemetryIds });

        dispatch(fetchLatestValues({ tags: selectedTags  }));
    }, [selectedTags, dispatch, selectedRows]);

    // Debug logging for UI state
    useEffect(() => {
        console.log(`[DEBUG] UI State: currentMode=${currentMode}, isReady=${isReady}, selectedTags=${selectedTags.length}, startTime=${!!startTime}, endTime=${!!endTime}`);
    }, [currentMode, isReady, selectedTags, startTime, endTime]);

    const fetchChartData = async (): Promise<void> => {
        console.log(`[DEBUG] Attempting fetchChartData. currentMode: ${currentMode}, isReady: ${isReady}`);
        if (selectedTags.length === 0 || !startTime || !endTime) {
            console.warn("At least one tag, start time, and end time are all required.");
            return;
        }
        try {
            // Raw mode: loading is managed by Redux, not local state
            if (currentMode !== "raw") setLoading(true);
            console.log(`[DEBUG] Starting fetch for mode: ${currentMode}`);

            if (currentMode === "raw") {
                dispatch(fetchRawData({
                    method: "POST",
                    payload: {
                        tags: selectedTags,
                        start: new Date(startTime).toISOString(),
                        end: new Date(endTime).toISOString(),
                    }
                }));
            } else if (currentMode === "aggregated") {
                const selected = INTERVAL_OPTIONS[selectedIntervalIndex];
                const data = await fetchAggregatedData({
                    tags: selectedTags,
                    startTime,
                    endTime,
                    intervalValue: selected.value,
                    intervalUnit: selected.unit,
                });
                setChartData(data);
                console.log("Aggregated data received:", data);
            } else if (currentMode === "delta") {
                const selected = INTERVAL_OPTIONS[selectedIntervalIndex];
                const data = await fetchDeltaData({
                    tags: selectedTags,
                    startTime,
                    endTime,
                    intervalValue: selected.value,
                    intervalUnit: selected.unit,
                });
                setChartData(data);
                console.log("Delta data received:", data);
            }
        } catch (error) {
            console.error("Failed to fetch chart data:", error);
        } finally {
            if (currentMode !== "raw") setLoading(false);
        }
    };

    const handleTagSelect = (tag: string): void => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
        );
    };

    const navItems: { key: ModelMode; label: string; path: string }[] = [
        { key: "raw", label: t("nav.rawData"), path: "/raw" },
        { key: "aggregated", label: t("nav.aggregatedData"), path: "/aggregated" },
        { key: "delta", label: t("nav.deltaData"), path: "/delta" },
    ];

    return (
        <div className="min-h-screen bg-gray-950 text-white p-8">
            <div className="max-w-4xl mx-auto space-y-6">

                {/* Navbar */}
                <nav className="bg-gray-900 border border-gray-800 rounded-xl p-1.5 flex gap-1">
                    {navItems.map((item) => (
                        <button
                            key={item.key}
                            onClick={() => navigate(item.path)}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer
                                ${currentMode === item.key
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                                }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </nav>

                {/* <button onClick={() => navigate("/page1")}>page1</button> */}

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-2xl font-semibold text-white tracking-tight">{t("model.title")}</h1>
                    <p className="text-sm text-gray-400 mt-1">{t("model.subtitle")}</p>
                </div>

                {/* Tag Selection */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
                        {t("model.availableTags")}{tagsLoading ? " ⏳" : ""}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        {tableData.length === 0 ? (  
                            <p className="text-sm text-gray-600 italic">{t("model.noTags")}</p>
                        ) : (
                            tableData.map((row: TableRow) => (
                                <button
                                    key={row.tag}
                                    onClick={() => handleTagSelect(row.tag)}
                                    className={`text-xs px-3 py-1.5 rounded-full border transition-all duration-150 font-mono
                    ${selectedTags.includes(row.tag)
                                            ? "bg-blue-600 border-blue-500 text-white"
                                            : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white"
                                        }`}
                                >
                                    {row.tag}
                                </button>
                            ))
                        )}
                    </div>

                    {/* Selected tags display */}
                    {selectedTags.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-800">
                            <p className="text-xs text-gray-500">{t("model.selected")} ({selectedTags.length})</p>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                                {selectedTags.map((tag) => (
                                    <span key={tag} className="text-xs font-mono text-blue-400 bg-blue-950 border border-blue-800 px-2 py-0.5 rounded-full">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Interval Selection - For Aggregated and Delta Data */}
                {(currentMode === "aggregated" || currentMode === "delta") && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">
                            {t("model.interval")}
                        </p>
                        <select
                            value={selectedIntervalIndex}
                            onChange={(e) => setSelectedIntervalIndex(Number(e.target.value))}
                            className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5
                               focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                               hover:border-gray-500 transition-colors
                               [color-scheme:dark] cursor-pointer"
                        >
                            {INTERVAL_OPTIONS.map((opt, idx) => (
                                <option key={idx} value={idx}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {/* Time Range */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-4">
                        {t("model.timeRange")}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400">{t("model.startTime")}</label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           hover:border-gray-500 transition-colors
                           [color-scheme:dark]"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-400">{t("model.endTime")}</label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 text-white text-sm rounded-lg px-3 py-2.5
                           focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                           hover:border-gray-500 transition-colors
                           [color-scheme:dark]"
                            />
                        </div>
                    </div>
                </div>

                {/* ISO Preview */}
                {(startTime || endTime) && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
                            {t("model.isoPreview")}
                        </p>
                        <div className="space-y-2">
                            {[
                                { label: "startTime", value: startTime ? new Date(startTime).toISOString() : "—" },
                                { label: "endTime", value: endTime ? new Date(endTime).toISOString() : "—" },
                                ...(currentMode === "aggregated" || currentMode === "delta"
                                    ? [{ label: "interval (seconds)", value: String(toSeconds(INTERVAL_OPTIONS[selectedIntervalIndex].value, INTERVAL_OPTIONS[selectedIntervalIndex].unit)) }]
                                    : []),
                            ].map(({ label, value }) => (
                                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                                    <span className="text-xs text-gray-500">{label}</span>
                                    <span className="text-xs font-mono text-green-400">{value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Live Tag Values Card */}
                {selectedTags.length > 0 && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">

                        {/* Header with connection indicator */}
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                                Live Values
                            </p>
                            <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full transition-colors ${connected ? "bg-green-500 animate-pulse" : "bg-red-500"
                                    }`} />
                                <span className="text-xs text-gray-500">
                                    {connected ? "Live" : "Connecting..."}
                                </span>
                            </div>
                        </div>

                        {/* One row per selected tag */}
                        <div className="space-y-2">
                            {selectedRows.map(({ tag }: { tag: string }) => {
                                const live = liveValues[tag];                              // from socket
                                const initial = latestValues?.find((l) => l.tag === tag); // from /latest API
                                const display = live ?? initial ?? null;                   // socket takes priority

                                return (
                                    <div
                                        key={tag}
                                        className="flex items-center justify-between bg-gray-800 border border-gray-700 rounded-lg px-4 py-3"
                                    >
                                        {/* Left — tag name + quality */}
                                        <div className="min-w-0 flex-1 mr-4">
                                            <p className="text-xs font-mono text-gray-400 truncate">{tag}</p>
                                            {display?.quality !== undefined && (
                                                <p className={`text-xs mt-0.5 ${display.quality === 1 ? "text-green-600" : "text-yellow-600"
                                                    }`}>
                                                    {display.quality === 1 ? "Good" : "Bad quality"}
                                                </p>
                                            )}
                                        </div>

                                        {/* Right — value + timestamp */}
                                        <div className="text-right shrink-0">
                                            <p className={`text-lg font-semibold transition-all ${live ? "text-green-400" : "text-gray-300"
                                                }`}>
                                                {display ? String(display.value) : "—"}
                                            </p>
                                            {display?.timestamp && (
                                                <p className="text-xs text-gray-600 mt-0.5">
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
                <button
                    onClick={fetchChartData}
                    disabled={!isReady || (currentMode === "raw" ? rawLoading : loading)}
                    className={`w-full py-3 rounded-xl text-sm font-medium transition-all duration-150
            ${isReady && !(currentMode === "raw" ? rawLoading : loading)
                            ? "bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white cursor-pointer"
                            : "bg-gray-800 text-gray-600 cursor-not-allowed"
                        }`}
                >
                    {(currentMode === "raw" ? rawLoading : loading) ? t("model.fetching") : t("model.fetchData")}
                </button>

                {/* Chart Data Result */}
                {(currentMode === "raw" ? rawChartData : chartData) && (
                    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest mb-3">
                            {t("model.response")}
                        </p>
                        <pre className="text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre-wrap break-all">
                            {JSON.stringify(currentMode === "raw" ? rawChartData : chartData, null, 2)}
                        </pre>
                    </div>
                )}

            </div>
        </div>
    );
};

export default Model;