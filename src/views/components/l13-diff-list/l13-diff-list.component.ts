//	Imports ____________________________________________________________________

import { Diff, File } from '../../../types';
import { L13Component, L13Element, L13Query } from '../../@l13/core';

import { L13DiffListViewModelService } from './l13-diff-list.service';
import { L13DiffListViewModel } from './l13-diff-list.viewmodel';

import { L13DiffActionsViewModelService } from '../l13-diff-actions/l13-diff-actions.service';

import { changePlatform, isMacOs, isMetaKey, isOtherPlatform, isWindows, parseIcons, removeChildren, scrollElementIntoView, vscode } from '../common';
import styles from '../styles';
import templates from '../templates';

const slice = Array.prototype.slice;

//	Variables __________________________________________________________________

const actionsService = new L13DiffActionsViewModelService();

enum Direction { PREVIOUS, NEXT }
const { PREVIOUS, NEXT } = Direction;

//	Initialize _________________________________________________________________



//	Exports ____________________________________________________________________

@L13Component({
	name: 'l13-diff-list',
	service: L13DiffListViewModelService,
	styles: [parseIcons(styles['l13-diff-list/l13-diff-list.css'])],
	template: templates['l13-diff-list/l13-diff-list.html'],
})
export class L13DiffListComponent extends L13Element<L13DiffListViewModel> {
	
	@L13Query('l13-diff-list-body')
	private list:HTMLElement;
	
	public disabled:boolean = false;
	
	public tabIndex = 0;
	
	private cacheSelectionHistory:HTMLElement[] = [];
	private cacheSelectedListItems:HTMLElement[] = [];
	private cacheListItemViews:{ [name:string]:HTMLElement } = {};
	private cacheListItems:Diff[] = [];
	private cacheFilteredListItems:Diff[] = [];
	
	public constructor () {
		
		super();
		
		window.addEventListener('focus', () => {
			
			if (this.cacheSelectionHistory.length) this.focus();
			
		});
		
		this.addEventListener('focus', () => {
			
			this.list.classList.add('-focus');
			
		});
		
		this.addEventListener('blur', () => {
			
			this.list.classList.remove('-focus');
			
		});
		
		this.addEventListener('keydown', (event) => {
			
			if (this.disabled) return;
			
			switch (event.key) {
				case 'F12': // Debug Mode
					if (event.metaKey && event.ctrlKey && event.altKey && event.shiftKey) changePlatform();
					break;
				case 'Escape':
					this.unselect();
					break;
				case 'Enter':
					this.getIdsBySelection().forEach((id) => {
						
						vscode.postMessage({
							command: event.ctrlKey ? 'open:diffToSide' : 'open:diff',
							diff: this.viewmodel.getDiffById(id),
						});
						
					});
					break;
				case 'ArrowUp':
					this.selectPreviousOrNext(PREVIOUS, event);
					break;
				case 'ArrowDown':
					this.selectPreviousOrNext(NEXT, event);
					break;
				case 'PageUp':
					if (!isMacOs) this.selectPreviousOrNext(PREVIOUS, event);
					break;
				case 'PageDown':
					if (!isMacOs) this.selectPreviousOrNext(NEXT, event);
				case 'Home':
					if (!isMacOs) this.selectPreviousOrNext(PREVIOUS, event);
					break;
				case 'End':
					if (!isMacOs) this.selectPreviousOrNext(NEXT, event);
					break;
			}
			
		});
		
		this.list.addEventListener('click', ({ target, metaKey, ctrlKey, shiftKey, offsetX }) => {
			
			if (this.disabled) return;
			
			if (this.list.firstChild && offsetX > (<HTMLElement>this.list.firstChild).offsetWidth) return;
			
			if (target === this.list) {
				this.unselect();
				return;
			}
			
			const parentNode = <HTMLElement>(<HTMLElement>target).parentNode;
			
			if (this.cacheSelectionHistory.length) {
			//	On macOS metaKey overrides shiftKey if both keys are pressed
				if (isMacOs && shiftKey && !metaKey || !isMacOs && shiftKey) {
					const lastSelection = this.cacheSelectionHistory[this.cacheSelectionHistory.length - 1];
					if (lastSelection) {
					//	On Windows selection works exactly like macOS if shiftKey and ctrlKey is pressed
					//	Otherwise Windows removes previous selection
						if (isWindows && !ctrlKey || isOtherPlatform) {
							this.unselect();
						//	On Windows previous selection will be remembered
						//	On Linux always last clicked item will be remembered
							this.cacheSelectionHistory = [isWindows ? lastSelection : parentNode];
						}
						if (this.cacheSelectedListItems.length) this.cacheSelectedListItems.forEach((element) => element.classList.remove('-selected'));
						this.cacheSelectedListItems = this.selectRange(parentNode, lastSelection);
					} else this.selectListItem(parentNode);
				} else if (isMetaKey(ctrlKey, metaKey)) {
					parentNode.classList.toggle('-selected');
					this.cacheSelectedListItems = [];
					if (parentNode.classList.contains('-selected')) this.cacheSelectionHistory.push(parentNode);
					else this.cacheSelectionHistory.splice(this.cacheSelectionHistory.indexOf(parentNode), 1);
					this.detectCopy();
				} else {
					this.unselect();
					this.selectListItem(parentNode);
				}
			} else this.selectListItem(parentNode);
			
		});
		
		this.list.addEventListener('dblclick', ({ target }) => {
			
			if (this.disabled) return;
			
			const id = (<HTMLElement>(<HTMLElement>target).parentNode).getAttribute('data-id');
			
			vscode.postMessage({
				command: 'open:diff',
				diff: this.viewmodel.getDiffById(id),
			});
			
		});
		
		document.addEventListener('mouseup', ({ target }) => {
			
			if (this.disabled) return;
			
			if (target !== document.documentElement && target !== document.body) return;
			
			this.unselect();
			
		});
		
	}
	
