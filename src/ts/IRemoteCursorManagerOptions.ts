import {Editor} from "codemirror";

/**
 * The IRemoteCursorManagerOptions interface represents the set of options that
 * configures how the RemoteCursorManager works.
 */
export interface IRemoteCursorManagerOptions {
  /**
   * The instance of the CodeMirror editor to add the remote cursors to.
   */
  editor: Editor;

  /**
   * Determines if tooltips will be shown when the cursor is moved.
   */
  tooltips?: boolean;

  /**
   * The time (in seconds) that the tooltip should remain visible after
   * it was last moved.
   */
  tooltipDuration?: number;
}