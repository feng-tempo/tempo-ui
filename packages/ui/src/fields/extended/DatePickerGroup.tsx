import React, { useState, useRef, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    Pressable,
    Platform,
    findNodeHandle,
    ViewStyle,
    StyleProp,
} from 'react-native';
import {
    format,
    startOfMonth,
    startOfWeek,
    addDays,
    addMonths,
    addYears,
    isSameMonth,
    isSameDay,
} from 'date-fns';
import { FontAwesome6 } from '../../platform/FieldIcons.web';
import FieldClearButton from './FieldClearButton';

import {
    openDropdownPanel,
    closeDropdownPanel,
} from './Overlay';

import { isInDropdownPanel } from './Overlay';

export type DateInputProps = {
    value?: any;
    onChange?: (date: any) => void;
    onFocus?: () => void;
    onBlur?: () => void;
    style?: StyleProp<ViewStyle>;
    disabled?: boolean;
    compact?: boolean;
};

type CalendarViewMode = 'date' | 'month' | 'year';

const MONTH_LABELS = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
];

export default function DateInput({
    onChange,
    value,
    style,
    onFocus,
    onBlur,
    disabled = false,
    compact = false,
}: DateInputProps) {
    const initialDate = value ? new Date(value) : null;
    const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate);
    const [open, setOpen] = useState(false);
    const [, setInputFocus] = useState<boolean>(false);

    const wrapperRef = useRef<View>(null);
    const pressableRef = useRef<View>(null);
    const closingBySelectRef = useRef(false); // distinguish close-by-select vs close-by-blur

    const isWeb = Platform.OS === 'web';

    useEffect(() => {
        setSelectedDate(value ? new Date(value) : null);
    }, [value]);

    // 🔑 Global keyboard listener (web): close panel on ArrowUp/ArrowDown
    useEffect(() => {
        if (!isWeb) return;

        const handleKey = (e: KeyboardEvent) => {
            if (!open) return;

            if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                // Close panel like a blur, but don't block default scroll
                closeDropdownPanel();
                setOpen(false);
                setInputFocus(false);
                onBlur?.();
            }
        };

        window.addEventListener('keydown', handleKey);
        return () => {
            window.removeEventListener('keydown', handleKey);
        };
    }, [isWeb, open, onBlur]);

    const handleOpen = () => {
        if (disabled) return;

        if (isWeb) {
            if (open) {
                // toggle close -> treat as real blur
                closeDropdownPanel();
                setOpen(false);
                setInputFocus(false);
                onBlur?.();
                return;
            }

            setOpen(true);
            setInputFocus(true);
            onFocus?.();

            let anchor: any = undefined;
            const node: any = findNodeHandle(wrapperRef.current);
            if (node instanceof HTMLElement) {
                anchor = node;
            } else if (node && node.parentElement) {
                anchor = node.parentElement;
            }

            openDropdownPanel({
                id: 'datePicker',
                anchorRef: anchor,
                collision: true,
                preferredWidth: 300,
                align: 'right',
                onClose: () => {
                    setOpen(false);

                    // If we are closing because of a date selection, skip blur.
                    if (closingBySelectRef.current) {
                        closingBySelectRef.current = false;
                        // keep inputFocus = true so TabForm highlight stays
                        return;
                    }

                    // Real close (click outside / Esc / blur)
                    setInputFocus(false);
                    onBlur?.();
                },
                content: (close) => (
                    <View style={styles.calendarPanel}>
                        <CalendarPanelContent
                            selectedDate={selectedDate}
                            onSelect={(date) => handleSelect(date, close)}
                        />
                    </View>
                ),
            });

            return;
        }

        // non-web inline mode
        if (!open) {
            setOpen(true);
            setInputFocus(true);
            onFocus?.();
        } else {
            setOpen(false);
            setInputFocus(false);
            onBlur?.();
        }
    };

    const handleSelect = (date: Date | null, closeFn?: () => void) => {
        if (disabled) return;
        setSelectedDate(date);
        onChange?.(date);

        if (isWeb) {
            // mark that we are closing due to a selection
            closingBySelectRef.current = true;

            if (closeFn) {
                closeFn();
            } else {
                closeDropdownPanel();
            }
            setOpen(false);
            // keep inputFocus = true so highlight stays

            // put DOM focus back to the main box so Tab works normally
            setTimeout(() => {
                const node: any = findNodeHandle(pressableRef.current);
                if (node instanceof HTMLElement) {
                    node.focus();
                }
            }, 0);
        } else {
            setOpen(false);
            setInputFocus(false);
            onBlur?.();
        }
    };

    const handleClear = (event?: any) => {
        if (disabled) return;

        event?.stopPropagation?.();
        event?.preventDefault?.();

        setSelectedDate(null);
        onChange?.(null);

        if (open) {
            closeDropdownPanel();
            setOpen(false);
        }

        setInputFocus(false);
        onBlur?.();
    };

    const handleFocus = () => {
        onFocus?.();
        setInputFocus(true);
    };

    const handleBlur = (e: any) => {
        if (isWeb) {
            const nextFocus =
                (e?.nativeEvent?.relatedTarget as HTMLElement | null) ||
                (document.activeElement as HTMLElement | null);

            // If panel is open and nextFocus is inside dropdown panel → ignore blur
            if (open && isInDropdownPanel(nextFocus)) {
                return;
            }

            // Real blur (Tab or click outside)
            if (open) {
                closeDropdownPanel();
                setOpen(false);
            }

            setInputFocus(false);
            onBlur?.();
            return;
        }

        // Native logic stays the same
        const nextFocus = e.relatedTarget as HTMLElement | null;
        const node: any = findNodeHandle(wrapperRef.current);
        if (
            node &&
            nextFocus &&
            node instanceof HTMLElement &&
            node.contains(nextFocus)
        ) {
            return;
        }

        setOpen(false);
        setInputFocus(false);
        onBlur?.();
    };

    const hasClearButton = Boolean(selectedDate && !disabled);

    return (
        <View style={[styles.controlRow, compact && styles.compactRow]}>
            <View style={styles.container} ref={wrapperRef}>
                <Pressable
                    ref={pressableRef}
                    onPress={handleOpen}
                    style={() => [styles.inputWrapper, disabled && styles.inputWrapperDisabled, style, compact && styles.compactInput]}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    disabled={disabled}
                    accessibilityState={{ disabled }}
                >
                    <Text
                        numberOfLines={compact ? 1 : undefined}
                        style={[
                            styles.inputText,
                            compact && styles.compactText,
                            !selectedDate && styles.inputPlaceholderText,
                            disabled && styles.inputTextDisabled,
                        ]}
                    >
                        {selectedDate ? format(selectedDate, 'dd/MM/yyyy') : 'Select date'}
                    </Text>

                    {!disabled && (
                        <FontAwesome6 name="calendar" style={styles.calendarIcon} />
                    )}
                </Pressable>

                {/* Inline calendar only for non-web */}
                {open && !isWeb && (
                    <View style={styles.calendar}>
                        <CalendarPanelContent
                            selectedDate={selectedDate}
                            onSelect={(date) => handleSelect(date)}
                        />
                    </View>
                )}
            </View>

            <FieldClearButton
                accessibilityLabel="Clear date"
                disabled={!hasClearButton}
                onPress={handleClear}
            />
        </View>
    );
}