	private detectCopy () :void {
		
		if (this.cacheSelectionHistory.length) actionsService.model('actions').enableCopy();
		else actionsService.model('actions').disableCopy();
		
	}
	
	private selectListItem (element:HTMLElement) {
	
		element.classList.add('-selected');
		
		this.cacheSelectionHistory.push(element);
		this.cacheSelectedListItems = [];
		
		actionsService.model('actions').enableCopy();
		
	}
	
	private selectRange (from:HTMLElement, to:HTMLElement) {
		
		if (from === to) {
			from.classList.add('-selected');
			return [from];
		}
		
		const elements = this.list.querySelectorAll('l13-diff-list-row');
		let useSelect = false;
		
		return slice.call(elements).filter((element) => {
								
			if (useSelect || element === from || element === to) {
				if (element === from || element === to) useSelect = !useSelect;
				element.classList.add('-selected');
				return true;
			}
			
		});
		
	}
	
	private selectItem (element:HTMLElement) {
		
		element.classList.add('-selected');
		this.cacheSelectionHistory.push(element);
		scrollElementIntoView(this, element);
		
	}
	
	private selectNoneItem (element:HTMLElement, shiftKey:boolean, length:number) {
		
		if (!shiftKey && length > 1) {
			this.unselect();
			element.classList.add('-selected');
			this.cacheSelectionHistory.push(element);
		}
		
		scrollElementIntoView(this, element);
		
	}
	
	private selectPreviousOrNextItem (element:HTMLElement, shiftKey:boolean) {
		
		if (!shiftKey) this.unselect();
		
		this.cacheSelectionHistory.push(element);
		element.classList.add('-selected');
		scrollElementIntoView(this, element);
		
	}
	
	private getFirstItem () {
		
		return <HTMLElement>this.list.querySelector('l13-diff-list-row');
		
	}
	
	private getLastItem () {
		
		const rows = this.list.querySelectorAll('l13-diff-list-row');
		
		return <HTMLElement>rows[rows.length - 1];
		
	}
	
	private selectFirstOrLastItem (from:HTMLElement, to:HTMLElement, shiftKey:boolean) {
		
		if (!shiftKey) {
			this.unselect();
			to.classList.add('-selected');
		} else {
			if (isWindows) {
				if (this.cacheSelectedListItems.length) this.cacheSelectedListItems.forEach((element) => element.classList.remove('-selected'));
				if (this.cacheSelectionHistory.length > 1) {
					this.cacheSelectionHistory.pop();
					from = this.cacheSelectionHistory[this.cacheSelectionHistory.length - 1];
				}
			}
			this.cacheSelectedListItems = this.selectRange(from, to);
		}
		
		this.cacheSelectionHistory.push(to);
		scrollElementIntoView(this, to);
		
	}
	
