type ExplorerType = 'search_space' | 'algorithm';

type ExplorerState = {
    backend: string,
    explorer: ExplorerType,
    state: string[],
    messageBox: string,
};

type ExplorerRequest = {
    state: string[],
    predicate: string,
    args: string[],
};

type ExplorerPredicate = {
    name: string,
    additional_args: string[],
};

type ExplorerChild = {
    value: string,
    caption: string,
    label?: string,
};

type ExplorerResponse = {
    state: string[],
    valid: boolean,
    info: string,
    children: ExplorerChild[],
    message: string,
    download_url?: string,
    available_predicates?: ExplorerPredicate[], // Only if predicate is 'help'
    help_message?: string, // Only if predicate is 'help'
};

export type {
    ExplorerType,
    ExplorerState,
    ExplorerRequest,
    ExplorerPredicate,
    ExplorerChild,
    ExplorerResponse,
};
