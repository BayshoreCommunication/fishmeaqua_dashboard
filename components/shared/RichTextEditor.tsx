"use client";

import { Editor } from "@tinymce/tinymce-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  height?: number;
}

// Self-hosted TinyMCE — assets are copied into public/tinymce on `npm install`
// (see scripts/copy-tinymce.mjs), so this needs no Tiny Cloud API key and
// shows no eval-mode nag banner.
const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  height = 320,
}: RichTextEditorProps) => {
  return (
    <Editor
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      licenseKey="gpl"
      value={value}
      onEditorChange={onChange}
      init={{
        height,
        menubar: false,
        statusbar: false,
        placeholder,
        plugins: ["lists", "link", "autolink"],
        toolbar:
          "bold italic underline | bullist numlist | link | alignleft aligncenter alignright | removeformat",
        content_style:
          "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; }",
        branding: false,
      }}
    />
  );
};

export default RichTextEditor;
