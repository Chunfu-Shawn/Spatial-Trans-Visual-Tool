import dynamic from 'next/dynamic';
import Link from "next/link";
import dataset from "../public/dataset.json" assert { type : 'json' };

export default function SingleGene() {
    // after ssr and document build
    const DynamicGeneExpress = dynamic(() =>
            import('../src/SingleGeneExpressionModule.js').then(
                (mod) => mod.SingleGeneExpressionModule),
        {
            ssr: false,
        })
    return (
        <div style={{margin:50}}>
            <h3 >Welcome to Spatial-Transcriptome-Visual-Tool!</h3>
            <Link href={"/"}><a>Back to Home</a></Link>
            <h3>Id2 expression pattern</h3>
            <DynamicGeneExpress setCustom={true} width={400} height={400} dataset={dataset} gene={"Id2"}/>
        </div>
    )
}