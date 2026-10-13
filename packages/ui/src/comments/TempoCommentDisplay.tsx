import type { TempoCommentView } from "./types";
import { Platform, StyleSheet, Text, View } from "react-native";

import { formatTempoCommentDate } from "./tempoCommentDate";

export default function TempoCommentDisplay({
  comment,
  contentRightPadding = 0,
}: {
  comment: TempoCommentView;
  contentRightPadding?: number;
}) {
  return (
    <View style={styles.comment}>
      <Text
        selectable
        style={[
          styles.commentText,
          contentRightPadding > 0 ? { paddingRight: contentRightPadding } : null,
        ]}
      >
        {comment.content}
      </Text>
      <View style={styles.metadataRow}>
        <Text selectable style={styles.metadataText}>
          {comment.updatedAt ? "Edited \u00b7 " : ""}
          {comment.createdBy.displayName} {"\u00b7"}{" "}
          {formatTempoCommentDate(comment.createdAt)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  comment: {
    width: "100%",
  },
  commentText: {
    color: "#34312a",
    fontSize: 13,
    lineHeight: 19,
    ...(Platform.select({
      web: { cursor: "text", userSelect: "text" } as any,
    }) as any),
  },
  metadataRow: {
    width: "100%",
    marginTop: 3,
    flexDirection: "row",
    justifyContent: "flex-end",
  },
  metadataText: {
    flexShrink: 1,
    color: "#65758b",
    fontSize: 10,
    lineHeight: 14,
    textAlign: "right",
    ...(Platform.select({
      web: { cursor: "text", userSelect: "text" } as any,
    }) as any),
  },
});
