export enum SensorOrder {
	CreatedAt = "created-at",
	NameAsc = "name-asc",
	NameDesc = "name-desc",
	TypeAsc = "type-asc",
	TypeDesc = "type-desc",
}

export enum SensorCategory {
	// For privacy reasons, favorites are not stored on the server
	// Favorite = "favorite",
	// NotFavorite = "not-favorite",
	AboveLimit = "above-limit",
	BelowLimit = "below-limit",
}
