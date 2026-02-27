import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
    ssr: false,
    loading: () => <div className="h-64 bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-lg" />
});

export default RichTextEditor;
