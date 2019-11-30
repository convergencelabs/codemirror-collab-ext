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