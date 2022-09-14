import dynamic from 'next/dynamic';
import Link from "next/link";
import dataset from "../public/dataset.json" assert { type : 'json' };
import {useState} from "react";

function firstUpperCase(str) {
    return str.toLowerCase().replace(/( |^)[a-z]/g, (L) => L.toUpperCase());
}

export default function SingleGene() {
    const [gene,setGene] = useState('gap43')
    // after ssr and document build
    const DynamicGeneExpress = dynamic(() =>
            import('../src/SingleGeneExpressionModule.js').then(
                (mod) => mod.SingleGeneExpressionModule),
        {
            ssr: false,
        })
    const onSearch = (value) => setGene(value);
    return (
        <div style={{margin:50}}>
            <h3 >Welcome to Spatial-Transcriptome-Visual-Tool!</h3>
            <Link href={"/"}><a>Back to Home</a></Link>
            <h3>{gene} expression pattern</h3>
            <DynamicGeneExpress setCustom={true} width={400} height={400} dataset={dataset} gene={firstUpperCase(gene)}/>
        </div>
    )
}