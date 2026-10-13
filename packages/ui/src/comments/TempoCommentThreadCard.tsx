import ErrorPanel from "./support/ErrorPanel";
import {MaterialIcons} from "../platform/CommentIcons";
import type { TempoCommentView } from "./types";
import {useTempoTheme} from "../theme";
import type {ReactNode} from "react";
import { useEffect, useState, useId } from "react";
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import GButton from "../actions/GButton";
import NavBtn from "../actions/NavBtn";
import TextAreaField from "./support/TextAreaField";
import { openConfirmPopup } from "../overlays/ConfirmPopup";
import TempoCommentDisplay from "./TempoCommentDisplay";

function CommentRow({
  comment,
  onUpdate,
  onDelete, renderError,
}: {
  comment: TempoCommentView;
  onUpdate: (id: string, content: string, etag?: string) => Promise<void>;
  onDelete: (id: string, etag?: string) => Promise<void>;
  renderError?: (error:string)=>ReactNode;
}) {
  const rowId=useId();
  const {tokens}=useTempoTheme();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(comment.content);
  const [mutating, setMutating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setDraft(comment.content), [comment.content]);

  const save = async () => {
    const content = draft.trim();
    if (!content || content === comment.content.trim() || mutating) return;
    try {
      setMutating(true);
      setError("");
      await onUpdate(comment.id, content, comment._etag);
      setEditing(false);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to update comment.");
    } finally {
      setMutating(false);
    }
  };

  const confirmDelete = (anchorRef?: HTMLDivElement | null) => {
    if (!anchorRef || mutating) return;
    openConfirmPopup({
      id: `delete-tempo-comment-${rowId}`,
      anchorRef,
      title: "Delete comment?",
      description: "This comment will be removed from the conversation.",
      okText: "Delete",
      cancelText: "Cancel",
      intent: "danger",
      onOk: async () => {
        try {
          setMutating(true);
          setError("");
          await onDelete(comment.id, comment._etag);
        } catch (nextError) {
          setError(nextError instanceof Error ? nextError.message : "Unable to delete comment.");
          throw nextError;
        } finally {
          setMutating(false);
        }
      },
    });
  };

  return (
    <View style={styles.commentRow}>
      {editing ? (
        <View style={styles.editInputWrap}>
          <TextAreaField
            value={draft}
            onChange={setDraft}
            placeholder="Write a comment"
            highlightColour={tokens.focus}
            disabled={mutating}
            accessibilityLabel={`Edit comment by ${comment.createdBy.displayName}`}
            style={styles.editInput}
          />
          <View style={styles.editActionGroup}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Save comment"
              disabled={
                !draft.trim() ||
                draft.trim() === comment.content.trim() ||
                mutating
              }
              onPress={() => void save()}
              hitSlop={4}
              style={({ hovered }: {hovered?:boolean;pressed:boolean}) => [
                styles.editActionButton,
                styles.editDoneButton,
                hovered && !mutating && styles.editDoneButtonHovered,
                (!draft.trim() ||
                  draft.trim() === comment.content.trim() ||
                  mutating) &&
                  styles.editActionButtonDisabled,
              ]}
            >
              <MaterialIcons name="check" size={12} color="#ffffff" />
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancel comment editing"
              disabled={mutating}
              onPress={() => {
                setDraft(comment.content);
                setError("");
                setEditing(false);
              }}
              hitSlop={4}
              style={({ hovered }: {hovered?:boolean;pressed:boolean}) => [
                styles.editActionButton,
                styles.editCancelButton,
                hovered && !mutating && styles.editCancelButtonHovered,
                mutating && styles.editActionButtonDisabled,
              ]}
            >
              <MaterialIcons name="close" size={12} color="#475569" />
            </Pressable>
          </View>
        </View>
      ) : (
        <>
          <TempoCommentDisplay comment={comment} contentRightPadding={58} />
          {comment.canEdit || comment.canDelete ? (
            <View style={styles.rowActions}>
              {comment.canEdit ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Edit comment"
                  disabled={mutating}
                  onPress={() => setEditing(true)}
                  style={({ hovered, pressed }: {hovered?:boolean;pressed:boolean}) => [
                    styles.iconButton,
                    hovered && styles.iconButtonHovered,
                    pressed && styles.iconButtonPressed,
                  ]}
                >
                  <MaterialIcons name="edit" style={styles.actionIcon} />
                </Pressable>
              ) : null}
              {comment.canDelete ? (
                <NavBtn
                  theme="secondary"
                  disabled={mutating}
                  accessibilityLabel="Delete comment"
                  onPress={confirmDelete}
                  cusStyle={deleteButtonStyles}
                >
                  <MaterialIcons name="delete-outline" style={styles.deleteIcon} />
                </NavBtn>
              ) : null}
            </View>
          ) : null}
        </>
      )}
      {error ? (renderError?.(error) ?? <ErrorPanel compact context={{ service: "Comments", operation: "save" }} error={error} />) : null}
    </View>
  );
}

