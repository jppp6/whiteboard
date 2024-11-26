import { WidgetType } from './types';

export function defaultMetadata(type: WidgetType) {
    switch (type) {
        case 'video':
        case 'sticker':
            return { url: '' };
        case 'text':
            return { text: '' };
        case 'timer':
            return { minutes: 5, seconds: 0 };
        case 'chart':
            return { dimension: 10 };
        case 'clock':
        case 'date':
        case 'checklist':
            return { checklist: [], nextId: 0 };
        default:
            return {};
    }
}
