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
    return (
        <div style={{margin:50}}>
            <h3 >Welcome to Spatial-Transcriptome-Visual-Tool!</h3>
            <Link href={"/"}><a>Back to Home</a></Link>
            <div style={{height:"50vh"}}/>
            <h3>{gene} expression pattern</h3>
            <div style={{display:"flex",flexFlow:"row wrap"}}>
                <DynamicGeneExpress setCustom={true} width={400} height={400} dataset={dataset} gene={firstUpperCase(gene)}/>
                <DynamicGeneExpress setCustom={true} width={400} height={400} dataset={dataset} gene={firstUpperCase('brca1')}/>
                <DynamicGeneExpress setCustom={true} width={400} height={400} dataset={dataset} gene={firstUpperCase('id2')}/>
            </div>
        </div>
    )
}