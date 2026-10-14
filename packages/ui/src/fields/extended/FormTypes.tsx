// ---------- Validation ----------

export type ValidationRule = {
  required?: string;
  requiredMappedFields?: Array<{
    fieldName: string;
    message?: string;
  }>;
  minLength?: { value: number; message: string };
  maxLength?: { value: number; message: string };
  min?: { value: number; message: string };
  max?: { value: number; message: string };
  pattern?: { value: RegExp | string; message: string };
  validate?:
  | ((value: any) => boolean | string)
  | Record<string, (value: any) => boolean | string>;
};

export type ValidationRules = Record<string, ValidationRule | undefined>;

export type ServerValidationRuleConfig = {
  key: string;
  params?: Record<string, unknown>;
};

export type FormReviewValidationError = {
  path?: string;
  code?: string;
  message: string;
};

export type FormReviewValidationResult = {
  valid: boolean;
  errors?: FormReviewValidationError[];
  warnings?: FormReviewValidationError[];
  calculatedValues?: Record<string, unknown>;
};


// ---------- Visibility ----------

export type FormVisibilityCondition =
  | {
    type: "equals";
    field: string;
    value: any;
  }
  | {
    type: "notEquals";
    field: string;
    value: any;
  }
  | {
    type: "in";
    field: string;
    values: any[];
  }
  | {
    type: "notIn";
    field: string;
    values: any[];
  }
  | {
    type: "isTruthy";
    field: string;
  }
  | {
    type: "isFalsy";
    field: string;
  }
  | {
    type: "exists";
    field: string;
  }
  | {
    type: "notExists";
    field: string;
  }
  | {
    type: "and";
    conditions: FormVisibilityCondition[];
  }
  | {
    type: "or";
    conditions: FormVisibilityCondition[];
  };


// ---------- Core field / value types ----------

export type TextValue = {
  text: string;
  type: "text" | "link";
  valueProps?: Record<string, any>;
};

export type LinkValue = TextValue & {
  link: string;
};

export type FormFieldType =
  | "text"
  | "longText"
  | "date"
  | "number"
  | "email"
  | "dropdown"
  | "multiCheckbox"
  | "multiDropdown"
  | "cascadingMultiDropdown"
  | "lookup"
  | "options"
  | "calculated"
  | "bubbleSwitch"
  | "radio"
  | "instruction"
  | "checkbox"
  | "table"
  | "money"
  | "percentage"
  | "asyncDropdown"
  | "cascadingDropdown"
  | "sectionTitle"
  | string;

export type FormFieldCategory =
  | "form"
  | "noneForm"
  | "list"
  | "formReview"
  | string;

export type BaseFormFieldConfig = {
  fieldName: string;
  fieldLabel?: string;
  fieldType: FormFieldType;
  fieldCategory: FormFieldCategory;
  multiRows?: boolean;
  layoutWidth?: "standard" | "full";

  value?: Array<TextValue | LinkValue> | any;

  // NEW: for create-mode default form value
  defaultValue?: any;

  validation?: ValidationRule;
  calculated?: {
    source?: "client" | "server" | "clientThenServer";
    formula?: string;
    key?: string;
    engineVersion?: string;
    dependsOn?: string[];
    resourceQuery?: {
      resourceSet: string;
      resourceType: string;
      resourceKeyTemplate?: string;
      versionPolicy?: "latest" | "effectiveDate" | "exact";
      version?: string;
      effectiveDatePath?: string;
    };
    inputs?: Record<string, unknown>;
  };
  serverValidation?: Array<ServerValidationRuleConfig | string>;
  componentProps?: Record<string, any>;
  visibleWhen?: FormVisibilityCondition;
  visibleInModes?: FormMode[];
  clearOnHide?: boolean;
  resetWhenFieldsChange?: string[];
  /** Ordered conditions may read any tab.field path. Last matching override wins. */
  linkedRules?: Array<{
    when: FormVisibilityCondition;
    componentProps?: Record<string, any>;
    value?: any;
  }>;
};

export type FormFieldConfig = BaseFormFieldConfig;


// ---------- Optional section config ----------

