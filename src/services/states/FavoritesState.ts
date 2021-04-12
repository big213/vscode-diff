//	Imports ____________________________________________________________________

import * as vscode from 'vscode';

import { sortCaseInsensitive } from '../../@l13/arrays';

import { Favorite, FavoriteGroup } from '../@types/favorites';

import * as states from '../common/states';

//	Variables __________________________________________________________________



//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

export class FavoritesState {
	
	private static current:FavoritesState = null;
	
	public static create (context:vscode.ExtensionContext) {
		
		return FavoritesState.current || (FavoritesState.current = new FavoritesState(context));
		
	}
	
	private constructor (private readonly context:vscode.ExtensionContext) {}
	
	private _onDidChangeFavorites:vscode.EventEmitter<Favorite[]> = new vscode.EventEmitter<Favorite[]>();
	public readonly onDidChangeFavorites:vscode.Event<Favorite[]> = this._onDidChangeFavorites.event;
	
	public get () {
		
		return states.getFavorites(this.context);
		
	}
	
	public getByName (label:string) {
		
		return this.get().find((favorite) => favorite.label === label) || null;
		
	}
	
	private save (favorites:Favorite[]) {
		
		states.updateFavorites(this.context, favorites);
		
	}
	
	public add (label:string, fileA:string, fileB:string) {
		
		if (this.getByName(label)) return;
		
		const favorites = this.get();
		
		favorites.push({ label, fileA, fileB });
		
		favorites.sort(({ label: a }, { label: b }) => sortCaseInsensitive(a, b));
		
		this.save(favorites);
		this._onDidChangeFavorites.fire(favorites);
		
	}
	
	public rename (favorite:Favorite, label:string) {
		
		if (this.getByName(label)) return;
		
		const favorites = this.get();
		
		for (const fav of favorites) {
			if (fav.label === favorite.label) {
				fav.label = label;
				favorites.sort(({ label: a }, { label: b }) => sortCaseInsensitive(a, b));
				this.save(favorites);
				this._onDidChangeFavorites.fire(favorites);
				break;
			}
		}
		
	}
	
	public addFavoriteToGroup (favorite:Favorite, groupId:number) {
		
		const favorites = this.get();
		
		for (const fav of favorites) {
			if (fav.label === favorite.label) {
				fav.groupId = groupId;
				break;
			}
		}
		
		this.save(favorites);
		this._onDidChangeFavorites.fire(favorites);
		
	}
	
	public getFavoritesByGroup (favoriteGroup:FavoriteGroup) {
		
		const groupId = favoriteGroup.id;
		
		return this.get().filter((favorite) => favorite.groupId === groupId);
		
	}
	
	public removeFavoriteFromGroup (favorite:Favorite) {
		
		const favorites = this.get();
		
		for (const fav of favorites) {
			if (fav.label === favorite.label) {
				delete fav.groupId;
				break;
			}
		}
		
		this.save(favorites);
		this._onDidChangeFavorites.fire(favorites);
		
	}
	
	public remove (favorite:Favorite) {
		
		const favorites = this.get();
		
		for (let i = 0; i < favorites.length; i++) {
			if (favorites[i].label === favorite.label) {
				favorites.splice(i, 1);
				this.save(favorites);
				this._onDidChangeFavorites.fire(favorites);
				break;
			}
		}
		
	}
	
	public clear () {
		
		this.save([]);
		states.updateFavoriteGroups(this.context, []);
		this._onDidChangeFavorites.fire([]);
		
	}
	
}

//	Functions __________________________________________________________________

