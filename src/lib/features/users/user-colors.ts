export const USER_COLOR_VALUES = {
	red: '#ef4444',
	rose: '#f43f5e',
	magenta: '#ec4899',
	fuchsia: '#d946ef',
	purple: '#a855f7',
	indigo: '#6366f1',
	blue: '#3b82f6',
	azure: '#2563eb',
	lightBlue: '#0ea5e9',
	sky: '#38bdf8',
	cyan: '#06b6d4',
	turquoise: '#2dd4bf',
	teal: '#0d9488',
	emerald: '#10b981',
	green: '#22c55e',
	lime: '#84cc16',
	chartreuse: '#a3e635',
	yellow: '#eab308',
	orange: '#f97316',
	amber: '#f59e0b',
	tangerine: '#fb923c',
	coral: '#fb7185',
	hotPink: '#ff4da6',
	grape: '#7c3aed',
	violet: '#8b5cf6',
} as const;

export const USER_COLOR_TOKENS = Object.keys(USER_COLOR_VALUES) as Array<keyof typeof USER_COLOR_VALUES>;

export type UserColorToken = (typeof USER_COLOR_TOKENS)[number];

export function isUserColorToken(value: string): value is UserColorToken {
	return USER_COLOR_TOKENS.includes(value as UserColorToken);
}

export function resolveUserColorValue(token: UserColorToken) {
	return USER_COLOR_VALUES[token];
}

export function getRandomUserColorToken() {
	return USER_COLOR_TOKENS[Math.floor(Math.random() * USER_COLOR_TOKENS.length)];
}
