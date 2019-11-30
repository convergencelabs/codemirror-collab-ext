import {Editor, Position} from "codemirror";
import {EditorContentManager} from "./EditorContentManager";
import {OnDisposed} from "./OnDisposed";
import {Validation} from "./Validation";

/**
 * This class creates the cursor and tooltip nodes and adds them
 * to CodeMirror as a widget.
 *
 * @internal
 */
export class RemoteCursorWidget {

  private readonly _id: string;
  private readonly _editor: Editor;
  private readonly _domNode: HTMLDivElement;
  private readonly _tooltipNode: HTMLDivElement | null;
  private readonly _tooltipDuration: number;
  private readonly _contentManager: EditorContentManager;

  private _position: Position;
  private _index: number;
  private _hideTimer: any;
  private readonly _onDisposed: OnDisposed;
  private _disposed: boolean;

  constructor(codeEditor: Editor,
              widgetId: string,
              color: string,
              label: string,
              tooltipEnabled: boolean,
              tooltipDuration: number,
              onDisposed: OnDisposed) {
    this._editor = codeEditor;
    this._tooltipDuration = tooltipDuration;
    this._id = `codemirror-remote-cursor-${widgetId}`;

    // Create the main node for the cursor element.
    this._domNode = document.createElement("div");
    this._domNode.className = "codemirror-remote-cursor";
    this._domNode.style.background = color;

    this._editor.addWidget({line: 0, ch: 0}, this._domNode, false);

    // Create the tooltip element if the tooltip is enabled.
    if (tooltipEnabled) {
      this._tooltipNode = document.createElement("div");
      this._tooltipNode.className = "codemirror-remote-cursor-tooltip";
      this._tooltipNode.style.background = color;
      this._tooltipNode.innerHTML = label;
      this._domNode.appendChild(this._tooltipNode);

      // we only need to listen to scroll positions to update the
      // tooltip location on scrolling.
      this._editor.on("scroll", this._updateTooltipPosition);
    } else {
      this._tooltipNode = null;
    }

    this._contentManager = new EditorContentManager({
      editor: this._editor,
      onInsert: this._onInsert,
      onReplace: this._onReplace,
      onDelete: this._onDelete,
      id: "remote-cursor-" + widgetId
    });

    this._index = 0;
    this._position = {line: 0, ch: 0};

    this._hideTimer = null;
    this._onDisposed = onDisposed;

    this._disposed = false;
  }

  public hide(): void {
    this._domNode.style.display = "none";
  }

  public show(): void {
    this._domNode.style.display = "inherit";
  }

  public setIndex(index: number): void {
    Validation.assertNumber(index, "index");

    const position = this._editor.posFromIndex(index);
    this.setPosition(position);
  }

  public setPosition(position: Position): void {
    Validation.assertPosition(position, "position");

    this._updatePosition(position);

    if (this._tooltipNode !== null) {
      setTimeout(() => this._showTooltip(), 0);
    }
  }

  public isDisposed(): boolean {
    return this._disposed;
  }

  public dispose(): void {
    if (this._disposed) {
      return;
    }

    this._editor.off("scroll", this._updateTooltipPosition);

    this._contentManager.dispose();

    this._disposed = true;
    this._onDisposed();
  }

  public getId(): string {
    return this._id;
  }

  public getPosition(): Position | null {
    return this._position;
  }

  private _updatePosition(position: Position): void {
    const cursorCoords = this._editor.cursorCoords(position, "local");
    const height = cursorCoords.bottom - cursorCoords.top;
    this._domNode.style.height = height + "px";
    this._domNode.style.left = cursorCoords.left + "px";
    this._domNode.style.top = cursorCoords.top + "px";
    this._index = this._editor.indexFromPos(position);
    this._position = position;
    console.log(this._index, this._position);
  }

  private _showTooltip(): void {
    this._updateTooltipPosition();

    if (this._hideTimer !== null) {
      clearTimeout(this._hideTimer);
    } else {
      this._setTooltipVisible(true);
    }

    this._hideTimer = setTimeout(() => {
      this._setTooltipVisible(false);
      this._hideTimer = null;
    }, this._tooltipDuration);
  }

  private _updateTooltipPosition = () => {
    const distanceFromTop = this._domNode.offsetTop - this._editor.getScrollInfo().top;
    if (distanceFromTop - this._tooltipNode.offsetHeight < 5) {
      this._tooltipNode.style.top = `${this._tooltipNode.offsetHeight - 5}px`;
    } else {
      this._tooltipNode.style.top = `-${this._tooltipNode.offsetHeight}px`;
    }

    this._tooltipNode.style.left = "0";
  }

  private _setTooltipVisible(visible: boolean): void {
    if (visible) {
      this._tooltipNode.style.opacity = "1.0";
    } else {
      this._tooltipNode.style.opacity = "0";
    }
  }

  private _onInsert = (index: number, text: string) => {
    const currentIndex = this._index;
    if (index <= currentIndex) {
      const newIndex = currentIndex + text.length;
      const position = this._editor.posFromIndex(newIndex);
      this._updatePosition(position);
    }
  }

  private _onReplace = (index: number, length: number, text: string) => {
    const currentIndex = this._index;
    if (index <= currentIndex) {
      const newIndex = (currentIndex - Math.min(currentIndex - index, length)) + text.length;
      const position = this._editor.posFromIndex(newIndex);
      this._updatePosition(position);
    }
  }

  private _onDelete = (index: number, length: number) => {
    const currentIndex = this._index;
    if (index <= currentIndex) {
      const newIndex = currentIndex - Math.min(currentIndex - index, length);
      const position = this._editor.posFromIndex(newIndex);
      this._updatePosition(position);
    }
  }
}
