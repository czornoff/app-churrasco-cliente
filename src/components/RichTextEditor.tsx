'use client';

import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface RichTextEditorProps {
    value: string;
    onChange: (data: string) => void;
}

export default function RichTextEditor({ value, onChange }: RichTextEditorProps) {

    return (
        <>
            <style jsx global>{`
                /* Light theme - default */
                .ck.ck-editor__main > .ck-editor__editable {
                    background-color: #ffffff !important;
                    color: #1e293b !important;
                    border-color: #e2e8f0 !important;
                }
                .ck.ck-toolbar {
                    background-color: #f1f5f9 !important;
                    border-color: #e2e8f0 !important;
                }
                .ck.ck-button {
                    color: #1e293b !important;
                }
                .ck.ck-button:active,
                .ck.ck-button.ck-on {
                    background-color: #e2e8f0 !important;
                }
                .ck.ck-button:hover:not(.ck-disabled) {
                    background-color: #e2e8f0 !important;
                }
                .ck.ck-label {
                    color: #1e293b !important;
                }
                .ck-dropdown__panel {
                    background-color: #ffffff !important;
                    border-color: #e2e8f0 !important;
                    color: #1e293b !important;
                }
                .ck.ck-balloon-panel {
                    background-color: #ffffff !important;
                    border-color: #e2e8f0 !important;
                }

                /* Dark theme */
                .dark .ck.ck-editor__main > .ck-editor__editable {
                    background-color: #18181b !important;
                    color: #e2e8f0 !important;
                    border-color: #3f3f46 !important;
                }
                .dark .ck.ck-toolbar {
                    background-color: #27272a !important;
                    border-color: #3f3f46 !important;
                }
                .dark .ck.ck-button {
                    color: #e2e8f0 !important;
                }
                .dark .ck.ck-button:active,
                .dark .ck.ck-button.ck-on {
                    background-color: #3f3f46 !important;
                }
                .dark .ck.ck-button:hover:not(.ck-disabled) {
                    background-color: #3f3f46 !important;
                }
                .dark .ck.ck-editor__editable_inline {
                    color: #e2e8f0 !important;
                }
                .dark .ck.ck-content {
                    color: #e2e8f0 !important;
                }
                .dark .ck.ck-list__item {
                    color: #e2e8f0 !important;
                }
                .dark .ck.ck-label {
                    color: #e2e8f0 !important;
                }
                .dark .ck-dropdown__panel {
                    background-color: #27272a !important;
                    border-color: #3f3f46 !important;
                    color: #e2e8f0 !important;
                }
                .dark .ck.ck-balloon-panel {
                    background-color: #27272a !important;
                    border-color: #3f3f46 !important;
                }
            `}</style>
            <CKEditor
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                editor={ClassicEditor as any}
                data={value}
                onChange={(event, editor) => {
                    const data = editor.getData();
                    onChange(data);
                }}
                config={{
                    toolbar: [
                        'heading',
                        '|',
                        'bold',
                        'italic',
                        'link',
                        'bulletedList',
                        'numberedList',
                        '|',
                        'outdent',
                        'indent',
                        '|',
                        'blockQuote',
                        'insertTable',
                        'undo',
                        'redo'
                    ],
                }}
            />
        </>
    );
}
