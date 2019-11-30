import { TinyColor } from "@ctrl/tinycolor";
import {Editor, Position, TextMarker} from "codemirror";
import {OnDisposed} from "./OnDisposed";
import {Validation} from "./Validation";
export class RemoteSelection {

  /**
   * A helper method to add a style tag to the head of the document that will
   * style the color of the selection. CodeMirror only allows setting the
   * class name of decorations, so we can not set a style property directly.
   * This method will create, add, and return the style tag for this element.
   *
   * @param className
   *   The className to use as the css selector.
   * @param color
   *   The color to set for the selection.
   * @returns
   *   The style element that was added to the document head.
   *
   * @private
   * @internal
   */
  private static _addDynamicStyleElement(className: string, color: string): HTMLStyleElement {
    Validation.assertString(className, "className");
    Validation.assertString(color, "color");

    const rgbaColor = new TinyColor(color).setAlpha(0.3).toRgbString();
    const css =
      `.${className} {
         background-color: ${rgbaColor};
       }`.trim();

    const styleElement = document.createElement("style");
    styleElement.innerText = css;
    document.head.appendChild(styleElement);

    return styleElement;
  }

  /**
   * A helper method to ensure the start position is before the end position.
   *
   * @param start
   *   The current start position.
   * @param end
   *   The current end position.
   * @return
   *   An object containing the correctly ordered start and end positions.
   *
   * @private
   * @internal
   */
  private static _swapIfNeeded(start: Position, end: Position): { start: Position, end: Position } {
    if (start.line < end.line || (start.line === end.line && start.ch <= end.ch)) {
      return {start, end};
    } else {
      return {start: end, end: start};
    }
  }

  /**
   * The userland id of the selection.
   * @internal
   */
  private readonly _id: string;

  /**
   * The css classname to apply to the CodeMirror marker.
   * @internal
   */
  private readonly _className: string;

  /**
   * The HTML Style element added to the document to color the selection.
   * @internal
   */
  private readonly _styleElement: HTMLStyleElement;

  /**
   * The CodeMirror editor instance to render selection into.
   * @internal
   */
  private readonly _editor: Editor;

  /**
   * An internal callback used to dispose of the selection.
   * @internal
   */
  private readonly _onDisposed: OnDisposed;

  /**
   * The current start position of the selection.
   * @internal
   */
  private _startPosition: Position;

  /**
   * The current end position of the selection.
   * @internal
   */
  private _endPosition: Position;

  /**
   * The id's of the current CodeMirror marker rendering the selection.
   * @internal
   */
  private _marker: TextMarker;

  /**
   * A flag determining if the selection has been disposed.
   * @internal
   */
  private _disposed: boolean;

  /**
   * Constructs a new remote selection.
   *
   * @internal
   */
  constructor(
    codeEditor: Editor,
    id: string,
    classId: number,
    color: string,
    onDisposed: OnDisposed
  ) {
    this._editor = codeEditor;
    this._id = id;
    this._className = `codemirror-remote-selection-${classId}`;
    this._styleElement = RemoteSelection._addDynamicStyleElement(this._className, color);
    this._onDisposed = onDisposed;
  }

  /**
   * Gets the userland id of this selection.
   */
  public getId(): string {
    return this._id;
  }

  /**
   * Gets the start position of the selection.
   *
   * @returns
   *   The start position of the selection.
   */
  public getStartPosition(): Position {
    return {...this._startPosition};
  }

  /**
   * Gets the start position of the selection.
   *
   * @returns
   *   The start position of the selection.
   */
  public getEndPosition(): Position {
    return {...this._endPosition};
  }

  /**
   * Sets the selection using zero-based text indices.
   *
   * @param start
   *   The start offset to set the selection to.
   * @param end
   *   The end offset to set the selection to.
   */
  public setIndices(start: number, end: number): void {
    const startPosition = this._editor.posFromIndex(start);
    const endPosition = this._editor.posFromIndex(end);

    this.setPositions(startPosition, endPosition);
  }

  /**
   * Sets the selection using CodeMirrors's line / ch coordinate system.
   *
   * @param start
   *   The start position to set the selection to.
   * @param end
   *   The end position to set the selection to.
   */
  public setPositions(start: Position, end: Position): void {
    // this._decorations = this._editor.deltaDecorations(this._decorations, []);
    const ordered = RemoteSelection._swapIfNeeded(start, end);
    this._startPosition = ordered.start;
    this._endPosition = ordered.end;
    this._render();
  }

  /**
   * Makes the selection visible if it is hidden.
   */
  public show(): void {
    this._render();
  }

  /**
   * Makes the selection hidden if it is visible.
   */
  public hide(): void {
    if (this._marker) {
      this._marker.clear();
    }
  }

  /**
   * Determines if the selection has been permanently removed from the editor.
   *
   * @returns
   *   True if the selection has been disposed, false otherwise.
   */
  public isDisposed(): boolean {
    return this._disposed;
  }

  /**
   * Permanently removes the selection from the editor.
   */
  public dispose(): void {
    if (!this._disposed) {
      this._styleElement.parentElement.removeChild(this._styleElement);
      this.hide();
      this._disposed = true;
      this._onDisposed();
    }
  }

  /**
   * A helper method that actually renders the selection as a marker within
   * the CodeMirror Editor.
   *
   * @private
   * @internal
   */
  private _render(): void {
    if (this._marker) {
      this._marker.clear();
    }

    this._marker = this._editor.markText(this._startPosition, this._endPosition, {
      className: this._className
    });
  }
}
