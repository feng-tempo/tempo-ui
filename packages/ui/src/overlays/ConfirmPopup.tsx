// components/ui/web/general/confirmPopup.tsx

import React, { useCallback, useMemo, useState } from "react";
import {
    Platform,
    StyleProp,
    StyleSheet,
    Text,
    TextStyle,
    View,
    ViewStyle,
} from "react-native";

import GButton from "../actions/GButton";
const containerStyles={titleContainer:{paddingLeft:20,paddingRight:20,marginBottom:10,flexDirection:'column' as const},flexRowContainer:{flex:1,flexDirection:'row' as const},title:{fontSize:22,fontWeight:'600' as const,color:'darkBlue',lineHeight:30}};
import { openDropdownPanel, closeDropdownPanel } from "./DropdownPanel";

export type ConfirmPopupButtonStyles = {
    btnCtnStyle?: StyleProp<ViewStyle>;
    btnStyle?: StyleProp<ViewStyle>;
    btnHoveredStyle?: StyleProp<ViewStyle>;
    btnPressedStyle?: StyleProp<ViewStyle>;
    btnLabelStyle?: StyleProp<TextStyle>;
};

/* =============================================================================
  Types
============================================================================= */

export type ConfirmPopupProps = {
    title?: string;
    description?: string;

    okText?: string;
    cancelText?: string;

    /** Optional: show a destructive intent (still uses your normal button) */
    intent?: "default" | "danger";

    /** Optional: disable OK initially (e.g. waiting for checkbox) */
    okDisabled?: boolean;

    /** Optional: match the confirming action's established button treatment. */
    okButtonStyles?: ConfirmPopupButtonStyles;

    /** Called when user confirms */
    onOk: () => void | Promise<void>;

    /** Called when user cancels/closes */
    onCancel?: () => void;

    /** Optional: custom content under description */
    children?: React.ReactNode;
};

export type OpenConfirmPopupArgs = {
    id?: string;

    /** anchor for dropdown panel */
    anchorRef?: HTMLDivElement | null;
    align?: "auto" | "left" | "right";
    /** Unanchored confirmations default to a centered modal. */
    placementMode?: "anchor" | "center";
    bodyMask?: boolean;

    /** popup content */
    title: string;
    description?: string;

    okText?: string;
    cancelText?: string;

    intent?: "default" | "danger";

    /** Optional: match the confirming action's established button treatment. */
    okButtonStyles?: ConfirmPopupButtonStyles;

    /** Optional: dismiss before awaiting a longer-running confirmed action. */
    closeImmediatelyOnConfirm?: boolean;

    /** Called when user confirms. */
    onOk: () => void | Promise<void>;

    /** Called when user cancels/closes */
    onCancel?: () => void;
};

/* =============================================================================
  Component (UI)
============================================================================= */

