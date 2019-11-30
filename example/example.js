const sourceUser = {
  id: "source",
  label: "Source User",
  color: "orange"
};

const staticUser = {
  id: "static",
  label: "Static User",
  color: "blue"
};

const sourceEditorTextArea = document.getElementById("source-editor");
const sourceEditor = new CodeMirror(sourceEditorTextArea, {
  mode: "javascript",
  lineNumbers: true,
  value: editorContents
});

const targetEditorTextArea = document.getElementById("target-editor");
const targetEditor = new CodeMirror(targetEditorTextArea, {
  mode: "javascript",
  lineNumbers: true,
  value: editorContents
});

const remoteCursorManager = new CodeMirrorCollabExt.RemoteCursorManager({
  editor: targetEditor,
  tooltips: true,
  tooltipDuration: 2
});
const sourceUserCursor = remoteCursorManager.addCursor(sourceUser.id, sourceUser.color, sourceUser.label);
sourceUserCursor.hide();
const staticUserCursor = remoteCursorManager.addCursor(staticUser.id, staticUser.color, staticUser.label);

staticUserCursor.setIndex(50);

const remoteSelectionManager = new CodeMirrorCollabExt.RemoteSelectionManager({editor: targetEditor});
const sourceUserSelection = remoteSelectionManager.addSelection(sourceUser.id, sourceUser.color);
remoteSelectionManager.addSelection(staticUser.id, staticUser.color);


sourceEditor.on("cursorActivity", () => {
  setTimeout(() => {
    sourceUserCursor.setPosition(sourceEditor.getCursor());
    sourceUserCursor.show();

    sourceUserSelection.setPositions(
      sourceEditor.getCursor("from"),
      sourceEditor.getCursor("to")
    );
  }, 0);
});

const targetContentManager = new CodeMirrorCollabExt.EditorContentManager({
  editor: targetEditor,
  id: "target"
});

const sourceContentManager = new CodeMirrorCollabExt.EditorContentManager({
  editor: sourceEditor,
  id: "source",
  onInsert(index, text) {
   targetContentManager.insert(index, text);
  },
  onReplace(index, length, text) {
    targetContentManager.replace(index, length, text);
  },
  onDelete(index, length) {
   targetContentManager.delete(index, length);
  }
});

