//	Imports ____________________________________________________________________

import * as fs from 'fs';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export type DiffFileTypes = 'error'|'file'|'folder'|'symlink'|'unknown';

export type Diff = {
	id:string,
	status:DiffStatus,
	type:DiffFileTypes|'mixed',
	ignoredWhitespace:boolean,
	ignoredEOL:boolean,
	fileA:null|DiffFile,
	fileB:null|DiffFile,
};

export type DiffFile = {
	root:string,
	relative:string,
	fsPath:string,
	stat?:fs.Stats,
	path:string,
	name:string,
	basename:string,
	dirname:string,
	extname:string,
	ignore:boolean,
	allow: boolean,
	type:DiffFileTypes,
};

export type DiffSettings = {
	abortOnError:boolean,
	excludes:string[],
	includes: string[],
	ignoreContents:boolean,
	ignoreEndOfLine:boolean,
	ignoreTrimWhitespace:boolean,
	maxFileSize:number,
	useCaseSensitive:boolean,
};

export type DiffStatus = 'conflicting'|'deleted'|'ignored'|'modified'|'unchanged'|'untracked';

//	Functions __________________________________________________________________

