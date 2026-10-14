import type {RichDropdownItem} from "../RichDropDown";
export type LookupPaginationConfig = {
  enabled?: boolean;
  pageSize?: number;
  mode?: "odata" | "page";
  pageParam?: string;
  pageSizeParam?: string;
  totalField?: string;
};

export type LookupDisplayColumn = {
  key: string;
  label: string;
  width?: number;
};

export type LookupItem = {
  label: string;
  value: any;
  description?: string;
  row?: Record<string, any>;
};

export type LookupFieldConfig = {
  endpoint: string;
  method?: string;
  itemsField: string;
  valueField: string;
  labelField: string;
  descriptionField?: string;
  searchFields?: string[];
  displayColumns?: LookupDisplayColumn[];
  selectFields?: string[];
  baseFilterOData?: string;
  searchMode?: "contains" | "startswith";
  pagination?: LookupPaginationConfig;
  extraQuery?: Record<string, unknown>;
};

export type LookupPageResult = {
  items: LookupItem[];
  hasMore: boolean;
  total?: number;
};

export type PaginationConfig = {
  enabled?: boolean;
  pageSize?: number;
  pageParam?: string;
  pageSizeParam?: string;
  totalField?: string;
};

export type AsyncDropdownConfig = {
  endpoint: string;
  method?: string;
  itemsField: string;
  valueField: string;
  labelField: string;
  descriptionField?: string;
  pagination?: PaginationConfig;
  extraQuery?: Record<string, unknown>;
};

export type DropdownPageResult = {
  options: RichDropdownItem[];
  hasMore: boolean;
};

