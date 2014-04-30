var editor = ace.edit("qq");
editor.setTheme("ace/theme/eclipse");
editor.getSession().setMode("ace/mode/java");
editor.getSession().setUseWorker(false);
editor.setReadOnly(true);
editor.setFontSize("15px");
editor.renderer.setShowGutter(false);
editor.setOptions({
    maxLines: Infinity
});
var code = ace.edit("cc");
code.setTheme("ace/theme/twilight");
code.getSession().setMode("ace/mode/java");
code.setReadOnly(true);
code.getSession().setUseWorker(false);
code.setFontSize("15px");
code.renderer.setShowGutter(false);


code.setOptions({
    maxLines: Infinity
});