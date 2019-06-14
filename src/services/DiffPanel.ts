//	Imports ____________________________________________________________________

import * as path from 'path';
import * as vscode from 'vscode';

import { Uri } from '../types';
import { workspacePaths } from './common';
import { DiffCopy } from './DiffCopy';
import { DiffDialog } from './DiffDialog';
import { DiffList } from './DiffList';
import { DiffMenu } from './DiffMenu';
import { DiffOpen } from './DiffOpen';
import { DiffStatus } from './DiffStatus';

const floor = Math.floor;
const random = Math.random;

//	Variables __________________________________________________________________

let platform = 'other';

//	Initialize _________________________________________________________________

if (process.platform === 'darwin') platform = 'mac';
if (process.platform === 'win32') platform = 'win';

//	Exports ____________________________________________________________________

export class DiffPanel {
	
	public static currentPanel:DiffPanel|undefined;
	public static readonly viewType = 'l13Diff';
	
	private readonly panel:vscode.WebviewPanel;
	private readonly context:vscode.ExtensionContext;
	
	private readonly status:DiffStatus;
	private readonly dialog:DiffDialog;
	private readonly open:DiffOpen;
	private readonly menu:DiffMenu;
	private readonly list:DiffList;
	private readonly copy:DiffCopy;
	
	private disposables:vscode.Disposable[] = [];
	
	public static createOrShow (context:vscode.ExtensionContext, uris:null|Uri[]|vscode.Uri[] = null) {
		
		const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
		
		if (DiffPanel.currentPanel) {
			DiffPanel.currentPanel.panel.reveal(column);
			if (uris) {
					DiffPanel.currentPanel.panel.webview.postMessage({
					command: 'update:paths',
					uris: mapUris(uris),
				});
			}
			return;
		}
		
		const panel = vscode.window.createWebviewPanel(DiffPanel.viewType, 'Diff', {
			viewColumn: column || vscode.ViewColumn.Active,
		}, {
			enableScripts: true,
			localResourceRoots: [
				vscode.Uri.file(path.join(context.extensionPath, 'media')),
			],
			retainContextWhenHidden: true,
		});
		
		panel.iconPath = {
			dark: vscode.Uri.file(path.join(context.extensionPath, 'media', 'icons', 'icon-dark.svg')),
			light: vscode.Uri.file(path.join(context.extensionPath, 'media', 'icons', 'icon-light.svg')),
		};
		
		DiffPanel.currentPanel = new DiffPanel(panel, context, uris);
		
	}
	
	public static revive (panel:vscode.WebviewPanel, context:vscode.ExtensionContext) {
		
		DiffPanel.currentPanel = new DiffPanel(panel, context);
		
	}
	
	private constructor (panel:vscode.WebviewPanel, context:vscode.ExtensionContext, uris:null|Uri[]|vscode.Uri[] = null) {
		
		this.panel = panel;
		this.context = context;
		
		this.status = new DiffStatus(context);
		this.dialog = new DiffDialog(panel);
		this.open = new DiffOpen(panel);
		this.menu = new DiffMenu(panel, context);
		this.copy = new DiffCopy(panel);
		this.list = new DiffList(panel, context, this.status);
		
		this.disposables.push(this.status);
		this.disposables.push(this.dialog);
		this.disposables.push(this.open);
		this.disposables.push(this.menu);
		this.disposables.push(this.copy);
		this.disposables.push(this.list);
		
		this.panel.title = 'Diff';
		this.panel.webview.html = this.getHTMLforDiff();
		
		this.panel.onDidDispose(() => this.dispose(), null, this.disposables);
		
		this.panel.onDidChangeViewState(({ webviewPanel }) => {
		
			this.setContextForFocus(webviewPanel.active);
			
		});
		
		this.panel.webview.onDidReceiveMessage((message) => {
			
			if (message.command === 'init:paths') {
				this.panel.webview.postMessage({
					command: message.command,
					uris: mapUris(uris),
					workspaces: workspacePaths(vscode.workspace.workspaceFolders),
				});
			}
			
		}, null, this.disposables);
		
		this.setContextForFocus(true);
		
	}
	
	public dispose () :void {
		
		DiffPanel.currentPanel = undefined;
		
		this.panel.dispose();
		
		while (this.disposables.length) {
			const disposable = this.disposables.pop();
			if (disposable) disposable.dispose();
		}
		
		this.setContextForFocus(false);
		
	}
	
	private setContextForFocus (value:boolean) {
		
		vscode.commands.executeCommand('setContext', 'l13DiffFocus', value);
		
	}
	
	private getHTMLforDiff () {
		
		const scriptPathOnDisk = vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'main.js'));
		const stylePathOnDisk = vscode.Uri.file(path.join(this.context.extensionPath, 'media', 'style.css'));
		
		const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });
		const styleUri = stylePathOnDisk.with({ scheme: 'vscode-resource' });
		
		const nonceToken = nonce();
		const csp = `default-src 'none'; img-src vscode-resource: data:; style-src 'unsafe-inline' vscode-resource:; script-src 'nonce-${nonceToken}';`;
		
		return `<!DOCTYPE html>
		<html lang="en">
			<head>
				<meta charset="UTF-8">
				<meta http-equiv="Content-Security-Policy" content="${csp}">
				<meta name="viewport" content="width=device-width, initial-scale=1.0">
				<title>L13 Diff</title>
				<link rel="stylesheet" nonce="${nonceToken}" href="${styleUri}">
				<script nonce="${nonceToken}" src="${scriptUri}"></script>
			</head>
			<body class="platform-${platform}"></body>
		</html>`;
		
	}
	
}

//	Functions __________________________________________________________________

function nonce () {
	
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	const length = possible.length;
	let text = '';
	
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(floor(random() * length));
	}
	
	return text;
	
}

function mapUris (uris:null|Uri[]|vscode.Uri[]) :Uri[] {
	
	return (uris || []).map((uri) => ({ fsPath: uri.fsPath }));
	
}