import { getPopupPlacement, type ImageCommentAnchor } from '$lib/features/gallery/gallery';

export function getOverlayPositionStyle(anchor: ImageCommentAnchor) {
	const placement = getPopupPlacement(anchor);

	return [
		placement.horizontal === 'right'
			? `right: ${(1 - anchor.x) * 100}%`
			: `left: ${anchor.x * 100}%`,
		placement.vertical === 'above'
			? `bottom: ${(1 - anchor.y) * 100}%`
			: `top: ${anchor.y * 100}%`,
	].join('; ');
}
