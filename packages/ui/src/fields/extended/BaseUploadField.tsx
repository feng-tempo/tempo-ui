import {useFieldAdapters} from "./FieldAdapters";
import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { AntDesign } from "../../platform/FieldIcons.web";

import FileInputField, {
    FileInputValue,
} from "./FileUploadField";



import {
    
    
} from "./adapterTypes";

export type UploadedFileItem = {
    fileId: string;
    fileName: string;
    originalFileName: string;
    blobPath: string;
    contentType?: string;
    size?: number;
    status: "temp" | "linked" | "deleted";
    uploadSessionId?: string;
};

export type FileUploadFormValue = {
    uploadSessionId: string;
    uploadedFiles: UploadedFileItem[];
};

export type FileUploadFieldProps = {
    value?: FileUploadFormValue;
    onChange?: (val: FileUploadFormValue) => void;
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

export default function FileUploadFieldWrapper({
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
    uploadMode = "tempBlob",
    folder,
    showFileList = true,
    fileListLayout = "stack",
}: FileUploadFieldProps) {
 const {openNotificationPanel,closeNotificationPanel,uploadFile,deleteFile}=useFieldAdapters();
    const [queuedFiles, setQueuedFiles] = useState<FileInputValue[]>([]);
    const [uploadedFiles, setUploadedFiles] = useState<UploadedFileItem[]>(
        value?.uploadedFiles ?? []
    );
    const [isUploading, setIsUploading] = useState(false);
    const [removingFileId, setRemovingFileId] = useState<string | null>(null);

    const uploadSessionIdRef = useRef<string>(
        value?.uploadSessionId || createUploadSessionId()
    );

    useEffect(() => {
        if (value?.uploadSessionId) {
            uploadSessionIdRef.current = value.uploadSessionId;
        }
    }, [value?.uploadSessionId]);

    useEffect(() => {
        setUploadedFiles(value?.uploadedFiles ?? []);
    }, [value?.uploadedFiles]);

    const emitChange = (nextUploadedFiles: UploadedFileItem[]) => {
        onChange?.({
            uploadSessionId: uploadSessionIdRef.current,
            uploadedFiles: nextUploadedFiles,
        });
    };

    const handleQueuedFilesChange = (val?: FileInputValue[]) => {
        if (disabled) return;
        setQueuedFiles(val ?? []);
    };

    const handleUpload = async () => {
        if (!queuedFiles.length || isUploading || disabled) return;

        setIsUploading(true);

        openNotificationPanel({
            title: "Uploading files",
            message: `Uploading 1 of ${queuedFiles.length}...`,
            kind: "loading",
            autoHide: false,
        });

        const nextUploadedFiles = [...uploadedFiles];
        let uploadedCount = 0;

        try {
            for (let i = 0; i < queuedFiles.length; i++) {
                const fileItem = queuedFiles[i];

                if (!fileItem.file) {
                    continue;
                }

                openNotificationPanel({
                    title: "Uploading files",
                    message: `Uploading ${i + 1} of ${queuedFiles.length}: ${
                        fileItem.originalFileName || fileItem.name
                    }`,
                    kind: "loading",
                    autoHide: false,
                });

                const result = await uploadFile({
                    file: fileItem.file,
                    uploadSessionId: uploadSessionIdRef.current,
                    fileName: fileItem.originalFileName || fileItem.name,
                });

                nextUploadedFiles.push({
                    fileId: result.fileId,
                    fileName: result.fileName,
                    originalFileName:
                        result.originalFileName ?? result.fileName,
                    blobPath: result.blobPath,
                    contentType: result.contentType,
                    size: result.size,
                    status: result.status as "temp" | "linked" | "deleted",
                    uploadSessionId:
                        result.uploadSessionId ?? uploadSessionIdRef.current,
                });

                uploadedCount += 1;
            }

            setUploadedFiles(nextUploadedFiles);
            emitChange(nextUploadedFiles);
            setQueuedFiles([]);

            openNotificationPanel({
                title: "Upload completed",
                message: `${uploadedCount} file(s) uploaded successfully`,
                kind: "success",
                autoHide: true,
                autoHideMs: 1200,
            });
        } catch (error) {
            closeNotificationPanel();

            openNotificationPanel({
                title: "Upload failed",
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to upload files.",
                kind: "error",
                autoHide: true,
                autoHideMs: 1200,
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveUploaded = async (fileId: string) => {
        if (!fileId || removingFileId || disabled) return;

        setRemovingFileId(fileId);

        openNotificationPanel({
            title: "Removing file",
            message: "Deleting file...",
            kind: "loading",
            autoHide: false,
        });

        try {
            await deleteFile({ fileId });

            const nextUploadedFiles = uploadedFiles.filter(
                (item) => item.fileId !== fileId
            );

            setUploadedFiles(nextUploadedFiles);
            emitChange(nextUploadedFiles);

            openNotificationPanel({
                title: "Removed",
                message: "File removed successfully",
                kind: "success",
                autoHide: true,
                autoHideMs: 1200,
            });
        } catch (error) {
            closeNotificationPanel();

            openNotificationPanel({
                title: "Remove failed",
                message:
                    error instanceof Error
                        ? error.message
                        : "Failed to remove file.",
                kind: "error",
                autoHide: true,
                autoHideMs: 1200,
            });
        } finally {
            setRemovingFileId(null);
        }
    };

    return (
        <View style={style}>
            {!disabled && (
                <View style={{ marginBottom: 10 }}>
                    <Pressable
                        onPress={handleUpload}
                        disabled={isUploading || !queuedFiles.length}
                        style={{
                            alignSelf: "flex-start",
                            paddingHorizontal: 12,
                            paddingVertical: 8,
                            backgroundColor:
                                isUploading || !queuedFiles.length
                                    ? "#BFC7D1"
                                    : "#0078D4",
                        }}
                    >
                        <Text style={{ color: "#fff", fontSize: 13 }}>
                            {isUploading ? "Uploading..." : "Upload"}
                        </Text>
                    </Pressable>
                </View>
            )}

            {!disabled && (
                <FileInputField
                    value={queuedFiles}
                    onChange={handleQueuedFilesChange}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    placeHolder={placeHolder}
                    placeholder={placeholder}
                    multiRowsStyle={multiRowsStyle}
                    disabled={disabled}
                    allowMultiple={allowMultiple}
                    accept={accept}
                    uploadMode={uploadMode}
                    folder={folder}
                    showFileList={showFileList}
                    fileListLayout={fileListLayout}
                />
            )}

            {!!uploadedFiles.length && (
                <View style={styles.uploadedPanel}>
                    <View style={styles.uploadedPanelHeader}>
                        <Text style={styles.uploadedPanelTitle}>
                            Uploaded files ({uploadedFiles.length})
                        </Text>
                    </View>

                    <View style={styles.uploadedListBody}>
                        {uploadedFiles.map((item) => (
                            <View key={item.fileId} style={styles.fileRow}>
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
                                        {item.originalFileName}
                                    </Text>
                                </View>

                                {!disabled && (
                                    <Pressable
                                        onPress={() =>
                                            handleRemoveUploaded(item.fileId)
                                        }
                                        style={styles.clearBtn}
                                        disabled={
                                            removingFileId === item.fileId
                                        }
                                    >
                                        <AntDesign
                                            name="close"
                                            style={styles.clearIcon}
                                        />
                                    </Pressable>
                                )}
                            </View>
                        ))}
                    </View>
                </View>
            )}

            {disabled && !uploadedFiles.length && (
                <View style={[styles.uploadedPanel, styles.emptyUploadedPanel]}>
                    <View style={styles.uploadedPanelHeader}>
                        <Text style={[styles.uploadedPanelTitle, styles.uploadedPanelTitleDisabled]}>
                            Uploaded files (0)
                        </Text>
                    </View>

                    <View style={styles.emptyUploadedBody}>
                        <AntDesign name="paperclip" style={styles.emptyIcon} />
                        <Text style={styles.emptyText}>No attachments</Text>
                    </View>
                </View>
            )}
        </View>
    );
}

function createUploadSessionId(): string {
    return `upload-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 10)}`;
}

const styles = {
    uploadedPanel: {
        marginTop: 16,
        borderWidth: 1,
        borderColor: "#D9D9D9",
        backgroundColor: "#fff",
        paddingHorizontal: 12,
        paddingVertical: 12,
    } as any,

    uploadedPanelHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
        paddingBottom: 8,
        borderBottomWidth: 1,
        borderBottomColor: "#E5E5E5",
    } as any,

    uploadedPanelTitle: {
        fontSize: 13,
        fontWeight: "500",
        color: "#222",
    } as any,

    uploadedListBody: {} as any,

    emptyUploadedPanel: {
        backgroundColor: "#FAFAFA",
    } as any,

    uploadedPanelTitleDisabled: {
        color: "#323130",
    } as any,

    emptyUploadedBody: {
        flexDirection: "row",
        alignItems: "center",
    } as any,

    emptyIcon: {
        fontSize: 13,
        color: "#8A8886",
        marginRight: 8,
    } as any,

    emptyText: {
        fontSize: 13,
        color: "#323130",
    } as any,

    fileRow: {
        minHeight: 24,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 8,
    } as any,

    fileLeft: {
        flex: 1,
        minWidth: 0,
        flexDirection: "row",
        alignItems: "center",
        marginRight: 10,
    } as any,

    fileIcon: {
        fontSize: 13,
        color: "#666",
        marginRight: 8,
    } as any,

    fileName: {
        flex: 1,
        fontSize: 13,
        color: "#222",
    } as any,

    clearBtn: {
        paddingHorizontal: 6,
        paddingVertical: 6,
    } as any,

    clearIcon: {
        fontSize: 12,
        color: "#666",
    } as any,
};
