import { FontAwesome } from "../../platform/FieldIcons.web";
import { ViewProps, Pressable, StyleSheet, Platform, View, Text } from "react-native";
import type { StyleProp, TextStyle } from "react-native";
import { useState } from "react";
import NavBtn from "../../actions/NavBtn";


export type InfoBoxProps = ViewProps & {
    children: React.ReactNode;
    level?: 'info' | 'success' | 'attention' | 'warning' | 'error' | 'comment' | string;
    showIcon?: boolean;
    contentStyle?: StyleProp<TextStyle>;
    /** Reserves this many text lines when collapsed. Omit for the original automatic height. */
    collapsedLines?: number;
    expandable?: boolean;
    details?: React.ReactNode;
    secondaryText?: string;
}

export default function InfoBox({ children, level, showIcon = true, contentStyle, collapsedLines, expandable = false, details, secondaryText, ...rest }: InfoBoxProps) {
    const [expanded, setExpanded] = useState(false);
    const [hasSecondLine, setHasSecondLine] = useState(true);
    const lines = typeof collapsedLines === 'number' && Number.isFinite(collapsedLines) && collapsedLines >= 1 ? Math.floor(collapsedLines) : undefined;
    const open = expandable && expanded;
    const lineHeight = StyleSheet.flatten(contentStyle)?.lineHeight ?? (level === 'comment' ? 25 : 20);
    const content = <Text numberOfLines={lines && !open ? lines : undefined}
        onLayout={secondaryText && lines && lines >= 2 ? event => setHasSecondLine(event.nativeEvent.layout.height > lineHeight * 1.5) : undefined}
        style={[styles.infoCtn, level === 'comment' && styles.commentText, contentStyle, lines ? { lineHeight } : undefined]}>{children}</Text>;
    return (
        <Pressable style={[styles.box, rest.style, level === 'info' && styles.info
            , level === 'success' && styles.success, level === 'attention' && styles.attention, level === 'warning' && styles.warning, level === 'error' && styles.error,
        level === 'comment' && styles.comment]}>
            {showIcon && level === 'info' && <FontAwesome name="exclamation-circle" style={[styles.icon, styles.infoIcon]} />}
            {showIcon && level === 'success' && <FontAwesome name="check-circle" style={[styles.icon, styles.successIcon]} />}
            {showIcon && level === 'attention' && <FontAwesome name="exclamation-circle" style={[styles.icon, styles.attentionIcon]} />}
            {showIcon && level === 'warning' && <FontAwesome name="warning" style={[styles.icon, styles.warningIcon]} />}
            {showIcon && level === 'error' && <FontAwesome name="times-circle" style={[styles.icon, styles.errorIcon]} />}
            {showIcon && level === 'comment' && <FontAwesome name="comment" style={[styles.icon, styles.commentIcon]} />}
            {lines || expandable || secondaryText ? <View style={styles.boundedContent}>
                <View style={lines ? { minHeight: lines * lineHeight, ...(!open ? { height: lines * lineHeight } : {}) } : undefined}>
                    {content}
                    {secondaryText && lines && lines >= 2 && !hasSecondLine ? <Text numberOfLines={1}
                        style={{ position: 'absolute', top: lineHeight, left: 0, right: 0, fontSize: 12, lineHeight, color: '#605e5c' }}>{secondaryText}</Text> : null}
                </View>
                {open ? details : null}</View> : content}
            {expandable ? <NavBtn theme="secondary"
                cusStyle={{ btnCtn: { height: 28, width: 112, flexGrow: 0, flexShrink: 0, alignSelf: 'flex-start' }, btn: { height: 28, width: '100%', paddingHorizontal: 8, gap: 6 } }}
                onPress={() => setExpanded(value => !value)}>
                <FontAwesome name={open ? 'chevron-up' : 'chevron-down'} size={12} color="#0061a3" />
                <Text numberOfLines={1} style={{ fontSize: 12, color: '#0061a3' }}>{open ? 'Hide details' : 'Details'}</Text>
            </NavBtn> : null}

        </Pressable>
    )
}

const styles = StyleSheet.create<any>({
    boundedContent: { flex: 1, minWidth: 0, marginRight: 8 },
    box: {
        fontSize: 13,
        flexDirection: 'row',
        padding: 10,
        borderWidth: 1,
        borderColor: 'transparent',
        // justifyContent: 'center',
        // alignContent: 'center',
        alignItems: 'flex-start',
        ...Platform.select({
            web: {
                cursor: 'auto'
            }
        }),
        marginBottom: 20
    },
    icon: {
        fontSize: 16,
        paddingRight: 10
    },
    infoCtn: {
        fontSize: 13,
        width:'100%'
    },
    info: {
        backgroundColor: '#f0f6ff',
        borderColor: '#f0f6ff',
        borderWidth: 1
    },
    success: {
        backgroundColor: '#E6F4EA',
        borderColor: '#E6F4EA',
        borderWidth: 1
    },
    attention: {
        backgroundColor: '#CCE5FF',
        borderColor: '#CCE5FF',
        borderWidth: 1
    },
    warning: {
        backgroundColor: '#FFE2C6',
        borderColor: '#FFE2C6',
        borderWidth: 1
    },
    error: {
        backgroundColor: '#FFD6D6',
        borderColor: '#FFD6D6',
        borderWidth: 1
    },
    comment: {
        backgroundColor: "#FAFAFA",
        borderColor: "#E1E1E1",
        borderWidth: 1
    },
    infoIcon: {
        color: '#3381E3'
    },
    successIcon: {
        color: '#1D6F42'
    },
    attentionIcon: {
        color: '#1F3D6B'
    },
    warningIcon: {
        color: '#7D4E1D'
    },
    errorIcon: {
        color: '#7A1B1B'
    },
    commentIcon: {
        color: "#8A8886",
        marginTop: 2
    },
    commentText: {
        lineHeight: 25
    }
})
