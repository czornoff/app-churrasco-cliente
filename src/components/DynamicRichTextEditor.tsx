import dynamic from 'next/dynamic';

const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
    ssr: false,
    loading: () => <div className="min-h-[150px] bg-zinc-100 dark:bg-zinc-800 animate-pulse rounded-lg" />
});

export default RichTextEditor;
