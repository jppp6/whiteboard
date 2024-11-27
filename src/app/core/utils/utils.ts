import { WidgetType } from './types';

export function defaultMetadata(type: WidgetType) {
    switch (type) {
        case 'video':
            return { url: '' };
        case 'sticker-s':
            return { stickerB64: '', size: 's' };
        case 'sticker-l':
            return { stickerB64: '', size: 'l' };
        case 'text':
            return { text: '' };
        case 'timer':
            return { minutes: 5, seconds: 0 };
        case 'chart':
            return { dimension: 6 };
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
