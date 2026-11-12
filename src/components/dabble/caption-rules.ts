export type CaptionRect = { left: number; top: number; width: number; height: number };

export function fittedVideoRect(box: CaptionRect, nativeWidth: number, nativeHeight: number): CaptionRect {
  if (!nativeWidth || !nativeHeight) return box;
  const scale = Math.min(box.width / nativeWidth, box.height / nativeHeight);
  const width = nativeWidth * scale;
  const height = nativeHeight * scale;
  return { left: box.left + (box.width - width) / 2, top: box.top + (box.height - height) / 2, width, height };
}

export function captionBottom(video: CaptionRect, barTop: number, barVisible: boolean, docked: boolean) {
  const bottom = video.top + video.height;
  return barVisible && !docked && barTop < bottom ? barTop - 10 : bottom - video.height * .06;
}

export function captionsOverlap(caption: CaptionRect, panel: CaptionRect) {
  // Include the 16px bristle tips, not just the text block.
  return caption.left - 16 < panel.left + panel.width && caption.left + caption.width + 16 > panel.left && caption.top < panel.top + panel.height && caption.top + caption.height > panel.top;
}

export function plainCueText(cue: { text: string; getCueAsHTML?: () => DocumentFragment }) {
  // Browser VTT parsing strips tags without interpreting cue text as HTML.
  if (cue.getCueAsHTML) return cue.getCueAsHTML().textContent ?? '';
  return cue.text.replace(/<[^>]*>/g, '').replace(/&(amp|lt|gt|nbsp|lrm|rlm);/g, (_, name: string) => ({ amp: '&', lt: '<', gt: '>', nbsp: '\u00a0', lrm: '\u200e', rlm: '\u200f' })[name] ?? '');
}