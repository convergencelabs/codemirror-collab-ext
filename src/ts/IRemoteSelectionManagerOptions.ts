/*
 * Copyright (c) 2019 Convergence Labs, Inc.
 *
 * This file is part of the CodeMirror Collaborative Extensions, which is
 * released under the terms of the MIT license. A copy of the MIT license
 * is usually provided as part of this source code package in the LICENCE
 * file. If it was not, please see <https://opensource.org/licenses/MIT>
 */

/**
 * The IRemoteSelectionManagerOptions represents the options that
 * configure the behavior a the RemoteSelectionManager.
 */
import {Editor} from "codemirror";

export interface IRemoteSelectionManagerOptions {
  /**
   * The CodeMirror Editor instance to render the remote selections into.
   */
  editor: Editor;
}