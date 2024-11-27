import { WidgetType } from './types';

export function defaultMetadata(type: WidgetType) {
    switch (type) {
        case 'video':
            return { url: '', height: 300, width: 500 };
        case 'sticker':
            return { stickerB64: '', width: 132, height: 132 };
        case 'text':
            return { text: '', height: 300, width: 500 };
        case 'timer':
            return { minutes: 5, seconds: 0 };
        case 'chart':
            return { dimension: 6, width: 256 };
        case 'checklist':
            return { checklist: [], nextId: 0 };
        case 'groups':
            return { people: [], nextId: 0 };
        case 'calendar':
        case 'clock':
        case 'date':
        default:
            return {};
    }
}
