import {useFieldAdapters} from "./FieldAdapters";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import DropdownGroup from '../RichDropDown';
import LookupField from './LookupField';
import ErrorPanel from '../../comments/support/ErrorPanel';
import { extractFieldValue, normalizeFieldValue } from './FormVisibilityHelpers';
import {  type LookupFieldConfig, type LookupItem } from './adapterTypes';

type Props = {
    value?: LookupItem | null;
    onChange?: (value: { label: string; value: unknown } | null) => void;
    onSelectionChange?: (item: LookupItem | null) => void;
    lookupConfig: LookupFieldConfig;
    queryFieldPaths?: Record<string, string>;
    getValues?: (key?: any) => any;
    placeholder?: string;
    prerequisiteMessage?: string;
    disabled?: boolean;
    style?: any;
    onFocus?: () => void;
    onBlur?: () => void;
};

/** Choose existing shared controls from the size of the current scoped reference list. */
export default function ReferenceDataSelectionField({ value, onChange, onSelectionChange, lookupConfig, queryFieldPaths,
    getValues, placeholder, prerequisiteMessage, disabled, style, onFocus, onBlur }: Props) {
 const {loadLookupPageFromConfig}=useFieldAdapters();
    const formValues = getValues?.() ?? {};
    const query = Object.fromEntries(Object.entries(queryFieldPaths ?? {}).map(([key, path]) =>
        [key, normalizeFieldValue(extractFieldValue(formValues, path))]));
    const contextKey = JSON.stringify(query);
    const prerequisiteMissing = Object.values(query).some(item => item == null || item === '');
    const resolvedConfig = useMemo(() => ({ ...lookupConfig,
        extraQuery: { ...lookupConfig.extraQuery, ...JSON.parse(contextKey) },
    }), [lookupConfig, contextKey]);
    const [state, setState] = useState<{ config?: LookupFieldConfig; items: LookupItem[]; lookup: boolean; error?: unknown }>({ items: [], lookup: false });
    const priorContext = useRef(contextKey);
    const onChangeRef = useRef(onChange);
    onChangeRef.current = onChange;
    const valueRef = useRef(value);
    valueRef.current = value;

    useEffect(() => {
        if (priorContext.current !== contextKey && !disabled) onChangeRef.current?.(null);
        priorContext.current = contextKey;
    }, [contextKey, disabled]);

    useEffect(() => {
        if (prerequisiteMissing || disabled) return;
        let active = true;
        loadLookupPageFromConfig(resolvedConfig, { page: 1, pageSize: 100 }).then(async result => {
            if (!active) return;
            const selected = valueRef.current?.value;
            if (selected != null && !result.items.some(item => item.value === selected)) {
                // A valid selection can be beyond the first 100 rows. Verify only that identity.
                const valid = result.hasMore ? (await loadLookupPageFromConfig({ ...resolvedConfig,
                    extraQuery: { ...resolvedConfig.extraQuery, selectedValue: selected },
                }, { page: 1, pageSize: 1 })).items.some(item => item.value === selected) : false;
                if (active && !valid && valueRef.current?.value === selected) onChangeRef.current?.(null);
            }
            if (active) setState({ config: resolvedConfig, items: result.items, lookup: result.hasMore });
        }).catch(error => { if (active) setState({ config: resolvedConfig, items: [], lookup: false, error }); });
        return () => { active = false; };
    }, [resolvedConfig, prerequisiteMissing, disabled]);

    const ready = state.config === resolvedConfig;
    const select = (item: LookupItem | string | null | undefined) => {
        const selected = item && typeof item === 'object' ? item : null;
        onSelectionChange?.(selected);
        onChange?.(selected ? { label: selected.label, value: selected.value } : null);
    };
    const common = { value, placeholder: prerequisiteMissing ? prerequisiteMessage : placeholder,
        onChange: select, style, onFocus, onBlur, disabled: disabled || prerequisiteMissing };
    return <View style={styles.field}>
        <View style={styles.control}>
            {ready && state.lookup ? <LookupField {...common} lookupConfig={resolvedConfig} /> :
                <DropdownGroup {...common} value={value ?? undefined} options={ready ? state.items : []}
                    isLoading={!ready && !prerequisiteMissing && !disabled}
                    disabled={common.disabled || !ready || !!state.error} />}
        </View>
        {ready && state.error ? <ErrorPanel compact
            context={{ service: 'Reference Data', kind: 'list', component: lookupConfig.displayColumns?.[0]?.label ?? 'Reference choices' }}
            error={state.error} /> : null}
    </View>;
}

const styles = StyleSheet.create<any>({
    field: { width: '100%', minWidth: 0, gap: 6 },
    // Use the shared control's natural height; error content stays outside this row.
    control: { width: '100%', flexShrink: 0 },
});