	private selectPreviousOrNext (direction:Direction, event:KeyboardEvent) {
		
		if (!this.list.firstChild) return;
		
		actionsService.model('actions').enableCopy();
		event.preventDefault();
		
		const length = this.cacheSelectionHistory.length;
		const lastSelection = this.cacheSelectionHistory[length - 1];
		
		if (direction === NEXT) this.selectNext(event, lastSelection);
		else this.selectPrevious(event, lastSelection);
		
	}
	
	private selectPrevious ({ altKey, shiftKey, key }:KeyboardEvent, lastSelection:HTMLElement) {
		
		if (isMacOs) {
			if (!lastSelection) this.selectItem(altKey ? this.getFirstItem() : this.getLastItem());
			else if (!lastSelection.previousElementSibling) this.selectNoneItem(lastSelection, shiftKey, length);
			else if (altKey) this.selectFirstOrLastItem(lastSelection, this.getFirstItem(), shiftKey);
			else this.selectPreviousOrNextItem(<HTMLElement>lastSelection.previousElementSibling, shiftKey);
		} else {
			if (key === 'ArrowUp') {
				if (!lastSelection) this.selectItem(this.getLastItem());
			else if (!lastSelection.previousElementSibling) this.selectNoneItem(lastSelection, shiftKey, length);
				else this.selectPreviousOrNextItem(<HTMLElement>lastSelection.previousElementSibling, shiftKey);
			} else if (key === 'PageUp') {
				this.selectPreviousPageItem(lastSelection, shiftKey);
			} else if (key === 'Home') {
				if (!lastSelection) this.selectItem(this.getFirstItem());
				else this.selectFirstOrLastItem(lastSelection, this.getFirstItem(), shiftKey);
			}
		}
		
	}
	
	private selectPreviousPageItem (lastSelection:HTMLElement, shiftKey:boolean) {
		
		const viewStart = this.scrollTop - 1;
		const viewHeight = this.offsetHeight;
		
		let currentElement = this.getLastItem();
		
		if (!currentElement) return;
		
		let previousElementSibling:HTMLElement;
		
		while ((previousElementSibling = <HTMLElement>currentElement.previousElementSibling)) {
			if (previousElementSibling.offsetTop > viewStart) {
				currentElement = previousElementSibling;
				continue;
			}
			break;
		}
		
		if (currentElement.classList.contains('-selected')) {
			const nextViewStart = viewStart - viewHeight;
			while ((previousElementSibling = <HTMLElement>currentElement.previousElementSibling)) {
				if (previousElementSibling.offsetTop > nextViewStart) {
					currentElement = previousElementSibling;
					continue;
				}
				break;
			}
		}
		
		if (!shiftKey) {
			this.unselect();
			currentElement.classList.add('-selected');
		} else {
			this.cacheSelectedListItems = this.selectRange(lastSelection, currentElement);
		}
		
		this.cacheSelectionHistory.push(currentElement);
		scrollElementIntoView(this, currentElement);
		
	}
	
	private selectNextPageItem (lastSelection:HTMLElement, shiftKey:boolean) {
		
		const viewStart = this.scrollTop;
		const viewHeight = this.offsetHeight;
		const viewEnd = viewStart + viewHeight + 1; // Why does + 1 fixes the issue???
		
		let currentElement = this.getFirstItem();
		
		if (!currentElement) return;
		
		let nextElementSibling:HTMLElement;
		
		while ((nextElementSibling = <HTMLElement>currentElement.nextElementSibling)) {
			if (nextElementSibling.offsetTop + nextElementSibling.offsetHeight < viewEnd) {
				currentElement = nextElementSibling;
				continue;
			}
			break;
		}
		
		if (currentElement.classList.contains('-selected')) {
			const nextViewEnd = viewEnd + viewHeight;
			while ((nextElementSibling = <HTMLElement>currentElement.nextElementSibling)) {
				if (nextElementSibling.offsetTop + nextElementSibling.offsetHeight < nextViewEnd) {
					currentElement = nextElementSibling;
					continue;
				}
				break;
			}
		}
		
		if (!shiftKey) {
			this.unselect();
			currentElement.classList.add('-selected');
		} else {
			this.cacheSelectedListItems = this.selectRange(lastSelection, currentElement);
		}
		
		this.cacheSelectionHistory.push(currentElement);
		scrollElementIntoView(this, currentElement);
		
	}
	
