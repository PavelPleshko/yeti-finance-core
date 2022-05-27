export const TASKS_SHARED_STATE = Symbol('Task actions can put some state in here');

export type TasksSharedState = Record<string, any>;
