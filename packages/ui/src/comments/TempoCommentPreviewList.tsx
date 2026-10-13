import type { TempoCommentView } from "./types";
import { StyleSheet, View } from "react-native";

import LinkText from "./CommentMoreAction";
import TempoCommentDisplay from "./TempoCommentDisplay";

export default function TempoCommentPreviewList({
  comments,
  maxItems = 5,
  onMore,
}: {
  comments: readonly TempoCommentView[];
  maxItems?: number;
  onMore?: () => void;
}) {
  const orderedComments = [...comments].sort((left, right) =>
    left.createdAt.localeCompare(right.createdAt),
  );
  const visibleComments = orderedComments.slice(0, maxItems);
  const hasMore = orderedComments.length > visibleComments.length;

  return (
    <View style={styles.list}>
      {visibleComments.map((comment, index) => (
        <View
          key={comment.id}
          style={[
            styles.comment,
            index > 0 ? styles.commentAfterFirst : undefined,
          ]}
        >
          <TempoCommentDisplay comment={comment} />
        </View>
      ))}
      {hasMore && onMore ? (
        <View style={styles.moreRow}>
          <LinkText style={styles.moreLink} onPress={onMore}>
            More...
          </LinkText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    width: "100%",
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  comment: {
    width: "100%",
  },
  commentAfterFirst: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(71, 117, 150, 0.2)",
  },
  moreRow: {
    width: "100%",
    marginTop: 8,
    alignItems: "flex-end",
  },
  moreLink: {
    fontSize: 13,
  },
});
