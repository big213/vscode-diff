//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { register } from '../common/commands';
import { buildWhitelistForTextFiles } from '../common/extensions';
import * as settings from '../common/settings';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	buildWhitelistForTextFiles();

	context.subscriptions.push(vscode.extensions.onDidChange(() => buildWhitelistForTextFiles()));
	
	register(context, {
		
		'l13Diff.compareWhitespace': () => {
			
			const useDefault = settings.get('ignoreTrimWhitespace', 'default');
			
			if (useDefault === 'default') vscode.workspace.getConfiguration('diffEditor').update('ignoreTrimWhitespace', false, true);
			else settings.update('ignoreTrimWhitespace', 'off');
			
		},
		
		'l13Diff.ignoreWhitespace': () => {
			
			const useDefault = settings.get('ignoreTrimWhitespace', 'default');
			
			if (useDefault === 'default') vscode.workspace.getConfiguration('diffEditor').update('ignoreTrimWhitespace', true, true);
			else settings.update('ignoreTrimWhitespace', 'on');
			
		},
		
		'l13Diff.compareEndOfLine': () => settings.update('ignoreEndOfLine', false),
		'l13Diff.ignoreEndOfLine': () => settings.update('ignoreEndOfLine', true),
		
	});
	
}

//	Functions __________________________________________________________________

