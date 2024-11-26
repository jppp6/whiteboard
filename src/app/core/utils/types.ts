export interface CanvasPosition {
    x: number;
    y: number;
}

export interface Widget {
    id: string;
    type: WidgetType;
    x: number;
    y: number;
    metadata: any;
}

export interface WidgetSelector {
    type: WidgetType;
    icon: string;
    tooltip: string;
}

export interface Whiteboard {
    id: string;
    name: string;
}

export interface ChecklistItem {
    id: number;
    text: string;
    completed: boolean;
}

export type WidgetType =
    | 'timer'
    | 'video'
    | 'text'
    | 'sticker'
    | 'chart'
    | 'date'
    | 'clock'
    | 'checklist';
