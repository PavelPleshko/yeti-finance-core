import { DEV_RE } from '../../utils/misc';

import type { TasksSharedState } from '../constants/tasks-state';
import { TASKS_SHARED_STATE } from '../constants/tasks-state';


export const pushState = <S extends TasksSharedState> (reducerFn: (state: S) => Partial<S>): void => {
    // TODO fix typing here
    const sharedState = (DEV_RE as any)[TASKS_SHARED_STATE] as S;

    (DEV_RE as any)[TASKS_SHARED_STATE] = {
        ...sharedState,
        ...reducerFn(sharedState),
    };
};

export const selectState = <S extends TasksSharedState, T = any> (selectorFn: (state: S) => T): T => {
    const sharedState = (DEV_RE as any)[TASKS_SHARED_STATE] as S;

    return selectorFn(sharedState);
};

