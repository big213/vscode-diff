// tslint:disable
export default {
	"l13-diff-actions/l13-diff-actions.html": "<button id=\"l13_copy_right\" [disabled]=\"copyDisabled\"></button>\n<button id=\"l13_select_deleted\" [disabled]=\"selectDisabled\"></button>\n<button id=\"l13_select_modified\" [disabled]=\"selectDisabled\"></button>\n<button id=\"l13_select_untracked\" [disabled]=\"selectDisabled\"></button>\n<button id=\"l13_select_all\" [disabled]=\"selectDisabled\"></button>\n<button id=\"l13_copy_left\" [disabled]=\"copyDisabled\"></button>",
	"l13-diff-compare/l13-diff-compare.html": "<button [disabled]=\"disabled\">Compare</button>",
	"l13-diff-input/l13-diff-input.html": "<input type=\"text\" [(model)]=\"value\" [disabled]=\"disabled\">\n<button (click)=\"openDialog()\" [disabled]=\"disabled\"></button>\n<slot></slot>",
	"l13-diff-intro/l13-diff-intro.html": "<l13-diff-shortcuts></l13-diff-shortcuts>",
	"l13-diff-list/l13-diff-list.html": "<l13-diff-list-body></l13-diff-list-body>",
	"l13-diff-map/l13-diff-map.html": "<canvas id=\"map\"></canvas><div></div>",
	"l13-diff-menu/l13-diff-menu.html": "<l13-diff-menu-lists></l13-diff-menu-lists>",
	"l13-diff-panel/l13-diff-panel.html": "<l13-diff-loading [if]=\"loading\"></l13-diff-loading>\n<slot></slot>",
	"l13-diff-search/l13-diff-search.html": "<div id=\"l13_resizer\"></div>\n<div class=\"l13-input\">\n\t<input id=\"l13_searchterm\" type=\"text\" [(model)]=\"searchterm\" [disabled]=\"disabled\">\n\t<input id=\"l13_case_sensitive\" type=\"checkbox\" [(model)]=\"useCaseSensitive\" [disabled]=\"disabled\">\n\t<input id=\"l13_use_regexp\" type=\"checkbox\" [(model)]=\"useRegExp\" [disabled]=\"disabled\">\n\t<div class=\"l13-message\" [if]=\"error\">{{ error }}</div>\n</div>\n<input id=\"l13_use_files\" class=\"-option\" type=\"checkbox\" [(model)]=\"useFiles\" [disabled]=\"disabled\">\n<input id=\"l13_use_folders\" class=\"-option\" type=\"checkbox\" [(model)]=\"useFolders\" [disabled]=\"disabled\">\n<input id=\"l13_use_symlinks\" class=\"-option\" type=\"checkbox\" [(model)]=\"useSymlinks\" [disabled]=\"disabled\">\n<input id=\"l13_use_conflicts\" class=\"-option\" type=\"checkbox\" [(model)]=\"useConflicts\" [disabled]=\"disabled\">\n<button id=\"l13_close\" [disabled]=\"disabled\"></button>",
	"l13-diff-swap/l13-diff-swap.html": "<button [disabled]=\"disabled\"></button>",
	"l13-diff-views/l13-diff-views.html": "<input id=\"l13_show_unchanged\" type=\"checkbox\" [(model)]=\"unchangedChecked\" [disabled]=\"disabled\">\n<input id=\"l13_show_deleted\" type=\"checkbox\" [(model)]=\"deletedChecked\" [disabled]=\"disabled\">\n<input id=\"l13_show_modified\" type=\"checkbox\" [(model)]=\"modifiedChecked\" [disabled]=\"disabled\">\n<input id=\"l13_show_untracked\" type=\"checkbox\" [(model)]=\"untrackedChecked\" [disabled]=\"disabled\">",
	"l13-diff/l13-diff.html": "<l13-diff-panel vmId=\"panel\">\n\t<l13-diff-folders>\n\t\t<l13-diff-input vmId=\"left\" id=\"left\" placeholder=\"Left file or folder\"></l13-diff-input>\n\t\t<l13-diff-swap vmId=\"swap\"></l13-diff-swap>\n\t\t<l13-diff-input vmId=\"right\" id=\"right\" placeholder=\"Right file or folder\"></l13-diff-input>\n\t</l13-diff-folders>\n\t<l13-diff-tools>\n\t\t<l13-diff-views vmId=\"views\"></l13-diff-views>\n\t\t<l13-diff-actions vmId=\"actions\"></l13-diff-actions>\n\t\t<l13-diff-compare vmId=\"compare\"></l13-diff-compare>\n\t</l13-diff-tools>\n\t<l13-diff-widgets></l13-diff-widgets>\n</l13-diff-panel>\n<l13-diff-list vmId=\"list\"></l13-diff-list>\n<l13-diff-map vmId=\"map\"></l13-diff-map>\n<l13-diff-intro></l13-diff-intro>\n<l13-diff-no-result>No items are matching the current filter settings.</l13-diff-no-result>"
};