import React, { useRef, useState } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { AntDesign } from "../../platform/FieldIcons.web";
import { Ionicons } from "../../platform/FieldIcons.web";

export type FileInputValue = {
    name: string;
    size?: number;
    type?: string;
    uri?: string;
    file?: File;
    originalFileName?: string;
};

export type FileInputComponentProps = {
    allowMultiple?: boolean;
    accept?: string;
    uploadMode?: "none" | "tempBlob";
    folder?: string;
    showFileList?: boolean;
    fileListLayout?: "side" | "stack";
};

export type FileInputFieldProps = {
    value?: FileInputValue[] | undefined;
    onChange?: (val?: FileInputValue[]) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    placeHolder?: string;
    placeholder?: string;
    style?: any;
    multiRowsStyle?: any;
    disabled?: boolean;

    allowMultiple?: boolean;
    accept?: string;
    uploadMode?: "none" | "tempBlob";
    folder?: string;
    showFileList?: boolean;
    fileListLayout?: "side" | "stack";
};

export default function FileInputField({
    value,
    onChange,
    onFocus,
    onBlur,
    placeHolder,
    placeholder,
    style,
    multiRowsStyle,
    disabled = false,
    allowMultiple = true,
    accept,
    showFileList = true,
    fileListLayout = "side",
}: FileInputFieldProps) {
    const isWeb = Platform.OS === "web";

    const [isDragOver, setIsDragOver] = useState(false);
    const [isBrowseHovered, setIsBrowseHovered] = useState(false);
    const [isBrowseFocused, setIsBrowseFocused] = useState(false);

    const inputRef = useRef<HTMLInputElement | null>(null);
    const currentFiles = value ?? [];

    const resolvedPlaceholder =
        placeHolder ?? placeholder ?? "Drag and drop files here";

    const isStack = fileListLayout === "stack";

    const normalizeFiles = (files: File[]): FileInputValue[] => {
        return files.map((file) => ({
            name: file.name,
            originalFileName: file.name,
            size: file.size,
            type: file.type,
            file,
            uri: URL.createObjectURL(file),
        }));
    };

    const appendFiles = (files: File[]) => {
        if (!files.length || disabled) return;

        const nextFiles = normalizeFiles(files);

        if (!allowMultiple) {
            onChange?.(nextFiles.length ? [nextFiles[0]] : undefined);
            return;
        }

        onChange?.([...currentFiles, ...nextFiles]);
    };

    const handlePick = () => {
        if (!isWeb || disabled) return;
        inputRef.current?.click();
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        appendFiles(files);
        e.target.value = "";
    };

    const handleRemoveAt = (index: number) => {
        if (disabled) return;

        const next = currentFiles.filter((_, i) => i !== index);
        onChange?.(next.length ? next : undefined);
    };

    const handleRemoveAll = () => {
        if (disabled) return;
        onChange?.(undefined);
    };

    const handleBrowseFocus = () => {
        setIsBrowseFocused(true);
        onFocus?.();
    };

    const handleBrowseBlur = () => {
        setIsBrowseFocused(false);
        onBlur?.();
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        if (disabled) return;
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files ?? []);
        appendFiles(files);
    };

    if (!isWeb) return null;

    return (
        <View style={[styles.wrapper, multiRowsStyle, style]}>
            <input
                ref={inputRef}
                type="file"
                accept={accept}
                multiple={allowMultiple}
                onChange={handleInputChange}
                style={{ display: "none" }}
            />

            <View style={[styles.row, isStack && styles.rowStack]}>
                <View style={[styles.leftCol, isStack && styles.leftColStack]}>
                    <div
                        onDragOver={handleDragOver}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        style={{ width: "100%" }}
                    >
                        <View
                            style={[
                                styles.dropZone,
                                isDragOver && styles.dropZoneDragOver,
                                isBrowseFocused &&
                                    !disabled &&
                                    styles.dropZoneFocused,
                                disabled && styles.dropZoneDisabled,
                            ]}
                        >
                            <View style={styles.dropZoneInner}>
                                <Ionicons
                                    name="cloud-upload-outline"
                                    style={styles.dropZoneIcon}
                                />

                                <Text style={styles.mainText}>
                                    {resolvedPlaceholder}
                                </Text>

                                <Text style={styles.orText}>or</Text>

                                <Pressable
                                    onPress={handlePick}
                                    onFocus={handleBrowseFocus}
                                    onBlur={handleBrowseBlur}
                                    onHoverIn={() => setIsBrowseHovered(true)}
                                    onHoverOut={() => setIsBrowseHovered(false)}
                                    disabled={disabled}
                                    style={styles.inlineBrowseBtn}
                                >
                                    <Text
                                        style={[
                                            styles.inlineBrowseText,
                                            isBrowseHovered &&
                                                !disabled &&
                                                styles.inlineBrowseTextHovered,
                                            isBrowseFocused &&
                                                styles.inlineBrowseTextFocused,
                                            disabled &&
                                                styles.inlineBrowseTextDisabled,
                                        ]}
                                    >
                                        Browse for files
                                    </Text>
                                </Pressable>
                            </View>
                        </View>
                    </div>
                </View>

                {showFileList && currentFiles.length > 0 && (
                    <View
                        style={[
                            styles.fileListCol,
                            isStack && styles.fileListColStack,
                        ]}
                    >
                        <View style={styles.fileListPanel}>
                            <View style={styles.fileListHeader}>
                                <Text style={styles.fileCountText}>
                                    {currentFiles.length} file
                                    {currentFiles.length > 1 ? "s" : ""}
                                </Text>

                                <Pressable
                                    onPress={handleRemoveAll}
                                    style={styles.removeAllBtn}
                                    disabled={disabled}
                                >
                                    <Text
                                        style={[
                                            styles.removeAllText,
                                            disabled &&
                                                styles.removeAllTextDisabled,
                                        ]}
                                    >
                                        Remove all
                                    </Text>
                                </Pressable>
                            </View>

                            <View style={styles.fileListBody}>
                                {currentFiles.map((item, index) => (
                                    <View
                                        key={`${item.name}-${index}`}
                                        style={styles.fileRow}
                                    >
                                        <View style={styles.fileLeft}>
                                            <AntDesign
                                                name="paperclip"
                                                style={styles.fileIcon}
                                            />

                                            <Text
                                                style={styles.fileName}
                                                numberOfLines={1}
                                                ellipsizeMode="tail"
                                            >
                                                {item.originalFileName ||
                                                    item.name}
                                            </Text>
                                        </View>

                                        <Pressable
                                            onPress={() => handleRemoveAt(index)}
                                            style={styles.clearBtn}
                                            disabled={disabled}
                                        >
                                            <AntDesign
                                                name="close"
                                                style={styles.clearIcon}
                                            />
                                        </Pressable>
                                    </View>
                                ))}
                            </View>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}

const webLinkStyle =
    Platform.OS === "web"
        ? ({
              cursor: "pointer",
              userSelect: "none",
              outlineStyle: "none",
              outlineWidth: 0,
              outlineColor: "transparent",
          } as any)
        : {};

const styles = StyleSheet.create<any>({
    wrapper: {
        width: "100%",
    },

    row: {
        flexDirection: "row",
        alignItems: "stretch",
        width: "100%",
    },

    leftCol: {
        width: 380,
        flexShrink: 0,
        marginRight: 10,
    },

    dropZone: {
        minHeight: 190,
        borderWidth: 1,
        borderStyle: "dashed",
        borderColor: "#A0A0A0",
        backgroundColor: "#fff",
        paddingHorizontal: 20,
        paddingVertical: 20,
        justifyContent: "center",
        alignItems: "center",
    },

    dropZoneDragOver: {
        borderColor: "#0061a3",
        backgroundColor: "#F4FBFF",
    },

    dropZoneFocused: {
        borderColor: "#0061a3",
        boxShadow: "0 0 3px rgba(0, 97, 163, 0.7)",
    },

    dropZoneDisabled: {
        backgroundColor: "#FAFAFA",
        opacity: 0.7,
    },

    dropZoneInner: {
        alignItems: "center",
        justifyContent: "center",
    },

    dropZoneIcon: {
        fontSize: 36,
        color: "#266882",
        marginBottom: 12,
    },

    mainText: {
        fontSize: 14,
        color: "#333",
        textAlign: "center",
    },

    orText: {
        fontSize: 13,
        color: "#555",
        marginTop: 4,
        marginBottom: 4,
        textAlign: "center",
    },

    inlineBrowseBtn: {
        ...webLinkStyle,
    },

    inlineBrowseText: {
        fontSize: 14,
        color: "#0067B8",
        textAlign: "center",
        textDecorationLine: "none",
    },

    inlineBrowseTextHovered: {
        textDecorationLine: "underline",
    },

    inlineBrowseTextFocused: {
        textDecorationLine: "underline",
    },

    inlineBrowseTextDisabled: {
        color: "#888",
    },

    fileListCol: {
        flex: 1,
        minWidth: 0,
    },

    fileListPanel: {
        height: 190,
        borderWidth: 1,
        borderColor: "#D9D9D9",
        backgroundColor: "#fff",
        paddingHorizontal: 12,
        paddingVertical: 12,
        overflowY: "auto",
    },

    fileListHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    },

    fileCountText: {
        fontSize: 13,
        fontWeight: "500",
        color: "#222",
    },

    removeAllBtn: {
        paddingHorizontal: 4,
        paddingVertical: 2,
    },

    removeAllText: {
        fontSize: 12,
        color: "#0061a3",
    },

    removeAllTextDisabled: {
        color: "#999",
    },

    fileListBody: {
        overflowY: "auto",
    },

    fileRow: {
        minHeight: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    },

    fileLeft: {
        flex: 1,
        minWidth: 0,
        flexDirection: "row",
        alignItems: "center",
        marginRight: 10,
    },

    fileIcon: {
        fontSize: 13,
        color: "#666",
        marginRight: 8,
        marginTop: 2,
    },

    fileName: {
        flex: 1,
        fontSize: 13,
        color: "#222",
    },

    clearBtn: {
        paddingHorizontal: 6,
        paddingVertical: 6,
    },

    clearIcon: {
        fontSize: 12,
        color: "#666",
    },

    rowStack: {
        flexDirection: "column",
    },

    leftColStack: {
        width: "100%",
        marginRight: 0,
        marginBottom: 10,
    },

    fileListColStack: {
        width: "100%",
    },
});
