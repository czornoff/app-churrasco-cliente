'use client';

import React, { useEffect, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

interface CKEditorWrapperProps {
    value: string;
    onChange: (data: string) => void;
}

export default function CKEditorWrapper({ value, onChange }: CKEditorWrapperProps) {
    return (
        <div className="prose-editor">
            <style jsx global>{`
                .ck-editor__editable_inline {
                    min-height: 300px;
                }
                .ck-editor__editable {
                    background-color: transparent !important;
                }
                :root[class~="dark"] .ck-editor__editable {
                    color: #e2e8f0;
                    background-color: #18181b !important;
                }
                :root[class~="dark"] .ck-toolbar {
                    background-color: #27272a !important;
                    border-color: #3f3f46 !important;
                }
                :root[class~="dark"] .ck-button {
                    color: #e2e8f0 !important;
                }
                :root[class~="dark"] .ck-button:hover {
                    background-color: #3f3f46 !important;
                }
                :root[class~="dark"] .ck-editor__main > .ck-editor__editable {
                    background-color: #18181b !important;
                    border-color: #3f3f46 !important;
                }
            `}</style>
            <CKEditor
                editor={ClassicEditor}
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
        </div>
    );
}
