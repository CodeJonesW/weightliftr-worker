export interface Env {
	WL_DURABLE_OBJECT: any;
	DB: D1Database;
	JWT_SECRET: string;
	OPENAI_API_KEY: string;
	WL_ANALYTICS_DATA: AnalyticsEngineDataset;
}

export interface User {
	user_id?: number;
	email?: string;
	user_password?: string;
}

export type ErrorResponse = {
	error: string;
	status?: number;
};

export type SuccessResponse = {
	message: string;
};
