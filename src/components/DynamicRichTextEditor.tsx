import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
    ssr: false,
    loading: () => <div className="h-64 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded-md" />
});

export default RichTextEditor;
