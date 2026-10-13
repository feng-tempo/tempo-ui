import {
  StyleSheet,
  View,
  Pressable,
  Text,
  ViewStyle,
  StyleProp,
  TextStyle,
  GestureResponderEvent,
} from "react-native";
import React, { useRef, useState } from "react";
import useTooltip from "../overlays/tooltip/useTooltip";
import type { TooltipContent } from "../overlays/tooltip/Tooltip.types";
import {FontAwesome6} from "../platform/CommentIcons";
import {useTempoTheme} from "../theme";

type iconName = string;

type cusBtnStyle = {
  btnCtn?: StyleProp<ViewStyle>;
  btn?: StyleProp<ViewStyle>;
  btnLabel?: StyleProp<TextStyle>;
  btnIcon?: StyleProp<ViewStyle | TextStyle>;
  btnHovered?: StyleProp<ViewStyle>;
  btnPressed?: StyleProp<ViewStyle>;
  labelHovered?: StyleProp<TextStyle>;
  iconHovered?: StyleProp<TextStyle>;
};

export type NavBtnProps = {
  accessibilityLabel?: string;
  focusStyle?: StyleProp<ViewStyle>;
  tooltip?: TooltipContent;
  label?: string;
  icon?: iconName;
  theme?: "primary" | "secondary" | string;
  iconReverse?: boolean;
  cusStyle?: cusBtnStyle;
  onPress?: (
    eleRef?: HTMLDivElement | null,
    event?: GestureResponderEvent
  ) => void;
  iconFlex?: number;
  children?: React.ReactNode;
  id?: string;
  isFocus?: boolean;
  onHoverIn?: () => void;
  onHoverOut?: () => void;
  disabled?: boolean;
};

function applyDisabledColorToChildren(
  children: React.ReactNode,
  disabled: boolean
): React.ReactNode {
  if (!disabled) return children;

  return React.Children.map(children, (child) => {
    if (!React.isValidElement(child)) return child;

    const childProps = child.props as any;
    const nextProps: Record<string, any> = {};

    if (childProps.style !== undefined) {
      nextProps.style = [childProps.style, disabledStyles.childColor];
    } else {
      nextProps.style = disabledStyles.childColor;
    }

    if (childProps.color !== undefined) {
      nextProps.color = "#9b9b9b";
    }

    if (childProps.children !== undefined) {
      nextProps.children = applyDisabledColorToChildren(
        childProps.children,
        disabled
      );
    }

    return React.cloneElement(child, nextProps);
  });
}

