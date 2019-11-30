/*
 * Copyright (c) 2019 Convergence Labs, Inc.
 *
 * This file is part of the CodeMirror Collaborative Extensions, which is
 * released under the terms of the MIT license. A copy of the MIT license
 * is usually provided as part of this source code package in the LICENCE
 * file. If it was not, please see <https://opensource.org/licenses/MIT>
 */

import {Editor} from "codemirror";

/**
 * The IEditorContentManagerOptions interface represents the set of options that
 * configures how the EditorContentManager behaves.
 */
export interface IEditorContentManagerOptions {
  /**
   * The instance of the CodeMirror editor to add the remote cursors to.
   */
  editor: Editor;

  /**
   * Handles cases where text was inserted into the editor.
   *
   * @param index
   *   The zero-based index where the text insert occurred.
   * @param text
   *   the text that was inserted.
   */
  onInsert?: (index: number, text: string) => void;

  /**
   * Handles cases where text was replaced in the editor.
   *
   * @param index
   *   The zero-based index at the beginning of the replaced range.
   * @param length
   *   The length of the range that was replaced.
   * @param text
   *   the text that was inserted.
   */
  onReplace?: (index: number, length: number, text: string) => void;

  /**
   * Handles cases where text was deleted from the editor.
   *
   * @param index
   *   The zero-based index at the beginning of the removed range.
   * @param length
   *   The length of the range that was removed.
   */
  onDelete?: (index: number, length: number) => void;

  /**
   * The source id that will be used when making remote edits.
   */
  remoteOrigin?: string;

  id?: string;
}
