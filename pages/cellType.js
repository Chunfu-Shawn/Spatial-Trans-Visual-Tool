import dynamic from 'next/dynamic';
import Link from "next/link";
import dataset from "../public/dataset.json" assert { type : 'json' };
import {useState} from "react";

const DynamicCellType = dynamic(() =>
        import('../src/SingleGeneExpressionModule.js').then(
            (mod) => mod.SingleGeneExpressionModule),
    {
        ssr: false,
    })

export default function CellType() {
    const [cellType,setCellType] = useState('gap43')
    // after ssr and document build

    return (
        <div style={{margin:50}}>
            <h3 >Welcome to Spatial-Transcriptome-Visual-Tool!</h3>
            <Link href={"/"}><a>Back to Home</a></Link>
            <h3>{cellType} cell type spatial location</h3>
            <div style={{display:"flex",flexFlow:"row wrap",justifyContent: "space-between"}}>
                <DynamicCellType setCustom={true} width={400} height={400} dataset={dataset} gene={firstUpperCase(gene)}/>
                <DynamicCellType setCustom={true} width={400} height={400} dataset={dataset} gene={firstUpperCase('brca1')}/>
            </div>
        </div>
    )
}