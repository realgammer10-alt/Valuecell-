import { Activity, CheckCircle2, CircleX, RefreshCw } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "react-i18next";
import { useBackendHealth } from "@/api/system";
// import { useSignOut } from "@/api/system";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTauriInfo } from "@/hooks/use-tauri-info";
import { useUpdateToast } from "@/hooks/use-update-toast";
import type { LanguageCode, StockColorMode } from "@/store/settings-store";
import {
  useLanguage,
  useSettingsActions,
  useStockColorMode,
} from "@/store/settings-store";
// import { useIsLoggedIn, useSystemInfo } from "@/store/system-store";

export default function GeneralPage() {
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const stockColorMode = useStockColorMode();
  const language = useLanguage();
  const { setStockColorMode, setLanguage } = useSettingsActions();
  const { checkAndUpdate } = useUpdateToast();
  const { isTauriApp, appVersion } = useTauriInfo();
  const {
    data: healthResponse,
    isError: isHealthError,
    isFetching: isHealthFetching,
    isLoading: isHealthLoading,
    refetch: refreshHealth,
  } = useBackendHealth();
  const health = healthResponse?.data;
  const apiHealthy = Boolean(health) && !isHealthError;
  const databaseHealthy =
    health?.checks.database === "healthy" && !isHealthError;
  const apiLabel = isHealthError
    ? t("general.monitoring.unavailable")
    : isHealthLoading
      ? t("general.monitoring.checking")
      : t("general.monitoring.healthy");
  const databaseLabel = health
    ? databaseHealthy
      ? t("general.monitoring.healthy")
      : t("general.monitoring.degraded")
    : isHealthError
      ? t("general.monitoring.unavailable")
      : t("general.monitoring.checking");
  const overallLabel =
    isHealthError || health?.status === "degraded"
      ? t("general.monitoring.degraded")
      : health
        ? t("general.monitoring.healthy")
        : t("general.monitoring.checking");
  // const { email, id } = useSystemInfo();
  // const isLoggedIn = useIsLoggedIn();

  // const { mutate: signOut } = useSignOut();
  return (
    <div className="flex flex-1 flex-col gap-4 p-10">
      <div className="flex flex-col gap-1.5">
        <h1 className="font-bold text-xl">{t("general.title")}</h1>
        <p className="font-normal text-muted-foreground text-sm">
          {t("general.description")}
        </p>
      </div>

      <FieldGroup className="gap-6">
        {/* Account section - commented out for now
        {isTauriApp && (
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle className="font-medium text-base">
                {t("general.account.title")}
              </FieldTitle>
              <FieldDescription>
                {isLoggedIn ? email : t("general.account.signInDesc")}
              </FieldDescription>
            </FieldContent>
            {isLoggedIn ? (
              <Button
                variant="outline"
                onClick={() => signOut()}
                {...withTrack("logout", { user_id: id })}
              >
                {t("general.account.signOut")}
              </Button>
            ) : (
              <LoginModal>
                <Button>{t("general.account.signIn")}</Button>
              </LoginModal>
            )}
          </Field>
        )}
        */}

        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle className="font-medium text-base">
              {t("general.language.title")}
            </FieldTitle>
            <FieldDescription>
              {t("general.language.description")}
            </FieldDescription>
          </FieldContent>
          <Select
            value={language}
            onValueChange={(value) => setLanguage(value as LanguageCode)}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">
                {t("general.language.options.en")}
              </SelectItem>
              <SelectItem value="zh_CN">
                {t("general.language.options.zh_CN")}
              </SelectItem>
              <SelectItem value="zh_TW">
                {t("general.language.options.zh_TW")}
              </SelectItem>
              <SelectItem value="ja">
                {t("general.language.options.ja")}
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle className="font-medium text-base">
              {t("general.theme.title")}
            </FieldTitle>
            <FieldDescription>
              {t("general.theme.description")}
            </FieldDescription>
          </FieldContent>
          <Select
            value={theme ?? "system"}
            onValueChange={(value) => setTheme(value)}
          >
            <SelectTrigger className="w-[280px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="system">
                {t("general.theme.options.system")}
              </SelectItem>
              <SelectItem value="light">
                {t("general.theme.options.light")}
              </SelectItem>
              <SelectItem value="dark">
                {t("general.theme.options.dark")}
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field orientation="horizontal">
          <FieldContent>
            <FieldTitle className="font-medium text-base">
              {t("general.quotesColor.title")}
            </FieldTitle>
            <FieldDescription>
              {t("general.quotesColor.description")}
            </FieldDescription>
          </FieldContent>
          <RadioGroup
            className="flex gap-3"
            value={stockColorMode}
            onValueChange={(value) =>
              setStockColorMode(value as StockColorMode)
            }
          >
            <FieldLabel
              className="flex cursor-pointer items-center space-x-3 text-nowrap rounded-lg border border-border p-3"
              htmlFor="green-up"
            >
              <RadioGroupItem value="GREEN_UP_RED_DOWN" id="green-up" />
              {t("general.quotesColor.greenUpRedDown")}
            </FieldLabel>
            <FieldLabel
              className="flex cursor-pointer items-center space-x-3 text-nowrap rounded-lg border border-border p-3"
              htmlFor="red-up"
            >
              <RadioGroupItem value="RED_UP_GREEN_DOWN" id="red-up" />
              {t("general.quotesColor.redUpGreenDown")}
            </FieldLabel>
          </RadioGroup>
        </Field>

        {isTauriApp && (
          <Field orientation="responsive">
            <FieldTitle className="flex items-center gap-2 font-medium text-base">
              {t("general.updates.title")}
              {appVersion && <Badge variant="secondary">v{appVersion}</Badge>}
            </FieldTitle>
            <Button variant="outline" onClick={checkAndUpdate}>
              {t("general.updates.check")}
            </Button>
          </Field>
        )}
      </FieldGroup>

      <section
        aria-labelledby="service-health-title"
        className="max-w-2xl rounded-lg border border-border p-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <h2
              id="service-health-title"
              className="flex items-center gap-2 font-semibold text-base"
            >
              <Activity className="size-4" />
              {t("general.monitoring.title")}
            </h2>
            <p className="text-muted-foreground text-sm">
              {t("general.monitoring.description")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => void refreshHealth()}
            disabled={isHealthFetching}
            aria-label={t("general.monitoring.refresh")}
          >
            <RefreshCw
              className={isHealthFetching ? "size-4 animate-spin" : "size-4"}
            />
            {t("general.monitoring.refresh")}
          </Button>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-muted-foreground text-sm">
              {t("general.monitoring.api")}
            </p>
            <output
              className={`mt-1 flex items-center gap-2 font-medium ${isHealthError ? "text-destructive" : "text-emerald-600"}`}
            >
              {isHealthLoading ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : apiHealthy ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <CircleX className="size-4" />
              )}
              {apiLabel}
            </output>
          </div>
          <div className="rounded-md bg-muted/50 p-3">
            <p className="text-muted-foreground text-sm">
              {t("general.monitoring.database")}
            </p>
            <output
              className={`mt-1 flex items-center gap-2 font-medium ${databaseHealthy ? "text-emerald-600" : "text-destructive"}`}
            >
              {isHealthLoading ? (
                <RefreshCw className="size-4 animate-spin" />
              ) : databaseHealthy ? (
                <CheckCircle2 className="size-4" />
              ) : (
                <CircleX className="size-4" />
              )}
              {databaseLabel}
            </output>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-muted-foreground text-xs">
          <span>
            {t("general.monitoring.overall")}: {overallLabel}
          </span>
          {healthResponse && (
            <span>
              {t("general.monitoring.responseTime", {
                milliseconds: healthResponse.latencyMs,
              })}
            </span>
          )}
          {health?.timestamp && (
            <span>
              {t("general.monitoring.lastChecked")}:{" "}
              {new Date(health.timestamp).toLocaleTimeString()}
            </span>
          )}
        </div>
      </section>
    </div>
  );
}