/** Calendar content used both in global panel (web) and inline (native) */
export type CalendarPanelContentProps = {
    selectedDate: Date | null;
    onSelect: (date: Date) => void;
};

function CalendarPanelContent({ selectedDate, onSelect }: CalendarPanelContentProps) {
    const [currentMonth, setCurrentMonth] = useState<Date>(
        selectedDate || new Date()
    );
    const [viewMode, setViewMode] = useState<CalendarViewMode>('date');

    const getDaysArray = () => {
        const startDate = startOfWeek(startOfMonth(currentMonth));
        const days: Date[] = [];
        let day = startDate;

        // Always 6 weeks = 42 days → fixed height panel
        for (let i = 0; i < 42; i++) {
            days.push(new Date(day));
            day = addDays(day, 1);
        }

        return days;
    };

    const currentYear = currentMonth.getFullYear();
    const today = new Date();
    const yearRangeStart = Math.floor(currentYear / 12) * 12;
    const yearRange = Array.from({ length: 12 }, (_item, index) => yearRangeStart + index);
    const days = getDaysArray();
    const headerLabel =
        viewMode === 'date'
            ? format(currentMonth, 'MMMM yyyy')
            : viewMode === 'month'
                ? format(currentMonth, 'yyyy')
                : `${yearRangeStart} - ${yearRangeStart + 11}`;

    const handlePrevious = () => {
        if (viewMode === 'date') {
            setCurrentMonth((prev) => addMonths(prev, -1));
            return;
        }
        if (viewMode === 'month') {
            setCurrentMonth((prev) => addYears(prev, -1));
            return;
        }
        setCurrentMonth((prev) => addYears(prev, -12));
    };

    const handleNext = () => {
        if (viewMode === 'date') {
            setCurrentMonth((prev) => addMonths(prev, 1));
            return;
        }
        if (viewMode === 'month') {
            setCurrentMonth((prev) => addYears(prev, 1));
            return;
        }
        setCurrentMonth((prev) => addYears(prev, 12));
    };

    const handleLabelPress = () => {
        if (viewMode === 'date') {
            setViewMode('month');
            return;
        }
        if (viewMode === 'month') {
            setViewMode('year');
        }
    };

    const handleMonthSelect = (monthIndex: number) => {
        setCurrentMonth((prev) => new Date(prev.getFullYear(), monthIndex, 1));
        setViewMode('date');
    };

    const handleYearSelect = (year: number) => {
        setCurrentMonth((prev) => new Date(year, prev.getMonth(), 1));
        setViewMode('month');
    };

    return (
        <View>
            <View style={styles.header}>
                <Pressable
                    onPress={handlePrevious}
                    // don't take focus, avoid blurring main input
                    tabIndex={-1}
                    focusable={false}
                    style={({ hovered }: any) => [
                        styles.navButton,
                        hovered && styles.navButtonHovered,
                    ]}
                >
                    <FontAwesome6 name="arrow-left-long" style={styles.navButtonIcon} />
                </Pressable>

                <Pressable
                    onPress={handleLabelPress}
                    disabled={viewMode === 'year'}
                    tabIndex={-1}
                    focusable={false}
                    style={({ hovered }: any) => [
                        styles.monthLabelButton,
                        hovered && viewMode !== 'year' && styles.monthLabelButtonHovered,
                    ]}
                >
                    <Text style={styles.monthLabel}>{headerLabel}</Text>
                </Pressable>

                <Pressable
                    onPress={handleNext}
                    // don't take focus
                    tabIndex={-1}
                    focusable={false}
                    style={({ hovered }: any) => [
                        styles.navButton,
                        hovered && styles.navButtonHovered,
                    ]}
                >
                    <FontAwesome6 name="arrow-right-long" style={styles.navButtonIcon} />
                </Pressable>
            </View>

            <View style={styles.calendarBody}>
                {viewMode === 'date' ? (
                    <>
                        <View style={styles.weekdays}>
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                                <Text key={day} style={styles.weekdayText}>
                                    {day}
                                </Text>
                            ))}
                        </View>

                        <View style={styles.daysGrid}>
                            {days.map((day, index) => {
                                const isDisabled = !isSameMonth(day, currentMonth);
                                const isSelected = selectedDate && isSameDay(day, selectedDate);
                                const isToday = isSameDay(day, today);

                                return (
                                    <Pressable
                                        key={index}
                                        disabled={isDisabled}
                                        onPress={() => onSelect(day)}
                                        // don't steal focus from main input
                                        tabIndex={-1}
                                        focusable={false}
                                        style={({ hovered }: any) => [
                                            styles.day,
                                            hovered && !isDisabled && styles.dayHovered,
                                            isDisabled && styles.dayDisabled,
                                            isToday && !isSelected && !isDisabled && styles.currentOption,
                                            isSelected && styles.daySelected,
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.dayText,
                                                isDisabled && styles.textDisabled,
                                                isToday && !isSelected && !isDisabled && styles.currentOptionText,
                                                isSelected && styles.textSelected,
                                            ]}
                                        >
                                            {day.getDate()}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </>
                ) : viewMode === 'month' ? (
                    <View style={styles.monthGrid}>
                        {MONTH_LABELS.map((month, index) => {
                            const isSelected =
                                selectedDate &&
                                selectedDate.getFullYear() === currentYear &&
                                selectedDate.getMonth() === index;
                            const isCurrentMonth =
                                today.getFullYear() === currentYear && today.getMonth() === index;

                            return (
                                <Pressable
                                    key={month}
                                    onPress={() => handleMonthSelect(index)}
                                    tabIndex={-1}
                                    focusable={false}
                                    style={({ hovered }: any) => [
                                        styles.monthOption,
                                        hovered && styles.dayHovered,
                                        isCurrentMonth && !isSelected && styles.currentOption,
                                        isSelected && styles.daySelected,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.monthOptionText,
                                            isCurrentMonth && !isSelected && styles.currentOptionText,
                                            isSelected && styles.textSelected,
                                        ]}
                                    >
                                        {month}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                ) : (
                    <View style={styles.monthGrid}>
                        {yearRange.map((year) => {
                            const isSelected = selectedDate?.getFullYear() === year;
                            const isCurrentYear = today.getFullYear() === year;

                            return (
                                <Pressable
                                    key={year}
                                    onPress={() => handleYearSelect(year)}
                                    tabIndex={-1}
                                    focusable={false}
                                    style={({ hovered }: any) => [
                                        styles.monthOption,
                                        hovered && styles.dayHovered,
                                        isCurrentYear && !isSelected && styles.currentOption,
                                        isSelected && styles.daySelected,
                                    ]}
                                >
                                    <Text
                                        style={[
                                            styles.monthOptionText,
                                            isCurrentYear && !isSelected && styles.currentOptionText,
                                            isSelected && styles.textSelected,
                                        ]}
                                    >
                                        {year}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create<any>({
    compactRow: { height: 29 },
    compactInput: { height: 29, justifyContent: 'center', paddingTop: 0, paddingBottom: 0 },
    compactText: { paddingRight: 0 },
    controlRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'stretch',
    },
    container: {
        flex: 1,
        minWidth: 0,
        position: 'relative',
    },
    inputWrapper: {
        borderWidth: 1,
        borderColor: '#A0A0A0',
        backgroundColor: '#fff',
        paddingTop: 4,
        paddingBottom: 4,
        paddingLeft: 8,
        paddingRight: 25,
        position: 'relative',
        ...Platform.select({
            web: {
                outlineStyle: "none",
                outlineWidth: 0,
                outlineColor: "transparent",
            },
        }),
    },
    inputWrapperDisabled: {
        backgroundColor: '#FAFAFA',
    },
    inputText: {
        fontSize: 13,
        color: '#333',
        paddingRight: 60,
        // @ts-ignore web only
        userSelect: 'none',
        fontWeight: '400',
    },
    inputPlaceholderText: {
        color: '#8A8886',
    },
    inputTextDisabled: {
        color: '#323130',
    },
    // Inline calendar (non-web)
    calendar: {
        position: 'absolute',
        top: 35,
        right: 0,
        width: 300,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 6,
        // @ts-ignore web only
        boxShadow: '0px 2px 5px rgba(0,0,0,0.1)',
        elevation: 5,
        zIndex: 100,
        ...Platform.select({
            web: {
                userSelect: 'none',
            },
        }),
    },
    // Global panel content (web)
    calendarPanel: {
        width: 300,
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 6,
        ...Platform.select({
            web: {
                userSelect: 'none',
            },
        }),
    },
    calendarIcon: {
        position: 'absolute',
        fontSize: 14,
        right: 10,
        top: 0,
        height: '100%',
        alignItems: 'center',
        alignContent: 'center',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    navButton: {
        padding: 6,
    },
    navButtonIcon: {
        fontSize: 14,
    },
    navButtonHovered: {
        backgroundColor: '#f0f0f0',
    },
    monthLabelButton: {
        padding: 6,
        minWidth: 132,
        alignItems: 'center',
    },
    monthLabelButtonHovered: {
        backgroundColor: '#f0f0f0',
    },
    monthLabel: {
        fontWeight: '600',
        fontSize: 14,
        userSelect: 'none' as any,
    },
    weekdays: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 3,
    },
    calendarBody: {
        height: 226,
    },
    weekdayText: {
        flex: 1,
        textAlign: 'center',
        fontWeight: '500',
        color: '#666',
        userSelect: 'none' as any,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    monthGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        height: '100%',
        paddingVertical: 6,
    },
    monthOption: {
        width: '25%',
        alignItems: 'center',
        justifyContent: 'center',
        height: '33.33%',
        marginVertical: 2,
    },
    monthOptionText: {
        fontSize: 13,
        color: '#000',
        userSelect: 'none' as any,
    },
    day: {
        width: '14.28%', // 7 days in a row
        alignItems: 'center',
        paddingVertical: 6,
        marginVertical: 2,
    },
    dayHovered: {
        backgroundColor: '#f0f0f0',
    },
    currentOption: {
        boxShadow: 'inset 0 0 0 1px #007aff',
        backgroundColor: '#eef6ff',
    },
    currentOptionText: {
        color: '#005a9e',
        fontWeight: '600',
    },
    daySelected: {
        backgroundColor: '#007aff',
    },
    dayDisabled: {
        backgroundColor: '#f0f0f0',
    },
    dayText: {
        fontSize: 13,
        color: '#000',
        userSelect: 'none' as any,
    },
    textSelected: {
        color: '#fff',
        fontWeight: '600',
    },
    textDisabled: {
        color: '#aaa',
    },
});
