import { TextInput, Text, StyleSheet, Platform, View } from "react-native";
import { useState } from "react";


export type TextAreaFieldProps = {
    value: string | undefined,
    onChange: (val: any) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    style?: any;
    placeholder?: string;
    disabled?: boolean;
    onKeyPress?: (event: any) => void;
    onKeyDown?: (event: any) => void;
    onSelectionChange?: (event: any) => void;
    showCharacterCount?: boolean;
}


export default function TextAreaField({
    value,
    onChange,
    onFocus,
    onBlur,
    style,
    placeholder,
    disabled = false,
    onKeyPress,
    onKeyDown,
    onSelectionChange,
    showCharacterCount = true,
}: TextAreaFieldProps) {
    const [focused, setFocused] = useState(false);

    const handleFocus = () => {
        setFocused(true);
        onFocus?.();
    };

    const handleBlur = () => {
        setFocused(false);
        onBlur?.();
    };

    return (
        <View>
            <TextInput
                multiline
                value={value ?? ""}
                placeholder={placeholder}
                placeholderTextColor="#8A8886"
                onChangeText={onChange}
                editable={!disabled}
                style={[
                    styles.textareaInput,
                    !showCharacterCount && styles.textareaInputNoIndicator,
                    focused && !disabled && styles.textareaInputFocused,
                    disabled && styles.textareaInputDisabled,
                    style
                ]}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyPress={onKeyPress}
                // @ts-ignore: supported by react-native-web TextInput
                onKeyDown={onKeyDown}
                onSelectionChange={onSelectionChange}

            />

            {showCharacterCount ? (
                <Text style={styles.textareaIndicator}>{value ? value.length : 0} character(s) used</Text>
            ) : null}
        </View>
    )
}


const styles = StyleSheet.create({
    textareaInput: {
        borderWidth: 1,
        borderColor: '#A0A0A0',
        paddingLeft: 8,
        paddingRight: 25,
        paddingTop: 4,
        paddingBottom: 30,
        borderRadius: 0,
        fontSize: 13,
        height: 100,
        ...Platform.select({
            web: {
                outlineStyle: "none",
                outlineWidth: 0,
                outlineColor: "transparent",
            }
        }),
        textAlignVertical: 'top',
        marginBottom: 22
    },
    textareaInputNoIndicator: {
        paddingBottom: 8,
        marginBottom: 0,
    },
    textareaInputDisabled: {
        backgroundColor: '#FAFAFA',
        color: '#323130',
    },
    textareaInputFocused: {
        borderColor: '#0061a3',
        ...Platform.select({
            web: {
                boxShadow: "0 0 3px rgba(0, 97, 163, 0.7)",
            },
        }),
    },
    textareaIndicator: {
        position: 'absolute',
        fontSize: 13,
        bottom: 0,
        borderBottomWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: '#A0A0A0',
        textAlign: 'right',
        width: '100%',
        paddingHorizontal: 8,
        paddingVertical: 2
    },
})
