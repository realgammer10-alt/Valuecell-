import { AnimatePresence, motion } from "framer-motion";
import {
  CircleAlert,
  CircleCheck,
  LoaderCircle,
  RefreshCw,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useBackendHealth } from "@/api/system";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function BackendHealthCheck({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const { data, isError, isFetching, isPending, isSuccess, refetch } =
    useBackendHealth();
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isError) {
      timer = setTimeout(() => setShowError(true), 500);
    } else {
      setShowError(false);
    }
    return () => clearTimeout(timer);
  }, [isError]);

  const isUnavailable = isError;
  const isDegraded = !isUnavailable && data?.data.status === "degraded";
  const statusLabel = isUnavailable
    ? t("common.monitoring.unavailable")
    : isDegraded
      ? t("common.monitoring.degraded")
      : data
        ? t("common.monitoring.healthy")
        : t("common.monitoring.checking");
  const StatusIcon =
    isUnavailable || isDegraded
      ? CircleAlert
      : isPending || isFetching
        ? LoaderCircle
        : CircleCheck;
  const statusColor =
    isUnavailable || isDegraded
      ? "text-destructive"
      : isPending || isFetching
        ? "text-muted-foreground"
        : "text-emerald-600 dark:text-emerald-400";
  const checks = data?.data.checks ?? {};
  const checkRows = [
    {
      key: "api",
      label: t("common.monitoring.api"),
      value: isUnavailable ? "unhealthy" : (checks.api ?? "unknown"),
    },
    {
      key: "database",
      label: t("common.monitoring.database"),
      value: isUnavailable ? "unknown" : (checks.database ?? "unknown"),
    },
  ];

  return (
    <>
      {isSuccess && !showError && (
        <>
          {children}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="fixed right-3 bottom-3 z-40 max-w-[calc(100vw-1.5rem)] bg-background/95 shadow-md"
                aria-label={`${t("common.monitoring.serviceStatus")}: ${statusLabel}`}
                aria-live="polite"
              >
                <StatusIcon
                  className={`size-4 ${statusColor} ${isFetching ? "animate-spin" : ""}`}
                />
                <span className="truncate">{statusLabel}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              side="top"
              className="w-72 max-w-[calc(100vw-1.5rem)] space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className="font-semibold text-sm">
                  {t("common.monitoring.serviceStatus")}
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  onClick={() => void refetch()}
                  disabled={isFetching}
                  aria-label={t("common.retry")}
                  title={t("common.retry")}
                >
                  <RefreshCw
                    className={`size-4 ${isFetching ? "animate-spin" : ""}`}
                  />
                </Button>
              </div>
              {isUnavailable && (
                <p className="text-muted-foreground text-xs">
                  {t("common.backendRetryHint")}
                </p>
              )}
              <div className="space-y-2" aria-live="polite">
                {checkRows.map((check) => {
                  const healthy = check.value === "healthy";
                  const unknown = check.value === "unknown";
                  const CheckIcon = healthy
                    ? CircleCheck
                    : unknown
                      ? LoaderCircle
                      : CircleAlert;
                  const checkLabel = healthy
                    ? t("common.monitoring.healthy")
                    : unknown
                      ? t("common.monitoring.unknown")
                      : t("common.monitoring.unavailable");

                  return (
                    <div
                      key={check.key}
                      className="flex items-center justify-between gap-3 text-sm"
                    >
                      <span>{check.label}</span>
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <CheckIcon
                          className={`size-3.5 ${healthy ? "text-emerald-600 dark:text-emerald-400" : check.value === "unhealthy" ? "text-destructive" : ""}`}
                        />
                        {checkLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t pt-2 text-muted-foreground text-xs">
                {data?.data.timestamp && (
                  <p className="flex gap-1">
                    <span>{t("common.monitoring.lastChecked")}:</span>
                    <time dateTime={data.data.timestamp}>
                      {new Date(data.data.timestamp).toLocaleTimeString()}
                    </time>
                  </p>
                )}
                {data?.latencyMs !== undefined && (
                  <p>
                    {t("common.monitoring.latency")}: {data.latencyMs} ms
                  </p>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </>
      )}
      <AnimatePresence>
        {!isSuccess && (
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0.6 }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            className="fixed inset-0 z-9999 flex flex-col items-center justify-center gap-6 bg-background/95 p-4 text-center"
            role="alert"
          >
            {showError ? (
              <CircleAlert className="size-10 text-destructive" />
            ) : (
              <LoaderCircle className="size-10 animate-spin text-muted-foreground" />
            )}
            <div className="space-y-2">
              <h1 className="font-semibold text-xl">
                {showError
                  ? t("common.backendUnavailable")
                  : t("common.settingUpEnvironment")}
              </h1>
              {showError && (
                <p className="text-muted-foreground">
                  {t("common.backendRetryHint")}
                </p>
              )}
            </div>
            {showError && (
              <Button
                onClick={() => void refetch()}
                disabled={isFetching}
                variant="outline"
              >
                {isFetching ? t("common.loading") : t("common.retry")}
              </Button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
