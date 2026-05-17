import { h, type FunctionalComponent, type SVGAttributes } from 'vue'

interface IconProps extends SVGAttributes {
  size?: number
  className?: string
}

function ic(children: () => ReturnType<typeof h>[], vb = '0 0 24 24'): FunctionalComponent<IconProps> {
  return (props) =>
    h(
      'svg',
      {
        width: props.size ?? 16,
        height: props.size ?? 16,
        viewBox: vb,
        fill: 'none',
        stroke: 'currentColor',
        'stroke-width': '1.75',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        class: 'ic ' + (props.class ?? ''),
        style: props.style,
        'aria-hidden': 'true',
      },
      children()
    )
}

export const Icons = {
  Home: ic(() => [h('path', { d: 'M3 10.5 12 4l9 6.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z' })]),
  Agents: ic(() => [
    h('circle', { cx: '9', cy: '9', r: '3.2' }),
    h('circle', { cx: '17', cy: '13', r: '2.4' }),
    h('path', { d: 'M3.5 19c.6-2.5 2.9-4 5.5-4s4.9 1.5 5.5 4' }),
    h('path', { d: 'M14.5 18.5c.6-1.5 2-2.4 3.5-2.4s2.9.9 3.5 2.4' }),
  ]),
  Plus: ic(() => [h('path', { d: 'M12 5v14M5 12h14' })]),
  Settings: ic(() => [
    h('circle', { cx: '12', cy: '12', r: '3' }),
    h('path', { d: 'M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z' }),
  ]),
  Search: ic(() => [h('circle', { cx: '11', cy: '11', r: '7' }), h('path', { d: 'm21 21-4.3-4.3' })]),
  Bell: ic(() => [
    h('path', { d: 'M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9' }),
    h('path', { d: 'M10.3 21a1.94 1.94 0 0 0 3.4 0' }),
  ]),
  Chevron: ic(() => [h('path', { d: 'm9 18 6-6-6-6' })]),
  ChevronDown: ic(() => [h('path', { d: 'm6 9 6 6 6-6' })]),
  ChevronUp: ic(() => [h('path', { d: 'm18 15-6-6-6 6' })]),
  ChevronRight: ic(() => [h('path', { d: 'm9 18 6-6-6-6' })]),
  ArrowRight: ic(() => [h('path', { d: 'M5 12h14M13 6l6 6-6 6' })]),
  ArrowLeft: ic(() => [h('path', { d: 'M19 12H5M11 18l-6-6 6-6' })]),
  ArrowUp: ic(() => [h('path', { d: 'm6 9 6-6 6 6' }), h('path', { d: 'M12 3v18' })]),
  ArrowDown: ic(() => [h('path', { d: 'm6 15 6 6 6-6' }), h('path', { d: 'M12 21V3' })]),
  Trend: ic(() => [h('path', { d: 'M22 7 13.5 15.5 8.5 10.5 2 17' }), h('path', { d: 'M16 7h6v6' })]),
  Check: ic(() => [h('path', { d: 'M20 6 9 17l-5-5' })]),
  X: ic(() => [h('path', { d: 'M18 6 6 18M6 6l12 12' })]),
  Phone: ic(() => [h('path', { d: 'M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2.05 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.16a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' })]),
  Voicemail: ic(() => [h('circle', { cx: '6', cy: '12', r: '4' }), h('circle', { cx: '18', cy: '12', r: '4' }), h('path', { d: 'M6 16h12' })]),
  Hangup: ic(() => [
    h('path', { d: 'M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2.05 4.18 2 2 0 0 1 4 2' }),
    h('path', { d: 'm17 7-10 10' }),
    h('path', { d: 'm7 7 10 10' }),
  ]),
  Transfer: ic(() => [
    h('path', { d: 'M3 7h14' }),
    h('path', { d: 'm13 3 4 4-4 4' }),
    h('path', { d: 'M21 17H7' }),
    h('path', { d: 'm11 21-4-4 4-4' }),
  ]),
  Calls: ic(() => [h('path', { d: 'M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2.05 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.16a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z' })]),
  Target: ic(() => [h('circle', { cx: '12', cy: '12', r: '9' }), h('circle', { cx: '12', cy: '12', r: '5' }), h('circle', { cx: '12', cy: '12', r: '1' })]),
  Bulb: ic(() => [h('path', { d: 'M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.4 1 1 1 1.7V18h6v-1.6c0-.7.4-1.3 1-1.7A7 7 0 0 0 12 2z' })]),
  Sliders: ic(() => [h('path', { d: 'M4 21V14M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6' })]),
  History: ic(() => [h('path', { d: 'M3 12a9 9 0 1 0 3-6.7L3 8' }), h('path', { d: 'M3 3v5h5' }), h('path', { d: 'M12 7v5l3 2' })]),
  Doc: ic(() => [
    h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
    h('path', { d: 'M14 2v6h6' }),
    h('path', { d: 'M9 13h6M9 17h6' }),
  ]),
  Wand: ic(() => [
    h('path', { d: 'm15 4 1.5 1.5L18 4l-1.5-1.5z' }),
    h('path', { d: 'm6.5 5 1 1' }),
    h('path', { d: 'm18 11 1 1' }),
    h('path', { d: 'm11 6 7 7' }),
    h('path', { d: 'm4 21 7-7' }),
  ]),
  Sparkles: ic(() => [
    h('path', { d: 'M12 3v3M12 18v3M3 12h3M18 12h3' }),
    h('path', { d: 'M5.6 5.6 7.7 7.7M16.3 16.3l2.1 2.1M5.6 18.4 7.7 16.3M16.3 7.7l2.1-2.1' }),
  ]),
  Eye: ic(() => [h('path', { d: 'M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z' }), h('circle', { cx: '12', cy: '12', r: '3' })]),
  Filter: ic(() => [h('path', { d: 'M22 3H2l8 9.5V19l4 2v-8.5z' })]),
  Layers: ic(() => [
    h('path', { d: 'm12 2 10 6-10 6L2 8z' }),
    h('path', { d: 'm2 17 10 6 10-6' }),
    h('path', { d: 'm2 12 10 6 10-6' }),
  ]),
  Download: ic(() => [
    h('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
    h('path', { d: 'm7 10 5 5 5-5' }),
    h('path', { d: 'M12 15V3' }),
  ]),
  Diff: ic(() => [
    h('circle', { cx: '6', cy: '6', r: '3' }),
    h('path', { d: 'M6 9v9' }),
    h('circle', { cx: '18', cy: '18', r: '3' }),
    h('path', { d: 'M18 6V9a3 3 0 0 1-3 3H9' }),
  ]),
  Clock: ic(() => [h('circle', { cx: '12', cy: '12', r: '9' }), h('path', { d: 'M12 7v5l3 2' })]),
  PanelLeft: ic(() => [h('rect', { x: '3', y: '4', width: '18', height: '16', rx: '2' }), h('path', { d: 'M9 4v16' })]),
  Dot: ic(() => [h('circle', { cx: '12', cy: '12', r: '3', fill: 'currentColor', stroke: 'none' })]),
  More: ic(() => [
    h('circle', { cx: '5',  cy: '12', r: '1.5', fill: 'currentColor', stroke: 'none' }),
    h('circle', { cx: '12', cy: '12', r: '1.5', fill: 'currentColor', stroke: 'none' }),
    h('circle', { cx: '19', cy: '12', r: '1.5', fill: 'currentColor', stroke: 'none' }),
  ]),
  Reset: ic(() => [h('path', { d: 'M3 12a9 9 0 1 0 3-6.7L3 8' }), h('path', { d: 'M3 3v5h5' })]),
  Play: ic(() => [h('path', { d: 'M6 4v16l14-8z', fill: 'currentColor' })]),
  Info: ic(() => [h('circle', { cx: '12', cy: '12', r: '9' }), h('path', { d: 'M12 8h.01M11 12h1v4h1' })]),
  Warn: ic(() => [
    h('path', { d: 'M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z' }),
    h('path', { d: 'M12 9v4M12 17h.01' }),
  ]),
  Mic: ic(() => [h('rect', { x: '9', y: '2', width: '6', height: '12', rx: '3' }), h('path', { d: 'M5 10a7 7 0 0 0 14 0' }), h('path', { d: 'M12 19v3' })]),
  Share: ic(() => [
    h('circle', { cx: '18', cy: '5', r: '3' }),
    h('circle', { cx: '6', cy: '12', r: '3' }),
    h('circle', { cx: '18', cy: '19', r: '3' }),
    h('path', { d: 'm8.6 13.5 6.8 4M15.4 6.5l-6.8 4' }),
  ]),
  Bookmark: ic(() => [h('path', { d: 'M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z' })]),
  AlertOctagon: ic(() => [
    h('polygon', { points: '7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2' }),
    h('path', { d: 'M12 8v4M12 16h.01' }),
  ]),
  Plug: ic(() => [h('path', { d: 'M12 22v-5M9 8V2M15 8V2' }), h('path', { d: 'M5 10h14v3a7 7 0 0 1-14 0z' })]),
  Activity: ic(() => [h('path', { d: 'M22 12h-4l-3 9L9 3l-3 9H2' })]),
  Tag: ic(() => [h('path', { d: 'M20.6 12.6 12 21.2l-9-9V3h9.2z' }), h('circle', { cx: '7', cy: '7', r: '1.5' })]),
  GHL: ic(() => [h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '4' }), h('path', { d: 'M8 12h8M12 8v8' })]),
  Chat: ic(() => [h('path', { d: 'M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z' })]),
  Wrench: ic(() => [h('path', { d: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4L14 13l-3-3z' })]),
  Shield: ic(() => [h('path', { d: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z' })]),
  Copy: ic(() => [
    h('rect', { x: '9', y: '9', width: '13', height: '13', rx: '2' }),
    h('path', { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' }),
  ]),
  Webhook: ic(() => [
    h('path', { d: 'M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2' }),
    h('path', { d: 'm6 17 3.13-5.78c.53-.97.43-2.22-.26-3.07A4 4 0 0 1 17 6c0 .56-.12 1.1-.31 1.6' }),
    h('path', { d: 'm12 6 3.13 5.73C15.66 12.7 16.9 13.07 18 13a4 4 0 1 1-3.94 4.74' }),
  ]),
  Cluster: ic(() => [
    h('circle', { cx: '6',  cy: '6',  r: '3' }),
    h('circle', { cx: '18', cy: '6',  r: '3' }),
    h('circle', { cx: '6',  cy: '18', r: '3' }),
    h('circle', { cx: '18', cy: '18', r: '3' }),
    h('path', { d: 'M9 6h6M6 9v6M9 18h6M18 9v6' }),
  ]),
}
