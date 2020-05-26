//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { DiffPanel } from '../services/DiffPanel';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export function activate (context:vscode.ExtensionContext) {
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.compareProjectWithWorkspace', ({ project }) => {
		
		const compare = vscode.workspace.getConfiguration('l13Diff').get('openFavoriteAndCompare', false);
		const workspaces = workspaceFoldersQuickPickItems();
		
		if (workspaces.length > 1) {
			vscode.window.showQuickPick(workspaces).then((value:any) => {
				
				if (value) DiffPanel.createOrShow(context, [{ fsPath: value.description }, { fsPath: project.path }], compare);
				
			});
		} else if (workspaces.length === 1) {
			DiffPanel.createOrShow(context, [{ fsPath: workspaces[0].description }, { fsPath: project.path }], compare);
		} else vscode.window.showErrorMessage('No workspace available!');
		
	}));
	
	context.subscriptions.push(vscode.commands.registerCommand('l13Diff.openProject', ({ project }) => {
		
		DiffPanel.createOrShow(context, [{ fsPath: project.path }, { fsPath: '' }]);
		
	}));
	
}

//	Functions __________________________________________________________________

function workspaceFoldersQuickPickItems () :any {
	
	const workspaceFolders = vscode.workspace.workspaceFolders;
	
	return workspaceFolders ? workspaceFolders.map((folder) => ({ label: folder.name, description: folder.uri.fsPath })) : [];
	
}