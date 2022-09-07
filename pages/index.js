import dynamic from 'next/dynamic';
import Link from 'next/link'

export default function HomePage() {
    // after ssr and document build
    const DynamicVisualTool = dynamic(() =>
            import('../src/VisualTool.js').then((mod) => mod.VisualTool),
        {
            ssr: false,
        })
    return (
        <div>
            <h3 style={{margin:50}}>Welcome to Spatial-Transcriptome-Visual-Tool!</h3>
            <Link href={"/singleGene"}><a style={{margin:50}}>Click to Single Gene Pattern</a></Link>
            <div style={{marginTop:50}}>
                <DynamicVisualTool setCustom={true} width={1000} height={800}/>
            </div>
        </div>
    )
}