export default function NavBtn({
  tooltip,
  label,
  icon,
  theme,
  onPress,
  id,
  children,
  isFocus,
  cusStyle = {},
  iconReverse = false,
  iconFlex = 0.25,
  onHoverIn,
  onHoverOut,
  disabled,
  accessibilityLabel, focusStyle,
}: NavBtnProps) {
  const tempoTheme=useTempoTheme();
  const [keyboardFocused,setKeyboardFocused]=useState(false);
  const [hoverState, setHoverState] = useState<Boolean>(false);

  const tooltipTrigger = useTooltip(tooltip, !!disabled);
  const btnRef = useRef<HTMLDivElement | null>(null);

  if (!iconFlex) iconFlex = 0.25;
  const labelFlex = 1 - iconFlex;

  const renderedChildren = applyDisabledColorToChildren(children, !!disabled);

  if (theme === "primary") {
    if (iconReverse) {
      return (
        <View
          style={[
            styles.btnCtn,
            cusStyle.btnCtn,
            { cursor: disabled ? "auto" : "pointer" },
          ]}
          id={id}
          pointerEvents={disabled ? "none" : "auto"}
        >
          <Pressable
            style={({ hovered }: {hovered?:boolean;pressed:boolean}) => [
              styles.btn,
              keyboardFocused && !disabled && (focusStyle ?? {boxShadow:`0 0 3px ${tempoTheme.tokens.focus}`}),
              cusStyle.btn,
              !disabled && (hovered || isFocus) && primaryStyles.btnHovered,
              tempoTheme.custom && (hovered || isFocus) && {backgroundColor:tempoTheme.tokens.primary},
              !disabled && hovered && cusStyle.btnHovered,
            ]}
            ref={btnRef as React.RefObject<any>}
            accessibilityRole="button"
            accessibilityState={{disabled:!!disabled}}
            disabled={disabled}
            accessibilityLabel={accessibilityLabel ?? label ?? (typeof tooltip === "string" ? tooltip : tooltip?.title)}
            {...(tooltipTrigger.id ? { "aria-describedby": tooltipTrigger.id } : {})}
            onFocus={() => {setKeyboardFocused(true);tooltipTrigger.show(btnRef.current)}}
            onBlur={() => {setKeyboardFocused(false);tooltipTrigger.dismiss()}}
            onPress={(event) => {
              tooltipTrigger.dismiss();
              onPress ? onPress(btnRef.current, event) : undefined;
            }}
            onHoverIn={() => {
              setHoverState(true);
              tooltipTrigger.show(btnRef.current);
              onHoverIn?.();
            }}
            onHoverOut={() => {
              setHoverState(false);
              tooltipTrigger.dismiss();
              onHoverOut?.();
            }}
          >
            {children ? (
              <>{renderedChildren}</>
            ) : (
              <>
                {label ? (
                  <View
                    style={[
                      primaryStyles.btnLabelCtn,
                      { flex: icon ? labelFlex : 1, alignItems: "flex-end" },
                    ]}
                  >
                    <Text
                      selectable={false}
                      style={[
                        primaryStyles.btnLabel,
                        cusStyle.btnLabel,
                        hoverState && !disabled && cusStyle.labelHovered,
                        disabled && disabledStyles.label,
                      ]}
                    >
                      {label}
                    </Text>
                  </View>
                ) : null}

                {icon ? (
                  <View
                    style={[
                      primaryStyles.btnIconCtn,
                      { flex: label ? iconFlex : 1, alignItems: "center" },
                    ]}
                  >
                    <FontAwesome6
                      name={icon}
                      style={[
                        primaryStyles.btnIcon,
                        cusStyle.btnIcon,
                        hoverState && !disabled && cusStyle.iconHovered,
                        disabled && disabledStyles.icon,
                      ]}
                    />
                  </View>
                ) : null}
              </>
            )}
          </Pressable>
        </View>
      );
    }

    return (
      <View
        style={[styles.btnCtn, cusStyle.btnCtn]}
        id={id}
        pointerEvents={disabled ? "none" : "auto"}
      >
        <Pressable
          style={({ hovered }: {hovered?:boolean;pressed:boolean}) => [
            styles.btn,
            keyboardFocused && !disabled && (focusStyle ?? {boxShadow:`0 0 3px ${tempoTheme.tokens.focus}`}),
            cusStyle.btn,
            !disabled && (hovered || isFocus) && primaryStyles.btnHovered,
              tempoTheme.custom && (hovered || isFocus) && {backgroundColor:tempoTheme.tokens.primary},
            !disabled && hovered && cusStyle.btnHovered,
          ]}
          ref={btnRef as React.RefObject<any>}
          accessibilityRole="button"
            accessibilityState={{disabled:!!disabled}}
            disabled={disabled}
            accessibilityLabel={accessibilityLabel ?? label ?? (typeof tooltip === "string" ? tooltip : tooltip?.title)}
          {...(tooltipTrigger.id ? { "aria-describedby": tooltipTrigger.id } : {})}
          onFocus={() => {setKeyboardFocused(true);tooltipTrigger.show(btnRef.current)}}
          onBlur={() => {setKeyboardFocused(false);tooltipTrigger.dismiss()}}
          onPress={(event) => {
            tooltipTrigger.dismiss();
            onPress ? onPress(btnRef.current, event) : undefined;
          }}
          onHoverIn={() => {
            setHoverState(true);
            tooltipTrigger.show(btnRef.current);
            onHoverIn?.();
          }}
          onHoverOut={() => {
            setHoverState(false);
            tooltipTrigger.dismiss();
            onHoverOut?.();
          }}
        >
          {children ? (
            <>{renderedChildren}</>
          ) : (
            <>
              {icon ? (
                <View
                  style={[
                    primaryStyles.btnIconCtn,
                    { flex: label ? iconFlex : 1 },
                  ]}
                >
                  <FontAwesome6
                    name={icon}
                    style={[
                      primaryStyles.btnIcon,
                      cusStyle.btnIcon,
                      hoverState && !disabled && cusStyle.iconHovered,
                      disabled && disabledStyles.icon,
                    ]}
                  />
                </View>
              ) : null}

              {label ? (
                <View
                  style={[
                    primaryStyles.btnLabelCtn,
                    { flex: icon ? labelFlex : 1 },
                  ]}
                >
                  <Text
                    selectable={false}
                    style={[
                      primaryStyles.btnLabel,
                      cusStyle.btnLabel,
                      hoverState && !disabled && cusStyle.labelHovered,
                      disabled && disabledStyles.label,
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              ) : null}
            </>
          )}
        </Pressable>
      </View>
    );
  }

  if (theme === "secondary") {
    if (iconReverse) {
      return (
        <View
          style={[styles.btnCtn, cusStyle.btnCtn]}
          id={id}
          pointerEvents={disabled ? "none" : "auto"}
        >
          <Pressable
            style={({ hovered, pressed }: {hovered?:boolean;pressed:boolean}) => [
              styles.btn,
              keyboardFocused && !disabled && (focusStyle ?? {boxShadow:`0 0 3px ${tempoTheme.tokens.focus}`}),
              cusStyle.btn,
              !disabled && (hovered || isFocus) && secondaryStyles.btnHovered,
              !disabled && hovered && cusStyle.btnHovered,
              !disabled && pressed && secondaryStyles.btnPressed,
              !disabled && pressed && cusStyle.btnPressed,
            ]}
            ref={btnRef as React.RefObject<any>}
            accessibilityRole="button"
            accessibilityState={{disabled:!!disabled}}
            disabled={disabled}
            accessibilityLabel={accessibilityLabel ?? label ?? (typeof tooltip === "string" ? tooltip : tooltip?.title)}
            {...(tooltipTrigger.id ? { "aria-describedby": tooltipTrigger.id } : {})}
            onFocus={() => {setKeyboardFocused(true);tooltipTrigger.show(btnRef.current)}}
            onBlur={() => {setKeyboardFocused(false);tooltipTrigger.dismiss()}}
            onPress={(event) => {
              tooltipTrigger.dismiss();
              onPress ? onPress(btnRef.current, event) : undefined;
            }}
            onHoverIn={() => {
              setHoverState(true);
              tooltipTrigger.show(btnRef.current);
              onHoverIn?.();
            }}
            onHoverOut={() => {
              setHoverState(false);
              tooltipTrigger.dismiss();
              onHoverOut?.();
            }}
          >
            {children ? (
              <>{renderedChildren}</>
            ) : (
              <>
                {label ? (
                  <View
                    style={[
                      secondaryStyles.btnLabelCtn,
                      { flex: icon ? labelFlex : 1, alignItems: "flex-end" },
                    ]}
                  >
                    <Text
                      selectable={false}
                      style={[
                        secondaryStyles.btnLabel,
                        cusStyle.btnLabel,
                        hoverState && !disabled && cusStyle.labelHovered,
                        disabled && disabledStyles.label,
                      ]}
                    >
                      {label}
                    </Text>
                  </View>
                ) : null}

                {icon ? (
                  <View
                    style={[
                      secondaryStyles.btnIconCtn,
                      { flex: label ? iconFlex : 1, alignItems: "center" },
                    ]}
                  >
                    <FontAwesome6
                      name={icon}
                      style={[
                        secondaryStyles.btnIcon,
                      tempoTheme.custom && {color:tempoTheme.tokens.primary},
                      tempoTheme.custom && {color:tempoTheme.tokens.primary},
                        cusStyle.btnIcon,
                        hoverState && !disabled && cusStyle.iconHovered,
                        disabled && disabledStyles.icon,
                      ]}
                    />
                  </View>
                ) : null}
              </>
            )}
          </Pressable>
        </View>
      );
    }

    return (
      <View
        style={[styles.btnCtn, cusStyle.btnCtn]}
        id={id}
        pointerEvents={disabled ? "none" : "auto"}
      >
        <Pressable
          style={({ hovered, pressed }: {hovered?:boolean;pressed:boolean}) => [
            styles.btn,
            keyboardFocused && !disabled && (focusStyle ?? {boxShadow:`0 0 3px ${tempoTheme.tokens.focus}`}),
            cusStyle.btn,
            !disabled && (hovered || isFocus) && secondaryStyles.btnHovered,
            !disabled && hovered && cusStyle.btnHovered,
            !disabled && pressed && secondaryStyles.btnPressed,
            !disabled && pressed && cusStyle.btnPressed,
          ]}
          ref={btnRef as React.RefObject<any>}
          accessibilityRole="button"
            accessibilityState={{disabled:!!disabled}}
            disabled={disabled}
            accessibilityLabel={accessibilityLabel ?? label ?? (typeof tooltip === "string" ? tooltip : tooltip?.title)}
          {...(tooltipTrigger.id ? { "aria-describedby": tooltipTrigger.id } : {})}
          onFocus={() => {setKeyboardFocused(true);tooltipTrigger.show(btnRef.current)}}
          onBlur={() => {setKeyboardFocused(false);tooltipTrigger.dismiss()}}
          onPress={(event) => {
            tooltipTrigger.dismiss();
            onPress ? onPress(btnRef.current, event) : undefined;
          }}
          onHoverIn={() => {
            setHoverState(true);
            tooltipTrigger.show(btnRef.current);
            onHoverIn?.();
          }}
          onHoverOut={() => {
            setHoverState(false);
            tooltipTrigger.dismiss();
            onHoverOut?.();
          }}
        >
          {children ? (
            <>{renderedChildren}</>
          ) : (
            <>
              {icon ? (
                <View
                  style={[
                    secondaryStyles.btnIconCtn,
                    { flex: label ? iconFlex : 1 },
                  ]}
                >
                  <FontAwesome6
                    name={icon}
                    style={[
                      secondaryStyles.btnIcon,
                      tempoTheme.custom && {color:tempoTheme.tokens.primary},
                      tempoTheme.custom && {color:tempoTheme.tokens.primary},
                      cusStyle.btnIcon,
                      hoverState && !disabled && cusStyle.iconHovered,
                      disabled && disabledStyles.icon,
                    ]}
                  />
                </View>
              ) : null}

              {label ? (
                <View
                  style={[
                    secondaryStyles.btnLabelCtn,
                    { flex: icon ? labelFlex : 1 },
                  ]}
                >
                  <Text
                    selectable={false}
                    style={[
                      secondaryStyles.btnLabel,
                      cusStyle.btnLabel,
                      hoverState && !disabled && cusStyle.labelHovered,
                      disabled && disabledStyles.label,
                    ]}
                  >
                    {label}
                  </Text>
                </View>
              ) : null}
            </>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <View
      style={styles.btnCtn}
      id={id}
      pointerEvents={disabled ? "none" : "auto"}
    >
      <Pressable
        style={({ hovered }: {hovered?:boolean;pressed:boolean}) => [
          styles.btn,
          keyboardFocused && !disabled && (focusStyle ?? {boxShadow:`0 0 3px ${tempoTheme.tokens.focus}`}),
          cusStyle.btn,
          !disabled && (hovered || isFocus) && primaryStyles.btnHovered,
              tempoTheme.custom && (hovered || isFocus) && {backgroundColor:tempoTheme.tokens.primary},
          !disabled && hovered && cusStyle.btnHovered,
        ]}
        ref={btnRef as React.RefObject<any>}
        accessibilityRole="button"
            accessibilityState={{disabled:!!disabled}}
            disabled={disabled}
            accessibilityLabel={accessibilityLabel ?? label ?? (typeof tooltip === "string" ? tooltip : tooltip?.title)}
        {...(tooltipTrigger.id ? { "aria-describedby": tooltipTrigger.id } : {})}
        onFocus={() => {setKeyboardFocused(true);tooltipTrigger.show(btnRef.current)}}
        onBlur={() => {setKeyboardFocused(false);tooltipTrigger.dismiss()}}
        onPress={(event) => {
          tooltipTrigger.dismiss();
          onPress ? onPress(btnRef.current, event) : undefined;
        }}
        onHoverIn={() => {
          setHoverState(true);
          tooltipTrigger.show(btnRef.current);
          onHoverIn?.();
        }}
        onHoverOut={() => {
          setHoverState(false);
          tooltipTrigger.dismiss();
          onHoverOut?.();
        }}
      >
        {children ? (
          <>{renderedChildren}</>
        ) : (
          <>
            {icon ? (
              <View
                style={[
                  primaryStyles.btnIconCtn,
                  { flex: label ? iconFlex : 1 },
                ]}
              >
                <FontAwesome6
                  name={icon}
                  style={[
                    primaryStyles.btnIcon,
                    cusStyle.btnIcon,
                    hoverState && !disabled && cusStyle.iconHovered,
                    disabled && disabledStyles.icon,
                  ]}
                />
              </View>
            ) : null}

            {label ? (
              <View
                style={[
                  primaryStyles.btnLabelCtn,
                  { flex: icon ? labelFlex : 1 },
                ]}
              >
                <Text
                  selectable={false}
                  style={[
                    primaryStyles.btnLabel,
                    cusStyle.btnLabel,
                    hoverState && !disabled && cusStyle.labelHovered,
                    disabled && disabledStyles.label,
                  ]}
                >
                  {label}
                </Text>
              </View>
            ) : null}
          </>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  btnCtn: {
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  btn: {
    height: "100%",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 20,
  },
  bbtnIconPadding: {
    paddingLeft: 8,
  },
});

const primaryStyles = StyleSheet.create({
  btnHovered: {
    backgroundColor: "#0061a3",
  },
  btnPressed: {
    backgroundColor: "#0061a3",
  },
  btnLabelCtn: {},
  btnLabel: {
    color: "#fff",
  },
  btnIconCtn: {},
  btnIcon: {
    color: "#fff",
  },
});

const secondaryStyles = StyleSheet.create({
  btnHovered: {
    backgroundColor: "#EEEEEE",
  },
  btnPressed: {
    backgroundColor: "#E5E5E5",
  },
  btnLabelCtn: {},
  btnLabel: {
    color: "black",
  },
  btnIconCtn: {},
  btnIcon: {
    color: "#0061a3",
  },
});

const disabledStyles = StyleSheet.create({
  label: {
    color: "#9b9b9b",
  },
  icon: {
    color: "#9b9b9b",
  },
  childColor: {
    color: "#9b9b9b",
  },
});