	private selectNext ({ altKey, shiftKey, key }:KeyboardEvent, lastSelection:HTMLElement) {
		
		if (isMacOs) {
			if (!lastSelection) this.selectItem(altKey ? this.getLastItem() : this.getFirstItem());
			else if (!lastSelection.nextElementSibling) this.selectNoneItem(lastSelection, shiftKey, length);
			else if (altKey) this.selectFirstOrLastItem(lastSelection, this.getLastItem(), shiftKey);
			else this.selectPreviousOrNextItem(<HTMLElement>lastSelection.nextElementSibling, shiftKey);
		} else {
			if (key === 'ArrowDown') {
				if (!lastSelection) this.selectItem(this.getFirstItem());
				else if (!lastSelection.nextElementSibling) this.selectNoneItem(lastSelection, shiftKey, length);
				else this.selectPreviousOrNextItem(<HTMLElement>lastSelection.nextElementSibling, shiftKey);
			} else if (key === 'PageDown') {
				this.selectNextPageItem(lastSelection, shiftKey);
			} else if (key === 'End') {
				if (!lastSelection) this.selectItem(this.getLastItem());
				else this.selectFirstOrLastItem(lastSelection, this.getLastItem(), shiftKey);
			}
		}
		
	}
	
	public selectByStatus (type:string, addToSelection:boolean = false) {
		
		if (!addToSelection) this.unselect();
		
		const elements = this.list.querySelectorAll(`l13-diff-list-row.-${type}`);
		
		if (elements) elements.forEach((element) => element.classList.add('-selected'));
		
		this.detectCopy();
		
	}
	
	public unselect () {
		
		this.cacheSelectionHistory = [];
		
		const elements = this.list.querySelectorAll('.-selected');
	
		if (elements.length) elements.forEach((element) => element.classList.remove('-selected'));
		
		actionsService.model('actions').disableCopy();
		
	}
	
	private getIdsBySelection () :string[] {
		
		const elements = this.list.querySelectorAll('.-selected');
		const ids:string[] = [];
		
		elements.forEach((element) => ids.push(element.getAttribute('data-id')));
		
		return ids;
		
	}
	
	public copy (from:'left'|'right') :void {
		
		this.viewmodel.copy(from, this.getIdsBySelection());
		
	}
	
	public update () {
		
		super.update();
		
		if (this.viewmodel.items !== this.cacheListItems) this.createListItemViews();
		if (this.viewmodel.filteredItems !== this.cacheFilteredListItems) this.showFiteredListItemViews();
		
	}
	
	private createListItemViews () :void {
		
		this.cacheListItemViews = {};
		
		this.viewmodel.items.forEach((diff) => {
		
			const row = document.createElement('l13-diff-list-row');
			
			row.classList.add('-' + diff.status);
			row.setAttribute('data-id', '' + diff.id);
			
			appendColumn(row, <File>diff.fileA);
			appendColumn(row, <File>diff.fileB);
			
			this.cacheListItemViews[diff.id] = row;
			
		});
		
		this.cacheListItems = this.viewmodel.items;
		
	}
	
	private showFiteredListItemViews () {
		
		this.unselect();
		
		removeChildren(this.list);
		
		const fragment = document.createDocumentFragment();
		
		this.viewmodel.filteredItems.forEach((diff) => {
			
			fragment.appendChild(this.cacheListItemViews[diff.id]);
			
		});
		
		this.list.appendChild(fragment);
		
		this.cacheFilteredListItems = this.viewmodel.filteredItems;
		
	}
	
}

//	Functions __________________________________________________________________

function appendColumn (parent:HTMLElement, file:File) {
	
	const column = document.createElement('l13-diff-list-file');
	
	if (file) {
		column.classList.add(`-${file.type}`);
		column.textContent = file.relative;
	}
	
	parent.appendChild(column);
	
}