export type OptionalSectionConfig = {
  id: string;
  title?: string;
  description?: string;
  fields: FormFieldConfig[];
  visibleWhen?: FormVisibilityCondition;
  visibleInModes?: FormMode[];
  clearOnHide?: boolean;
};


// ---------- SingleForm config ----------

export type SingleFormConfig = {
    key?: string;
  width?: FormLayoutWidth;
  name?: string;
  version?: string;
  formType?: "singleForm";
  fields: FormFieldConfig[];
  optionalSections?: OptionalSectionConfig[];
};


// ---------- TabForm config ----------

export type FormTabConfig = {
  tabLabel: string;
  viewTab?: boolean;
  fields?: FormFieldConfig[];
  visibleWhen?: FormVisibilityCondition;
  visibleInModes?: FormMode[];
  clearOnHide?: boolean;
};

export type TabFormConfig = {
  width?: FormLayoutWidth;
  name: string;
  key?: string;
  version: string;
  formType?: "tabForm";
  formConfig: Record<string, FormTabConfig>;
};

export type FormMode = "create" | "update" | "review";

export type FormPreviewFocusTarget = {
  tabKey?: string;
  fieldName: string;
  requestId: number;
};

export type FormLayoutWidth = number | "auto";

export type TabFormProps<T extends TabFormConfig> = {
  formConfig: T;

  // NEW
  mode?: FormMode;
  initialData?: Partial<FormDataFromTabConfig<T>>;
  disabled?: boolean;
  submitButtonText?: string;
  submitActions?: readonly { key: string; label: string }[];
  reviewButtonText?: string;
  reviewOnly?: boolean;
  validateOnReview?: boolean;
  previewFocusTarget?: FormPreviewFocusTarget;
  width?: FormLayoutWidth;

  onFormSubmit?: (data: any, actionKey?: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
  recordHrid?: string;
  onReviewValidate?: (data: any) => Promise<FormReviewValidationResult | void>;
};


// ---------- Unified form definition ----------

export type FormDefinitionType = "singleForm" | "tabForm";

export type FormDefinitionConfig =
  | {
    name: string;
    key: string;
    version: string;
    formType: "singleForm";
    formConfig: SingleFormConfig;
  }
  | {
    name: string;
    key: string;
    version: string;
    formType: "tabForm";
    formConfig: Record<string, FormTabConfig>;
  };


// ---------- Form meta result ----------

export type FormMetaResult<TConfig = FormDefinitionConfig> = {
  entityType: string;
  formKey: string;
  version: string;
  templateId?: string;
  templateLabel?: string;
  formDefinition: TConfig;
};


// ---------- Data mapping helpers ----------

export type FieldTypeToTSType<T extends string> =
  T extends
  | "text"
  | "longText"
  | "email"
  | "dropdown"
  | "options"
  | "calculated"
  | "radio"
  | "instruction"
  | "asyncDropdown"
  | "lookup"
  | "cascadingDropdown"
  ? string
  : T extends "multiCheckbox" | "multiDropdown"
  ? any[]
  : T extends "cascadingMultiDropdown"
  ? Record<string, any>
  : T extends "number" | "money" | "percentage"
  ? number
  : T extends "date"
  ? Date | string
  : T extends "bubbleSwitch" | "checkbox"
  ? boolean
  : T extends "table"
  ? any[]
  : any;

export type FormDataFromTabConfig<T extends TabFormConfig> = {
  [Tab in keyof T["formConfig"]]: T["formConfig"][Tab] extends { fields: infer Fields }
  ? Fields extends readonly FormFieldConfig[]
  ? {
    [Field in Fields[number]as Field["fieldName"]]: FieldTypeToTSType<Field["fieldType"]>;
  }
  : Record<string, any>
  : Record<string, any>;
};

export type FormDataFromSingleConfig<T extends SingleFormConfig> =
  T["fields"] extends readonly FormFieldConfig[]
  ? {
    [Field in T["fields"][number]as Field["fieldName"]]: FieldTypeToTSType<Field["fieldType"]>;
  }
  : Record<string, any>;