export default function TempoCommentThreadCard({
  title,
  comments,
  onClose,
  onCreate,
  onUpdate,
  onDelete,
  placementStyle,
  variant = "card",
  canCreate = true,
  interactionProps, renderError,
}: {
  title?: string;
  comments: readonly TempoCommentView[];
  onClose?: () => void;
  onCreate: (content: string) => Promise<void>;
  onUpdate: (id: string, content: string, etag?: string) => Promise<void>;
  onDelete: (id: string, etag?: string) => Promise<void>;
  placementStyle?: any;
  variant?: "card" | "panel";
  canCreate?: boolean;
  /** Consumer canvas/gesture metadata. No domain marker is built into the library. */
  interactionProps?: Pick<import("react-native").ViewProps,"onPointerDown" | "testID"> & {dataSet?:Record<string,string>};
  renderError?: (error:string)=>ReactNode;
}) {
  const {tokens}=useTempoTheme();
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const add = async () => {
    const content = draft.trim();
    if (!content || saving) return;
    try {
      setSaving(true);
      setError("");
      await onCreate(content);
      setDraft("");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Unable to add comment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View
      {...(interactionProps as any)}
      onPointerDown={interactionProps?.onPointerDown}
      style={[styles.card, variant === "panel" && styles.panel, placementStyle]}
    >
      {variant === "card" ? (
        <View style={styles.titleRow}>
          <View style={styles.titleText}>
            <Text style={styles.title}>Comments</Text>
            <Text numberOfLines={1} style={styles.subtitle}>{title}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Close comments"
            onPress={onClose}
            style={({ hovered, pressed }: {hovered?:boolean;pressed:boolean}) => [
              styles.closeButton,
              hovered && styles.iconButtonHovered,
              pressed && styles.iconButtonPressed,
            ]}
          >
            <MaterialIcons name="close" style={styles.closeIcon} />
          </Pressable>
        </View>
      ) : null}

      <ScrollView
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          variant === "panel" && styles.panelListContent,
        ]}
      >
        {comments.length ? (
          comments.map((comment) => (
            <CommentRow
              key={comment.id}
              comment={comment}
              onUpdate={onUpdate}
              onDelete={onDelete}
              renderError={renderError}
            />
          ))
        ) : (
          <Text style={styles.empty}>No comments yet.</Text>
        )}
      </ScrollView>

      {canCreate ? (
        <View style={[styles.composer, variant === "panel" && styles.panelComposer]}>
          <TextAreaField
            value={draft}
            onChange={setDraft}
            placeholder="Write a comment"
            disabled={saving}
            highlightColour={tokens.focus}
            accessibilityLabel="New comment"
            style={styles.composerInput}
          />
          {error ? (renderError?.(error) ?? <ErrorPanel compact context={{ service: "Comments", operation: "save" }} error={error} />) : null}
          <View style={styles.composerActions}>
            <GButton
              theme="primary"
              label="Add comment"
              disabled={!draft.trim() || saving}
              onPress={add}
              btnCtnStyle={styles.addButton}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
}

const deleteButtonStyles = {
  btnCtn: { width: 26, height: 26 },
  btn: { paddingHorizontal: 0, borderRadius: 4, backgroundColor: "transparent" },
  btnHovered: { backgroundColor: "#fde7e9" },
  btnPressed: { backgroundColor: "#f8d4d8" },
};

const styles = StyleSheet.create({
  card: {
    position: "absolute",
    width: 320,
    height: 340,
    zIndex: 40,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#c8d2dc",
    ...(Platform.select({
      web: { boxShadow: "0 4px 14px rgba(15, 35, 55, 0.18)" } as any,
    }) as any),
  },
  panel: {
    position: "relative",
    width: "100%",
    height: "100%",
    flex: 1,
    borderWidth: 0,
    boxShadow: "none",
  },
  titleRow: {
    minHeight: 48,
    paddingLeft: 12,
    paddingRight: 8,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#e4e9ee",
  },
  titleText: { flex: 1, minWidth: 0 },
  title: { color: "#172b4d", fontSize: 14, fontWeight: "600" },
  subtitle: { marginTop: 2, color: "#5f6f7f", fontSize: 11 },
  closeButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 4,
  },
  closeIcon: { color: "#42526e", fontSize: 17 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: 10, paddingVertical: 6 },
  panelListContent: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 16 },
  empty: { paddingVertical: 14, color: "#6b778c", fontSize: 12 },
  commentRow: {
    position: "relative",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#edf0f2",
  },
  rowActions: {
    position: "absolute",
    right: 0,
    top: 6,
    flexDirection: "row",
    gap: 2,
  },
  iconButton: {
    width: 26,
    height: 26,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonHovered: { backgroundColor: "#e8edf2" },
  iconButtonPressed: { backgroundColor: "#dce3e9" },
  actionIcon: { color: "#5f6f7f", fontSize: 15 },
  deleteIcon: { color: "#a4262c", fontSize: 16 },
  editInput: {
    height: 68,
  },
  editInputWrap: {
    position: "relative",
    width: "100%",
    minWidth: 0,
  },
  editActionGroup: {
    position: "absolute",
    left: 6,
    bottom: 4,
    flexDirection: "row",
    gap: 4,
    zIndex: 5,
  },
  editActionButton: {
    width: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 3,
    borderWidth: 1,
  },
  editDoneButton: {
    backgroundColor: "#0061a3",
    borderColor: "#0061a3",
  },
  editDoneButtonHovered: {
    backgroundColor: "#004f86",
    borderColor: "#004f86",
  },
  editCancelButton: {
    backgroundColor: "#ffffff",
    borderColor: "#cbd5e1",
  },
  editCancelButtonHovered: {
    backgroundColor: "#f8fafc",
    borderColor: "#94a3b8",
  },
  editActionButtonDisabled: {
    opacity: 0.45,
  },
  composer: {
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#e4e9ee",
    backgroundColor: "#fafbfc",
  },
  panelComposer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  composerInput: { height: 68, backgroundColor: "#ffffff" },
  composerActions: {
    marginTop: 7,
    flexDirection: "row",
    justifyContent: "flex-start",
  },
  addButton: { height: 28, minWidth: 92 },
  error: { marginTop: 5, color: "#a4262c", fontSize: 11 },
});
