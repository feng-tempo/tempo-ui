
import { useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "../../platform/CommentIcons";
import NavBtn from "../../actions/NavBtn";
import { resolveErrorPresentation, type ErrorContext } from "./errorPresentation";

export type ErrorPanelProps = {
  context?: ErrorContext;
  message?: string;
  error?: unknown;
  details?: string;
  requestId?: string;
  onRetry?: () => void;
  retryLabel?: string;
  retryDisabled?: boolean;
  onBack?: () => void;
  backLabel?: string;
  actionsVertical?: boolean;
  compact?: boolean;
  centerInPage?: boolean;
  presentation?: "inline" | "workspace" | "pane";
};

export default function ErrorPanel(props: ErrorPanelProps) {
  const presentation = resolveErrorPresentation(props.error, props.context);
  const details = props.details ?? presentation.details;
  return <ErrorPanelContent key={`${presentation.title}\n${details}\n${props.requestId ?? ""}`} {...props}
    title={presentation.title} message={props.message ?? presentation.message} details={details}
    onRetry={presentation.retryable ? props.onRetry : undefined} />;
}

function ErrorPanelContent({ title, message, details, requestId, onRetry, retryLabel = "Try again", retryDisabled, onBack, backLabel = "Go back", actionsVertical, compact, centerInPage, presentation }: ErrorPanelProps & { title: string }) {
  const [expanded, setExpanded] = useState(false);
  const expandedDetails = expanded ? <View style={styles.details}>
    {requestId ? <Text selectable style={styles.detailText}>Reference: {requestId}</Text> : null}
    {details ? <Text selectable style={styles.detailText}>{details}</Text> : null}
  </View> : null;
  return <View style={[styles.container, compact && styles.compact, presentation === "workspace" && styles.workspace, presentation === "pane" && styles.pane, centerInPage && styles.centerInPage]} accessibilityLiveRegion="polite">
    
    <View style={[styles.heading, presentation === "pane" && styles.paneHeading]}>
      {presentation !== "workspace" ? <MaterialIcons name="error-outline" size={22} color="#a05245" /> : null}
      <Text style={styles.title}>{title}</Text>
    </View>
    <Text style={[styles.message, presentation !== "inline" && presentation != null && styles.centeredText]}>{message}</Text>
    {onRetry || onBack || details || requestId ? <View style={[styles.actions, presentation === "pane" && styles.paneActions, actionsVertical && styles.verticalActions]}>
      {onRetry ? <NavBtn theme="secondary" cusStyle={actionStyles} disabled={retryDisabled} onPress={onRetry}>
        <MaterialIcons name="refresh" size={16} color="#0061a3" /><Text style={styles.actionLabel}>{retryLabel}</Text>
      </NavBtn> : null}
      {details || requestId ? <NavBtn theme="secondary" cusStyle={actionStyles} onPress={() => setExpanded(value => !value)}>
        <MaterialIcons name={expanded ? "expand-less" : "expand-more"} size={16} color="#0061a3" /><Text style={styles.actionLabel}>{expanded ? "Hide details" : "Show details"}</Text>
      </NavBtn> : null}
      {onBack ? <NavBtn theme="secondary" cusStyle={actionStyles} onPress={onBack}>
        <MaterialIcons name="arrow-back" size={16} color="#0061a3" /><Text style={styles.actionLabel}>{backLabel}</Text>
      </NavBtn> : null}
    </View> : null}
    {centerInPage && expandedDetails ? <View style={styles.anchoredDetails}>{expandedDetails}</View> : expandedDetails}
  </View>;
}

const actionStyles = {
  btnCtn: { height: 32, flexGrow: 0, flexShrink: 0, alignSelf: "flex-start" as const },
  btn: { height: 32, width: "auto" as const, paddingHorizontal: 8, gap: 6 },
};
const styles = StyleSheet.create({
  container: { position: "relative", width: "100%", minWidth: 0, gap: 10, padding: 16, alignItems: "flex-start" },
  compact: { padding: 0 },
  pane: { alignItems: "center", padding: 16 },
  paneHeading: { flexDirection: "column", alignItems: "center" },
  paneActions: { justifyContent: "center", width: "100%" },
  workspace: { alignItems: "center", paddingTop: 36 },
  centerInPage: { paddingTop: 16 },
  centeredText: { textAlign: "center" },
  heading: { flexDirection: "row", alignItems: "center", gap: 8, maxWidth: "100%" },
  title: { fontSize: 14, fontWeight: "600", color: "#323130", flexShrink: 1 },
  message: { fontSize: 13, lineHeight: 20, color: "#605e5c", maxWidth: 620 },
  actions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 8 },
  verticalActions: { flexDirection: "column", alignItems: "flex-start", gap: 18 },
  actionLabel: { fontSize: 13, color: "#0061a3", ...Platform.select({ web: { whiteSpace: "nowrap" } as any }) },
  anchoredDetails: { position: "absolute", top: "100%", left: 0, right: 0, marginTop: 12, alignItems: "center" },
  details: { width: "100%", maxWidth: 620, minWidth: 0, gap: 6, padding: 12, backgroundColor: "#f5f5f5" },
  detailText: { fontSize: 12, lineHeight: 18, color: "#605e5c", minWidth: 0, maxWidth: "100%", overflowWrap: "anywhere" } as any,
});
