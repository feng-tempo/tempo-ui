/** Structural UI view; compatible with Core. Auth, target resolution and audit storage stay in the application. */
export type TempoCommentView={id:string;content:string;createdAt:string;createdBy:{displayName:string};updatedAt?:string;_etag?:string;canEdit:boolean;canDelete:boolean};
/** Consumer refreshes comments after success. onDelete must perform authorized soft deletion retaining audit history. Etag guards stale writes; reject on conflicts/errors. */
export type CommentMutationAdapters={onCreate:(content:string)=>Promise<void>;onUpdate:(id:string,content:string,etag?:string)=>Promise<void>;onDelete:(id:string,etag?:string)=>Promise<void>};
