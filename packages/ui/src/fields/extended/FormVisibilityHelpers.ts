// app/components/ui/web/form/FormVisibilityHelpers.ts
import type {
  FormVisibilityCondition,
  FormFieldConfig,
  OptionalSectionConfig,
  FormTabConfig,
} from "./FormTypes";

export type FormValues = Record<string, any>;

// ---- internal: get deep path value like ['general','department'] ----
function getValueAtPath(obj: any, path: string[]): any {
  let current = obj;
  for (const key of path) {
    if (current == null || typeof current !== "object") return undefined;
    current = current[key];
  }
  return current;
}

/**
 * Extract raw field value from either:
 *  - flat object:   { fieldName: value }
 *  - nested object: { tabId: { fieldName: value } }
 * Supports fieldRef:
 *  - "fieldName"
 *  - "tab.fieldName" (or deeper if needed)
 */
export function extractFieldValue(
  values: FormValues | undefined,
  fieldRef: string
): any {
  if (!values) return undefined;

  // explicit path, e.g. "general.department"
  if (fieldRef.includes(".")) {
    const path = fieldRef.split(".");
    return getValueAtPath(values, path);
  }

  // flat: { fieldName: value }
  if (Object.prototype.hasOwnProperty.call(values, fieldRef)) {
    return (values as any)[fieldRef];
  }

  // nested: { tabId: { fieldName: value } }
  for (const key of Object.keys(values)) {
    const group = (values as any)[key];
    if (group && typeof group === "object") {
      if (Object.prototype.hasOwnProperty.call(group, fieldRef)) {
        return group[fieldRef];
      }
    }
  }

  return undefined;
}

/**
 * Normalise raw field value so conditions can be written against primitives.
 * - RichDropdownItem => use .value
 * - array of RichDropdownItem => array of .value
 * - otherwise return as-is
 */
export function normalizeFieldValue(raw: any): any {
  if (raw == null) return raw;

  // array (e.g. multi-select)
  if (Array.isArray(raw)) {
    return raw.map((item) => {
      if (item && typeof item === "object" && "value" in item) {
        return (item as any).value;
      }
      return item;
    });
  }

  // RichDropdownItem | { value: ... }
  if (typeof raw === "object" && "value" in raw) {
    return (raw as any).value;
  }

  return raw;
}

/**
 * Core evaluator used by all forms.
 */
export function evaluateVisibilityCondition(
  condition: FormVisibilityCondition | undefined,
  values: FormValues
): boolean {
  if (!condition) return true;

  const getVal = (field: string) =>
    normalizeFieldValue(extractFieldValue(values, field));

  switch (condition.type) {
    case "equals":
      return getVal(condition.field) === condition.value;

    case "notEquals":
      return getVal(condition.field) !== condition.value;

    case "in": {
      const current = getVal(condition.field);
      if (Array.isArray(current)) {
        // if current is array, true if any intersects with values
        return current.some((v) => condition.values.includes(v));
      }
      return condition.values.includes(current);
    }

    case "notIn": {
      const current = getVal(condition.field);
      if (Array.isArray(current)) {
        // all must be outside the list
        return current.every((v) => !condition.values.includes(v));
      }
      return !condition.values.includes(current);
    }

    case "isTruthy":
      return !!getVal(condition.field);

    case "isFalsy":
      return !getVal(condition.field);

    case "and":
      return condition.conditions.every((c) =>
        evaluateVisibilityCondition(c, values)
      );

    case "or":
      return condition.conditions.some((c) =>
        evaluateVisibilityCondition(c, values)
      );

    default:
      return true;
  }
}

export function getClearedValue(fd: FormFieldConfig) {
  const t = fd.fieldType;

  // list/table
  if (fd.fieldCategory === "list") return [];

  switch (t) {
    case "text":
    case "longText":
    case "email":
    case "options":
      return ""; // string-based
    case "number":
    case "money":
    case "percentage":
      return undefined;
    case "date":
      return undefined;
    case "checkbox":
    case "bubbleSwitch":
      return false;
    case "radio":
      return undefined; // no selection
    case "dropdown":
    case "asyncDropdown":
    case "lookup":
      return undefined; // RichDropdownItem | undefined
    case "multiCheckbox":
    case "multiDropdown":
      return [];
    case "cascadingMultiDropdown":
      return {};
    case "cascadingDropdown":
      return undefined;
    case "calculated":
      return ""; // always derived anyway
    default:
      return undefined;
  }
}


// ---- convenience wrappers ----

export function isFieldVisible(
  field: FormFieldConfig,
  values: FormValues,
  mode?: string
): boolean {
  // Check visibleInModes first
  if (field.visibleInModes && mode && !field.visibleInModes.includes(mode as any)) {
    return false;
  }
  return evaluateVisibilityCondition(field.visibleWhen, values);
}

export function isOptionalSectionVisible(
  section: OptionalSectionConfig,
  values: FormValues,
  mode?: string
): boolean {
  // Check visibleInModes first
  if (section.visibleInModes && mode && !section.visibleInModes.includes(mode as any)) {
    return false;
  }
  return evaluateVisibilityCondition(section.visibleWhen, values);
}

export function isTabVisible(
  tab: FormTabConfig,
  values: FormValues,
  mode?: string
): boolean {
  // Check visibleInModes first
  if (tab.visibleInModes && mode && !tab.visibleInModes.includes(mode as any)) {
    return false;
  }
  return evaluateVisibilityCondition(tab.visibleWhen, values);
}
