import dynamic from 'next/dynamic';
import Link from 'next/link'
import dataset from '../public/dataset.json' assert { type : 'json' }

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
            <div style={{margin:50}}>
                <DynamicVisualTool setCustom={true} width={1200} dataset={dataset}/>
            </div>
        </div>
    )
}