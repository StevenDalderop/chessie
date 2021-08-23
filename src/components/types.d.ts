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

export interface Game {
	id: number;
	fen: string;
	is_finished: boolean;
	is_started: boolean;
	moves: string;
	result: string;
	time: number;
	type: string;
	timestamp: string;
	users: User[];
	skill_level?: number;
	pc_name?: string;
	room?: string;
}

export interface User {
	id: number;
	color: string;
	name: string;
	is_online: boolean;
	time: number;
}

