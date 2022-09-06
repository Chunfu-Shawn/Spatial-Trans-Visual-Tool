import dynamic from 'next/dynamic';

function HomePage() {
    const DynamicVisualTool = dynamic(() =>
            import('../src/VisualTool.js').then((mod) => mod.VisualTool),
        {
            ssr: false,
        })
    return (
        <div>
            <h3>Welcome to Spatial-Transcriptome-Visual-Tool!</h3>
            <DynamicVisualTool/>
        </div>
    )
}

export default HomePage