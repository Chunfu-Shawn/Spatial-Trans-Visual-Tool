import dynamic from 'next/dynamic';
import Link from "next/link";

export default function SingleGene() {
    // after ssr and document build
    const DynamicVisualTool = dynamic(() =>
            import('../src/VisualTool.js').then((mod) => mod.VisualTool),
        {
            ssr: false,
        })
    return (
        <div>
            <h3 style={{margin:50}}>Welcome to Spatial-Transcriptome-Visual-Tool!</h3>
            <Link href={"/"}><a style={{margin:50}}>Back to Home</a></Link>
            <div style={{margin:50}}>
                <DynamicVisualTool/>
            </div>
        </div>
    )
}