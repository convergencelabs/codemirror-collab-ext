/*
 * Copyright (c) 2019 Convergence Labs, Inc.
 *
 * This file is part of the CodeMirror Collaborative Extensions, which is
 * released under the terms of the MIT license. A copy of the MIT license
 * is usually provided as part of this source code package in the LICENCE
 * file. If it was not, please see <https://opensource.org/licenses/MIT>
 */

import {Editor, EditorChangeCancellable, EditorChangeLinkedList} from "codemirror";
import {IEditorContentManagerOptions} from "./IEditorContentManagerOptions";
import {Validation} from "./Validation";

/**
 * The EditorContentManager facilitates listening to local content changes and
 * the playback of remote content changes into the editor.
 */
export class EditorContentManager {

  /**
   * Option defaults.
   *
   * @internal
   */
  private static readonly _DEFAULTS = {
    onInsert: () => {
      // no-op
    },
    onReplace: () => {
      // no-op
    },
    onDelete: () => {
      // no-op
    },
    remoteOrigin: "remote"
  };

  /**
   * The options that configure the EditorContentManager.
   * @internal
   */
  private readonly _options: IEditorContentManagerOptions;

  /**
   * A flag denoting if outgoing events should be suppressed.
   * @internal
   */
  private _suppress: boolean;

  private _operationQueue: IOperation[];

  /**
   * Constructs a new EditorContentManager using the supplied options.
   *
   * @param options
   *   The options that configure the EditorContentManager.
   */
  constructor(options: IEditorContentManagerOptions) {
    this._options = {...EditorContentManager._DEFAULTS, ...options};

    Validation.assertDefined(this._options, "options");
    Validation.assertDefined(this._options.editor, "options.editor");
    Validation.assertFunction(this._options.onInsert, "options.onInsert");
    Validation.assertFunction(this._options.onReplace, "options.onReplace");
    Validation.assertFunction(this._options.onDelete, "options.onDelete");

    this._options.editor.on("beforeChange", this._onBeforeChange);
    this._options.editor.on("changes", this._onChanges);

    this._operationQueue = [];
  }

  /**
   * Inserts text into the editor.
   *
   * @param index
   *   The index to insert text at.
   * @param text
   *   The text to insert.
   */
  public insert(index: number, text: string): void {
    this._suppress = true;
    const from = this._options.editor.posFromIndex(index);
    this._options.editor.replaceRange(text, from, undefined, this._options.remoteOrigin);
    this._suppress = false;
  }

  /**
   * Replaces text in the editor.
   *
   * @param index
   *   The start index of the range to replace.
   * @param length
   *   The length of the  range to replace.
   * @param text
   *   The text to insert.
   */
  public replace(index: number, length: number, text: string): void {
    this._suppress = true;
    const from = this._options.editor.posFromIndex(index);
    const to = this._options.editor.posFromIndex(index + length);
    this._options.editor.replaceRange(text, from, to, this._options.remoteOrigin);
    this._suppress = false;
  }

  /**
   * Deletes text in the editor.
   *
   * @param index
   *   The start index of the range to remove.
   * @param length
   *   The length of the  range to remove.
   */
  public delete(index: number, length: number): void {
    this._suppress = true;
    const from = this._options.editor.posFromIndex(index);
    const to = this._options.editor.posFromIndex(index + length);
    this._options.editor.replaceRange("", from, to, this._options.remoteOrigin);
    this._suppress = false;
  }

  /**
   * Disposes of the content manager, freeing any resources.
   */
  public dispose(): void {
    this._options.editor.off("beforeChange", this._onBeforeChange);
    this._options.editor.off("changes", this._onChanges);
  }

  /**
   * A helper method to process local changes from CodeMirror. Before change
   * is used because the from and to positions from code mirror are relative
   * to the state of the document before the change in the "changes" event,
   * but the document has already been changed. So we use before changes to
   * calculate the from and to index before the document is changed. This
   * method then pushes the change data into a queue that will then be
   * picked up by the "change" event.
   *
   * @param editor
   *   The editor that the change originated from.
   * @param changeObj
   *   The object that specifies the change.
   *
   * @internal
   */
  private _onBeforeChange = (editor: Editor, changeObj: EditorChangeCancellable) => {
    if (this._suppress) {
      return;
    }

    const from = editor.indexFromPos(changeObj.from);
    const to = editor.indexFromPos(changeObj.to);

    let deleted: string | null = null;
    let inserted: string | null = null;

    // Code the from and to are the same for in inserts because the
    // insert happens "at" a specific index. The delete on the other
    // hand covers a non empty range.
    if (from !== to) {
      deleted = editor.getRange(changeObj.from, changeObj.to);
    }

    // If you insert a new line you will get ["", ""] in the 'text' property
    // so if the first element in the text array is non-empty or if you have
    // more than one element, you know you have an insert.
    if (changeObj.text[0] !== "" || changeObj.text.length > 1) {
      inserted = changeObj.text.join("\n");
    }

    this._operationQueue.push({from, to, inserted, deleted});
  }

  /**
   * A helper method to process local changes from CodeMirror.
   *
   * @param _
   *   The editor that the change originated from.
   * @param changes
   *   The array of changes.
   *
   * @private
   * @internal
   */
  private _onChanges = (_: Editor, changes: EditorChangeLinkedList[]) => {
    if (this._suppress) {
      return;
    }

    changes.forEach((changeObj: EditorChangeLinkedList) => {
      const {from, to, inserted, deleted} = this._operationQueue.shift();

      if (inserted !== null && deleted === null) {
        this._options.onInsert(from, inserted);
      } else if (inserted !== null && deleted !== null) {
        this._options.onReplace(from, to - from, inserted);
      } else if (inserted === null && deleted !== null) {
        this._options.onDelete(from, to - from);
      } else {
        throw new Error("Unexpected change: " + JSON.stringify(changeObj));
      }
    });
  }
}

/**
 * @internal
 */
interface IOperation {
  from: number;
  to: number;
  inserted: string;
  deleted: string;
}