export function ConfirmPopup({
    title = "Confirm",
    description = "Are you sure?",
    okText = "OK",
    cancelText = "Cancel",
    intent = "default",
    okDisabled = false,
    okButtonStyles,
    onOk,
    onCancel,
    children,
}: ConfirmPopupProps) {
    const [isWorking, setIsWorking] = useState(false);
    const [error,setError]=useState("");

    const desc = useMemo(() => String(description ?? "").trim(), [description]);

    const handleCancel = useCallback(() => {
        if (isWorking) return;
        onCancel?.();
    }, [isWorking, onCancel]);

    const handleOk = useCallback(async () => {
        if (isWorking) return;
        if (okDisabled) return;

        try {
            setIsWorking(true);
            setError("");
            await onOk();
        } catch(nextError) {
            setError(nextError instanceof Error?nextError.message:"Unable to confirm action.");
        } finally {
            setIsWorking(false);
        }
    }, [isWorking, okDisabled, onOk]);

    return (
        <View accessibilityRole="alert" style={styles.wrap}>
            {/* Header */}
            <View style={[containerStyles.titleContainer, styles.header]}>
                <View style={containerStyles.flexRowContainer}>
                    <Text style={[containerStyles.title, styles.title]}>{title}</Text>
                </View>
            </View>

            {/* Body */}
            <View style={styles.body}>
                {!!desc && <Text style={styles.desc}>{desc}</Text>}
                {children ? <View style={{ marginTop: 10 }}>{children}</View> : null}
                {error ? <Text accessibilityRole="alert" style={{color:"#a4262c",fontSize:11}}>{error}</Text> : null}
            </View>

            {/* Footer */}
            <View style={[styles.bottomContainer]}>
                <View style={styles.btnGroup}>
                    <GButton
                        theme="primary"
                        label={isWorking ? "Working..." : okText}
                        btnLabelStyle={[
                            styles.btnLabel,
                            { fontWeight: 600 },
                            okButtonStyles?.btnLabelStyle,
                        ]}
                        onPress={handleOk}
                        btnCtnStyle={[styles.btn, okButtonStyles?.btnCtnStyle]}
                        btnStyle={okButtonStyles?.btnStyle}
                        btnHoveredStyle={okButtonStyles?.btnHoveredStyle}
                        btnPressedStyle={okButtonStyles?.btnPressedStyle}
                        disabled={isWorking || okDisabled}
                    />
                    <GButton
                        label={cancelText}
                        onPress={handleCancel}
                        disabled={isWorking}
                        btnCtnStyle={styles.btn}
                        btnLabelStyle={styles.btnLabel}
                    />
                </View>
            </View>
        </View>
    );
}

/* =============================================================================
  Helper: open via DropdownPanel
============================================================================= */

export function openConfirmPopup(args: OpenConfirmPopupArgs) {
    const {
        id = "confirmPopup",
        anchorRef,
        align = "auto",
        placementMode: requestedPlacementMode,
        bodyMask: requestedBodyMask,
        title,
        description,
        okText = "OK",
        cancelText = "Cancel",
        intent = "default",
        okButtonStyles,
        closeImmediatelyOnConfirm = false,
        onOk,
        onCancel,
    } = args;
    const placementMode = requestedPlacementMode ?? (anchorRef ? "anchor" : "center");
    const bodyMask = requestedBodyMask ?? placementMode === "center";

    closeDropdownPanel();
    let settled=false,working=false;
    openDropdownPanel({id,anchorRef,preferredWidth:430,collision:true,align,placementMode,bodyMask,
      dismissible:()=>!working,trapFocus:true,role:'dialog',label:title,
      onClose:()=>{if(!settled){settled=true;onCancel?.()}},
      content:close=><ConfirmPopup title={title} description={description} okText={okText} cancelText={cancelText} intent={intent} okButtonStyles={okButtonStyles}
        onCancel={()=>close()}
        onOk={async()=>{working=true;try{if(closeImmediatelyOnConfirm){settled=true;working=false;close();await onOk();return;}await onOk();settled=true;working=false;close();}finally{working=false}}}/>
    });

}

const styles = StyleSheet.create({
    wrap: {
        width: 430,
        maxWidth: Platform.select({
            web: "100%" as any,
            default: "100%",
        }),
        backgroundColor: "#fff",
        overflow: "hidden",
        borderWidth: 1,
        flex:1,
        borderColor: "#e5e5e5",
        ...(Platform.select({
            web: { boxShadow: "0px 2px 14px rgba(0,0,0,0.12)" },
        }) as any),
    },

    header: {
        paddingHorizontal: 16,
        paddingTop:5
    },

    title: {
        fontSize: 18,
        fontWeight: "600",
    },

    body: {
        paddingHorizontal: 20,
        paddingBottom:10
    },

    desc: {
        fontSize: 14,
        color: "#444"
    },

    bottomContainer: {
        height: 45,
         paddingHorizontal: 20,
        flexDirection: "column",
        justifyContent: "center",
    },
    btnGroup: { flexDirection: "row", gap: 15 },
    btn: { minWidth: 80 },
    btnLabel: Platform.select({
        web: { whiteSpace: "nowrap" } as any,
        default: undefined,
    }),

    dangerWrap: {
        // subtle “danger” hint without needing a new button theme
        ...(Platform.select({
            web: { filter: "saturate(1.1)" },
        }) as any),
    },
});
