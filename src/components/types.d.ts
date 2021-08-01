export interface Pages {
	vs: string;
	time: string;
	pc: string;
	online: string;	
}


export interface Vs_options {
	human: string;
	pc: string;
	online: string;
}

export interface Chess_color {
	white: number;
	black: number;
}

export interface DataGameStarts {
	username_white: string;
	username_black: string;
	time_white: number;
	time_black: number;
	game_id: number;
}

export type GameSettingsProps = {
	username: string;
}