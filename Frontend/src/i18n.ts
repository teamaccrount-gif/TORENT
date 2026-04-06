import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      nav: {
        rawData: "Raw Data",
        aggregatedData: "Aggregated Data",
        deltaData: "Delta Data",
      },
      model: {
        title: "Model",
        subtitle: "Select a tag and time range to fetch data",
        availableTags: "Available Tags",
        noTags: "No tags loaded yet...",
        selected: "Selected",
        timeRange: "Time Range",
        startTime: "Start Time",
        endTime: "End Time",
        isoPreview: "ISO Preview · what gets sent to backend",
        interval: "Interval",
        selectInterval: "Select an interval",
        fetchData: "Fetch Data",
        fetching: "Fetching...",
        response: "Response",
      },
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
